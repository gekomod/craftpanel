package main

import (
	"archive/tar"
	"bufio"
	"compress/gzip"
	"database/sql"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "modernc.org/sqlite"
)

// ── Config ────────────────────────────────────────────────────────────────────

type Config struct {
	Listen  string         `json:"listen"`
	Servers []ServerConfig `json:"servers"`
}

// Type is "java" or "bedrock"
type ServerConfig struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Type         string   `json:"type"`
	Directory    string   `json:"directory"`
	Jar          string   `json:"jar"`
	Executable   string   `json:"executable"`
	JavaArgs     []string `json:"java_args"`
	Port         int      `json:"port"`
	RCONPort     int      `json:"rcon_port"`
	RCONPassword string   `json:"rcon_password"`
}

func (c ServerConfig) IsJava() bool    { return c.Type != "bedrock" }
func (c ServerConfig) IsBedrock() bool { return c.Type == "bedrock" }

// ── Types ─────────────────────────────────────────────────────────────────────

type ServerStatus string

const (
	StatusOnline   ServerStatus = "online"
	StatusOffline  ServerStatus = "offline"
	StatusStarting ServerStatus = "starting"
	StatusStopping ServerStatus = "stopping"
)

type Server struct {
	ID         string       `json:"id"`
	Name       string       `json:"name"`
	Type       string       `json:"type"`
	Status     ServerStatus `json:"status"`
	Version    string       `json:"version"`
	Players    int          `json:"players"`
	MaxPlayers int          `json:"max_players"`
	CPU        float64      `json:"cpu"`
	RAM        int64        `json:"ram"`
	RAMMax     int64        `json:"ram_max"`
	Uptime     int64        `json:"uptime"`
	Port       int          `json:"port"`
}

type Player struct {
	Name       string `json:"name"`
	Identifier string `json:"identifier"` // UUID (Java) or XUID (Bedrock)
	Online     bool   `json:"online"`
	World      string `json:"world"`
	JoinedAt   string `json:"joined_at,omitempty"`
}

type Plugin struct {
	Name    string `json:"name"`
	Version string `json:"version"`
	Enabled bool   `json:"enabled"`
}

type Backup struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	CreatedAt string `json:"created_at"`
}

type ConsoleLine struct {
	Time    string `json:"time"`
	Level   string `json:"level"`
	Message string `json:"message"`
}

type StatPoint struct {
	CPU     float64 `json:"cpu"`
	RAM     int64   `json:"ram"`
	Players int     `json:"players"`
	TS      int64   `json:"ts"`
}

type FileEntry struct {
	Name    string `json:"name"`
	IsDir   bool   `json:"is_dir"`
	Size    int64  `json:"size"`
	ModTime string `json:"mod_time"`
}

// ── Database ──────────────────────────────────────────────────────────────────

type DB struct {
	db *sql.DB
}

func OpenDB(path string) (*DB, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1) // SQLite: single writer
	d := &DB{db: db}
	return d, d.migrate()
}

func (d *DB) migrate() error {
	_, err := d.db.Exec(`
	CREATE TABLE IF NOT EXISTS console_lines (
		id       INTEGER PRIMARY KEY,
		server_id TEXT NOT NULL,
		time     TEXT NOT NULL,
		level    TEXT NOT NULL,
		message  TEXT NOT NULL,
		ts       INTEGER NOT NULL
	);
	CREATE INDEX IF NOT EXISTS idx_console ON console_lines(server_id, ts);

	CREATE TABLE IF NOT EXISTS player_sessions (
		id         INTEGER PRIMARY KEY,
		server_id  TEXT NOT NULL,
		name       TEXT NOT NULL,
		identifier TEXT,
		joined_at  INTEGER NOT NULL,
		left_at    INTEGER
	);
	CREATE INDEX IF NOT EXISTS idx_sessions ON player_sessions(server_id, name);

	CREATE TABLE IF NOT EXISTS server_stats (
		id        INTEGER PRIMARY KEY,
		server_id TEXT NOT NULL,
		cpu       REAL,
		ram       INTEGER,
		players   INTEGER,
		ts        INTEGER NOT NULL
	);
	CREATE INDEX IF NOT EXISTS idx_stats ON server_stats(server_id, ts);
	`)
	return err
}

func (d *DB) SaveLine(serverID string, cl ConsoleLine) {
	d.db.Exec(`INSERT INTO console_lines(server_id,time,level,message,ts) VALUES(?,?,?,?,?)`,
		serverID, cl.Time, cl.Level, cl.Message, time.Now().Unix())
	// Prune old lines (keep last 10000 per server)
	d.db.Exec(`DELETE FROM console_lines WHERE server_id=? AND id NOT IN (SELECT id FROM console_lines WHERE server_id=? ORDER BY id DESC LIMIT 10000)`,
		serverID, serverID)
}

func (d *DB) GetLines(serverID string, limit int) []ConsoleLine {
	rows, err := d.db.Query(
		`SELECT time,level,message FROM console_lines WHERE server_id=? ORDER BY id DESC LIMIT ?`,
		serverID, limit)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var lines []ConsoleLine
	for rows.Next() {
		var cl ConsoleLine
		rows.Scan(&cl.Time, &cl.Level, &cl.Message)
		lines = append(lines, cl)
	}
	// Reverse to chronological order
	for i, j := 0, len(lines)-1; i < j; i, j = i+1, j-1 {
		lines[i], lines[j] = lines[j], lines[i]
	}
	return lines
}

func (d *DB) PlayerJoin(serverID, name, identifier string) {
	d.db.Exec(`INSERT INTO player_sessions(server_id,name,identifier,joined_at) VALUES(?,?,?,?)`,
		serverID, name, identifier, time.Now().Unix())
}

func (d *DB) PlayerLeave(serverID, name string) {
	d.db.Exec(`UPDATE player_sessions SET left_at=? WHERE server_id=? AND name=? AND left_at IS NULL`,
		time.Now().Unix(), serverID, name)
}

func (d *DB) GetPlayers(serverID string) []Player {
	rows, err := d.db.Query(`
		SELECT name, identifier, MAX(joined_at), left_at
		FROM player_sessions WHERE server_id=?
		GROUP BY name ORDER BY joined_at DESC LIMIT 200`, serverID)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var players []Player
	for rows.Next() {
		var p Player
		var joinedAt int64
		var leftAt sql.NullInt64
		rows.Scan(&p.Name, &p.Identifier, &joinedAt, &leftAt)
		p.Online = !leftAt.Valid
		if joinedAt > 0 {
			p.JoinedAt = time.Unix(joinedAt, 0).Format(time.RFC3339)
		}
		players = append(players, p)
	}
	return players
}

func (d *DB) SaveStat(serverID string, cpu float64, ram int64, players int) {
	d.db.Exec(`INSERT INTO server_stats(server_id,cpu,ram,players,ts) VALUES(?,?,?,?,?)`,
		serverID, cpu, ram, players, time.Now().Unix())
	// Keep last 2016 points (~1 week at 5s intervals)
	d.db.Exec(`DELETE FROM server_stats WHERE server_id=? AND id NOT IN (SELECT id FROM server_stats WHERE server_id=? ORDER BY id DESC LIMIT 2016)`,
		serverID, serverID)
}

func (d *DB) GetStats(serverID string, limit int) []StatPoint {
	rows, err := d.db.Query(
		`SELECT cpu,ram,players,ts FROM server_stats WHERE server_id=? ORDER BY ts DESC LIMIT ?`,
		serverID, limit)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var points []StatPoint
	for rows.Next() {
		var p StatPoint
		rows.Scan(&p.CPU, &p.RAM, &p.Players, &p.TS)
		points = append(points, p)
	}
	for i, j := 0, len(points)-1; i < j; i, j = i+1, j-1 {
		points[i], points[j] = points[j], points[i]
	}
	return points
}

// ── Managed Server ────────────────────────────────────────────────────────────

type ManagedServer struct {
	Config        ServerConfig
	db            *DB
	mu            sync.RWMutex
	cmd           *exec.Cmd
	stdin         io.WriteCloser
	status        ServerStatus
	startedAt     time.Time
	lines         []ConsoleLine
	clientsMu     sync.Mutex
	clients       map[chan ConsoleLine]struct{}
	currentCPU    float64
	currentRAM    int64
	prevProc      uint64
	prevTime      time.Time
	onlinePlayers map[string]string // name → identifier (live tracking from logs)
}

func NewManagedServer(cfg ServerConfig, db *DB) *ManagedServer {
	return &ManagedServer{
		Config:        cfg,
		db:            db,
		status:        StatusOffline,
		lines:         db.GetLines(cfg.ID, 500),
		clients:       make(map[chan ConsoleLine]struct{}),
		onlinePlayers: make(map[string]string),
	}
}

func (s *ManagedServer) Start() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.status == StatusOnline || s.status == StatusStarting {
		return fmt.Errorf("server already running")
	}

	var cmd *exec.Cmd
	if s.Config.IsBedrock() {
		exe := s.Config.Executable
		if exe == "" {
			exe = "./bedrock_server"
		}
		cmd = exec.Command(exe)
		cmd.Env = append(os.Environ(), "LD_LIBRARY_PATH=.")
	} else {
		args := append(append([]string{}, s.Config.JavaArgs...), "-jar", s.Config.Jar, "nogui")
		cmd = exec.Command("java", args...)
	}
	cmd.Dir = s.Config.Directory

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return err
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}
	if err := cmd.Start(); err != nil {
		return err
	}

	s.cmd = cmd
	s.stdin = stdin
	s.status = StatusStarting
	s.startedAt = time.Now()
	s.onlinePlayers = make(map[string]string)

	go s.readOutput(stdout)
	go s.readOutput(stderr)
	go s.waitProcess()
	return nil
}

func (s *ManagedServer) Stop() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.status == StatusOffline {
		return fmt.Errorf("server not running")
	}
	s.status = StatusStopping
	if s.stdin != nil {
		fmt.Fprintln(s.stdin, "stop")
	}
	return nil
}

func (s *ManagedServer) Kill() error {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.cmd != nil && s.cmd.Process != nil {
		return s.cmd.Process.Kill()
	}
	return nil
}

func (s *ManagedServer) SendCommand(cmd string) error {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.status != StatusOnline && s.status != StatusStarting {
		return fmt.Errorf("server not running")
	}
	_, err := fmt.Fprintln(s.stdin, cmd)
	return err
}

func (s *ManagedServer) readOutput(r io.Reader) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		raw := scanner.Text()
		cl := parseLine(raw, s.Config.IsBedrock())

		s.mu.Lock()
		// Detect started
		if s.status == StatusStarting {
			if s.Config.IsJava() && strings.Contains(raw, "Done (") {
				s.status = StatusOnline
			}
			if s.Config.IsBedrock() && (strings.Contains(raw, "Server started") || strings.Contains(raw, "IPv4 supported")) {
				s.status = StatusOnline
			}
		}
		// Track players from logs
		s.trackPlayerFromLog(raw)

		if len(s.lines) >= 2000 {
			s.lines = s.lines[500:]
		}
		s.lines = append(s.lines, cl)
		s.mu.Unlock()

		s.db.SaveLine(s.Config.ID, cl)
		s.broadcast(cl)
	}
}

// trackPlayerFromLog must be called with s.mu write-locked
func (s *ManagedServer) trackPlayerFromLog(raw string) {
	if s.Config.IsBedrock() {
		// Bedrock: "Player connected: NAME, xuid: XUID"
		if idx := strings.Index(raw, "Player connected: "); idx >= 0 {
			rest := raw[idx+18:]
			parts := strings.SplitN(rest, ", xuid: ", 2)
			name := strings.TrimSpace(parts[0])
			xuid := ""
			if len(parts) == 2 {
				xuid = strings.TrimSpace(parts[1])
			}
			s.onlinePlayers[name] = xuid
			go s.db.PlayerJoin(s.Config.ID, name, xuid)
		}
		if idx := strings.Index(raw, "Player disconnected: "); idx >= 0 {
			rest := raw[idx+21:]
			name := strings.TrimSpace(strings.SplitN(rest, ",", 2)[0])
			delete(s.onlinePlayers, name)
			go s.db.PlayerLeave(s.Config.ID, name)
		}
	} else {
		// Java fallback (when RCON unavailable)
		if strings.HasSuffix(raw, " joined the game") {
			if i := strings.LastIndex(raw, ": "); i >= 0 {
				name := strings.TrimSuffix(raw[i+2:], " joined the game")
				if !strings.Contains(name, " ") {
					s.onlinePlayers[name] = ""
					go s.db.PlayerJoin(s.Config.ID, name, "")
				}
			}
		}
		if strings.HasSuffix(raw, " left the game") {
			if i := strings.LastIndex(raw, ": "); i >= 0 {
				name := strings.TrimSuffix(raw[i+2:], " left the game")
				if !strings.Contains(name, " ") {
					delete(s.onlinePlayers, name)
					go s.db.PlayerLeave(s.Config.ID, name)
				}
			}
		}
	}
}

func (s *ManagedServer) waitProcess() {
	if s.cmd != nil {
		s.cmd.Wait()
	}
	s.mu.Lock()
	// Mark all online players as left
	for name := range s.onlinePlayers {
		go s.db.PlayerLeave(s.Config.ID, name)
	}
	s.onlinePlayers = make(map[string]string)
	s.status = StatusOffline
	s.cmd = nil
	s.stdin = nil
	s.mu.Unlock()

	cl := ConsoleLine{Time: time.Now().Format("15:04:05"), Level: "INFO", Message: "Server process exited."}
	s.db.SaveLine(s.Config.ID, cl)
	s.broadcast(cl)
}

func (s *ManagedServer) broadcast(line ConsoleLine) {
	s.clientsMu.Lock()
	defer s.clientsMu.Unlock()
	for ch := range s.clients {
		select {
		case ch <- line:
		default:
		}
	}
}

func (s *ManagedServer) Subscribe() chan ConsoleLine {
	ch := make(chan ConsoleLine, 256)
	s.clientsMu.Lock()
	s.clients[ch] = struct{}{}
	s.clientsMu.Unlock()
	return ch
}

func (s *ManagedServer) Unsubscribe(ch chan ConsoleLine) {
	s.clientsMu.Lock()
	delete(s.clients, ch)
	s.clientsMu.Unlock()
}

func (s *ManagedServer) RecentLines() []ConsoleLine {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]ConsoleLine, len(s.lines))
	copy(out, s.lines)
	return out
}

func (s *ManagedServer) Status() ServerStatus {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.status
}

func (s *ManagedServer) PID() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.cmd != nil && s.cmd.Process != nil {
		return s.cmd.Process.Pid
	}
	return 0
}

func (s *ManagedServer) Uptime() int64 {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.status == StatusOffline {
		return 0
	}
	return int64(time.Since(s.startedAt).Seconds())
}

func (s *ManagedServer) OnlineCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.onlinePlayers)
}

func (s *ManagedServer) UpdateStats() {
	pid := s.PID()
	var cpu float64
	var ram int64

	if pid > 0 {
		cpu = s.calcCPU(pid)
		ram = readProcRAM(pid)
	}

	s.mu.Lock()
	s.currentCPU = cpu
	s.currentRAM = ram
	players := len(s.onlinePlayers)
	s.mu.Unlock()

	s.db.SaveStat(s.Config.ID, cpu, ram, players)
}

func (s *ManagedServer) calcCPU(pid int) float64 {
	data, err := os.ReadFile(fmt.Sprintf("/proc/%d/stat", pid))
	if err != nil {
		return 0
	}
	fields := strings.Fields(string(data))
	if len(fields) < 15 {
		return 0
	}
	utime, _ := strconv.ParseUint(fields[13], 10, 64)
	stime, _ := strconv.ParseUint(fields[14], 10, 64)
	proc := utime + stime
	now := time.Now()

	s.mu.Lock()
	var cpu float64
	if !s.prevTime.IsZero() {
		elapsed := now.Sub(s.prevTime).Seconds()
		if elapsed > 0 {
			cpu = float64(proc-s.prevProc) / 100.0 / elapsed * 100.0
		}
	}
	s.prevProc = proc
	s.prevTime = now
	s.mu.Unlock()
	return cpu
}

// ── RCON ──────────────────────────────────────────────────────────────────────

type rconClient struct{ addr, password string }

func (rc *rconClient) Execute(cmd string) (string, error) {
	conn, err := net.DialTimeout("tcp", rc.addr, 3*time.Second)
	if err != nil {
		return "", err
	}
	defer conn.Close()
	conn.SetDeadline(time.Now().Add(8 * time.Second))
	if err := rconSend(conn, 1, 3, rc.password); err != nil {
		return "", err
	}
	authID, _, _, err := rconRead(conn)
	if err != nil {
		return "", err
	}
	if authID == -1 {
		return "", fmt.Errorf("rcon auth failed")
	}
	if err := rconSend(conn, 2, 2, cmd); err != nil {
		return "", err
	}
	_, _, body, err := rconRead(conn)
	return body, err
}

func rconSend(conn net.Conn, id, typ int32, body string) error {
	length := int32(4 + 4 + len(body) + 2)
	buf := make([]byte, 4+length)
	binary.LittleEndian.PutUint32(buf[0:], uint32(length))
	binary.LittleEndian.PutUint32(buf[4:], uint32(id))
	binary.LittleEndian.PutUint32(buf[8:], uint32(typ))
	copy(buf[12:], body)
	_, err := conn.Write(buf)
	return err
}

func rconRead(conn net.Conn) (id, typ int32, body string, err error) {
	var length int32
	if err = binary.Read(conn, binary.LittleEndian, &length); err != nil {
		return
	}
	data := make([]byte, length)
	if _, err = io.ReadFull(conn, data); err != nil {
		return
	}
	id = int32(binary.LittleEndian.Uint32(data[0:4]))
	typ = int32(binary.LittleEndian.Uint32(data[4:8]))
	body = strings.TrimRight(string(data[8:]), "\x00")
	return
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func parseLine(raw string, bedrock bool) ConsoleLine {
	cl := ConsoleLine{
		Time:    time.Now().Format("15:04:05"),
		Level:   "INFO",
		Message: raw,
	}
	if bedrock {
		// [2026-01-01 12:00:00 INFO] message
		if len(raw) > 22 && raw[0] == '[' {
			end := strings.Index(raw, "]")
			if end > 0 {
				inside := raw[1:end]
				parts := strings.Fields(inside)
				if len(parts) >= 3 {
					cl.Time = parts[1]
					cl.Level = parts[2]
				}
				cl.Message = strings.TrimSpace(raw[end+1:])
			}
		}
	} else {
		// [HH:MM:SS] [Thread/LEVEL]: message
		if len(raw) > 10 && raw[0] == '[' {
			end := strings.Index(raw, "]")
			if end > 0 && end < 12 {
				cl.Time = raw[1:end]
				rest := strings.TrimSpace(raw[end+1:])
				if strings.HasPrefix(rest, "[") {
					end2 := strings.Index(rest, "]")
					if end2 > 0 {
						bracket := rest[1:end2]
						if idx := strings.LastIndex(bracket, "/"); idx >= 0 {
							cl.Level = bracket[idx+1:]
						}
						cl.Message = strings.TrimPrefix(rest[end2+1:], ": ")
					}
				}
			}
		}
	}
	switch strings.ToUpper(cl.Level) {
	case "WARN", "WARNING":
		cl.Level = "WARN"
	case "ERROR", "SEVERE", "FATAL":
		cl.Level = "ERROR"
	default:
		cl.Level = "INFO"
	}
	return cl
}

func readServerProperties(dir string) map[string]string {
	props := make(map[string]string)
	data, err := os.ReadFile(filepath.Join(dir, "server.properties"))
	if err != nil {
		return props
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || line[0] == '#' {
			continue
		}
		if idx := strings.IndexByte(line, '='); idx >= 0 {
			props[line[:idx]] = line[idx+1:]
		}
	}
	return props
}

func readMaxRAM(args []string) int64 {
	for _, a := range args {
		if strings.HasPrefix(a, "-Xmx") {
			val := a[4:]
			mult := int64(1)
			if strings.HasSuffix(val, "G") {
				mult = 1024
				val = val[:len(val)-1]
			} else if strings.HasSuffix(val, "M") {
				val = val[:len(val)-1]
			}
			n, _ := strconv.ParseInt(val, 10, 64)
			return n * mult
		}
	}
	return 0
}

func readProcRAM(pid int) int64 {
	data, err := os.ReadFile(fmt.Sprintf("/proc/%d/status", pid))
	if err != nil {
		return 0
	}
	for _, line := range strings.Split(string(data), "\n") {
		if strings.HasPrefix(line, "VmRSS:") {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				kb, _ := strconv.ParseInt(fields[1], 10, 64)
				return kb / 1024
			}
		}
	}
	return 0
}

func jsonResp(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func safePath(base, sub string) (string, error) {
	target := filepath.Clean(filepath.Join(base, sub))
	if !strings.HasPrefix(target+string(filepath.Separator), base+string(filepath.Separator)) {
		return "", fmt.Errorf("forbidden")
	}
	return target, nil
}

// ── App ───────────────────────────────────────────────────────────────────────

type App struct {
	mu      sync.RWMutex
	servers map[string]*ManagedServer
	db      *DB
}

func NewApp(cfg Config, db *DB) *App {
	app := &App{servers: make(map[string]*ManagedServer), db: db}
	for _, sc := range cfg.Servers {
		app.servers[sc.ID] = NewManagedServer(sc, db)
	}
	return app
}

func (a *App) get(id string) (*ManagedServer, bool) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	s, ok := a.servers[id]
	return s, ok
}

func (a *App) all() []*ManagedServer {
	a.mu.RLock()
	defer a.mu.RUnlock()
	out := make([]*ManagedServer, 0, len(a.servers))
	for _, s := range a.servers {
		out = append(out, s)
	}
	return out
}

// ── Handlers ──────────────────────────────────────────────────────────────────

func (a *App) handleServers(w http.ResponseWriter, r *http.Request) {
	var result []Server
	for _, ms := range a.all() {
		props := readServerProperties(ms.Config.Directory)
		maxPlayers := 20
		if v := props["max-players"]; v != "" {
			if n, err := strconv.Atoi(v); err == nil {
				maxPlayers = n
			}
		}
		version := props["version"]
		if ms.Config.IsBedrock() && version == "" {
			version = props["server-name"]
		}

		players := ms.OnlineCount()

		// Java: try RCON for accurate count
		if ms.Config.IsJava() && ms.Status() == StatusOnline && ms.Config.RCONPort > 0 {
			rc := &rconClient{
				addr:     fmt.Sprintf("localhost:%d", ms.Config.RCONPort),
				password: ms.Config.RCONPassword,
			}
			if resp, err := rc.Execute("list"); err == nil {
				var n int
				fmt.Sscanf(resp, "There are %d", &n)
				players = n
			}
		}

		ms.mu.RLock()
		cpu := ms.currentCPU
		ram := ms.currentRAM
		ms.mu.RUnlock()

		stype := ms.Config.Type
		if stype == "" {
			stype = "java"
		}

		result = append(result, Server{
			ID:         ms.Config.ID,
			Name:       ms.Config.Name,
			Type:       stype,
			Status:     ms.Status(),
			Version:    version,
			Players:    players,
			MaxPlayers: maxPlayers,
			CPU:        cpu,
			RAM:        ram,
			RAMMax:     readMaxRAM(ms.Config.JavaArgs),
			Uptime:     ms.Uptime(),
			Port:       ms.Config.Port,
		})
	}
	if result == nil {
		result = []Server{}
	}
	jsonResp(w, result)
}

func (a *App) handleAction(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}
	var body struct {
		Action string `json:"action"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	var err error
	switch body.Action {
	case "start":
		err = ms.Start()
	case "stop":
		err = ms.Stop()
	case "kill":
		err = ms.Kill()
	case "restart":
		go func() {
			ms.Stop()
			for i := 0; i < 60; i++ {
				time.Sleep(time.Second)
				if ms.Status() == StatusOffline {
					break
				}
			}
			ms.Start()
		}()
	default:
		http.Error(w, "unknown action", 400)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	jsonResp(w, map[string]string{"status": "ok"})
}

func (a *App) handleCommand(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}
	var body struct {
		Command string `json:"command"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if err := ms.SendCommand(body.Command); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	jsonResp(w, map[string]string{"status": "ok"})
}

func (a *App) handleConsoleStream(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", 500)
		return
	}
	for _, line := range ms.RecentLines() {
		data, _ := json.Marshal(line)
		fmt.Fprintf(w, "data: %s\n\n", data)
	}
	flusher.Flush()

	ch := ms.Subscribe()
	defer ms.Unsubscribe(ch)
	ticker := time.NewTicker(20 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case line := <-ch:
			data, _ := json.Marshal(line)
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		case <-ticker.C:
			fmt.Fprintf(w, ": ping\n\n")
			flusher.Flush()
		}
	}
}

func (a *App) handlePlayers(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}

	// Try RCON for Java to get accurate online list
	if ms.Config.IsJava() && ms.Status() == StatusOnline && ms.Config.RCONPort > 0 {
		rc := &rconClient{
			addr:     fmt.Sprintf("localhost:%d", ms.Config.RCONPort),
			password: ms.Config.RCONPassword,
		}
		if resp, err := rc.Execute("list"); err == nil {
			ms.mu.Lock()
			ms.onlinePlayers = make(map[string]string)
			if idx := strings.Index(resp, ": "); idx >= 0 {
				for _, name := range strings.Split(resp[idx+2:], ", ") {
					name = strings.TrimSpace(name)
					if name != "" {
						ms.onlinePlayers[name] = ""
					}
				}
			}
			ms.mu.Unlock()
		}
	}

	players := a.db.GetPlayers(ms.Config.ID)

	// Merge live online status
	ms.mu.RLock()
	online := make(map[string]bool)
	for name := range ms.onlinePlayers {
		online[name] = true
	}
	ms.mu.RUnlock()

	for i := range players {
		players[i].Online = online[players[i].Name]
	}

	if players == nil {
		players = []Player{}
	}
	jsonResp(w, players)
}

func (a *App) handlePlugins(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}

	// Java → plugins/*.jar  |  Bedrock → behavior_packs/ and resource_packs/
	var plugins []Plugin
	if ms.Config.IsBedrock() {
		for _, dir := range []string{"behavior_packs", "resource_packs"} {
			entries, err := os.ReadDir(filepath.Join(ms.Config.Directory, dir))
			if err != nil {
				continue
			}
			for _, e := range entries {
				if !e.IsDir() {
					continue
				}
				plugins = append(plugins, Plugin{Name: e.Name(), Enabled: true})
			}
		}
	} else {
		entries, err := os.ReadDir(filepath.Join(ms.Config.Directory, "plugins"))
		if err != nil {
			jsonResp(w, []Plugin{})
			return
		}
		for _, e := range entries {
			if !e.IsDir() && strings.HasSuffix(e.Name(), ".jar") {
				plugins = append(plugins, Plugin{
					Name:    strings.TrimSuffix(e.Name(), ".jar"),
					Enabled: true,
				})
			}
		}
	}
	if plugins == nil {
		plugins = []Plugin{}
	}
	jsonResp(w, plugins)
}

func (a *App) handleFiles(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}
	base := filepath.Clean(ms.Config.Directory)
	target, err := safePath(base, r.URL.Query().Get("path"))
	if err != nil {
		http.Error(w, err.Error(), 403)
		return
	}
	entries, err := os.ReadDir(target)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	var files []FileEntry
	for _, e := range entries {
		info, _ := e.Info()
		var size int64
		var modTime string
		if info != nil {
			size = info.Size()
			modTime = info.ModTime().Format(time.RFC3339)
		}
		files = append(files, FileEntry{Name: e.Name(), IsDir: e.IsDir(), Size: size, ModTime: modTime})
	}
	if files == nil {
		files = []FileEntry{}
	}
	jsonResp(w, files)
}

func (a *App) handleFileContent(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}
	base := filepath.Clean(ms.Config.Directory)
	target, err := safePath(base, r.URL.Query().Get("path"))
	if err != nil {
		http.Error(w, err.Error(), 403)
		return
	}
	data, err := os.ReadFile(target)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	if len(data) > 1<<20 {
		data = data[:1<<20]
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Write(data)
}

func (a *App) handleBackups(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}
	dir := filepath.Join(ms.Config.Directory, "backups")
	entries, err := os.ReadDir(dir)
	if err != nil {
		jsonResp(w, []Backup{})
		return
	}
	var backups []Backup
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".tar.gz") {
			continue
		}
		info, _ := e.Info()
		var size int64
		var mod string
		if info != nil {
			size = info.Size()
			mod = info.ModTime().Format(time.RFC3339)
		}
		backups = append(backups, Backup{ID: e.Name(), Name: e.Name(), Size: size, CreatedAt: mod})
	}
	if backups == nil {
		backups = []Backup{}
	}
	jsonResp(w, backups)
}

func (a *App) handleCreateBackup(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}
	backupsDir := filepath.Join(ms.Config.Directory, "backups")
	if err := os.MkdirAll(backupsDir, 0755); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	filename := fmt.Sprintf("world-%s.tar.gz", time.Now().Format("2006-01-02T15-04-05"))
	outPath := filepath.Join(backupsDir, filename)
	worldDir := filepath.Join(ms.Config.Directory, "worlds")
	if ms.Config.IsJava() {
		worldDir = filepath.Join(ms.Config.Directory, "world")
	}
	go func() {
		if err := createTarGz(outPath, worldDir); err != nil {
			log.Printf("backup failed: %v", err)
		}
	}()
	jsonResp(w, map[string]string{"status": "started", "file": filename})
}

func (a *App) handleStats(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}
	ms.mu.RLock()
	cpu := ms.currentCPU
	ram := ms.currentRAM
	ms.mu.RUnlock()
	jsonResp(w, map[string]any{
		"cpu":    cpu,
		"ram":    ram,
		"uptime": ms.Uptime(),
	})
}

func (a *App) handleStatsHistory(w http.ResponseWriter, r *http.Request) {
	ms, ok := a.get(r.PathValue("id"))
	if !ok {
		http.Error(w, "not found", 404)
		return
	}
	limit := 120 // last 10 minutes at 5s intervals
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 2016 {
			limit = n
		}
	}
	points := a.db.GetStats(ms.Config.ID, limit)
	if points == nil {
		points = []StatPoint{}
	}
	jsonResp(w, points)
}

// ── Backup ────────────────────────────────────────────────────────────────────

func createTarGz(dst, src string) error {
	f, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer f.Close()
	gz := gzip.NewWriter(f)
	defer gz.Close()
	tw := tar.NewWriter(gz)
	defer tw.Close()
	base := filepath.Dir(src)
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		hdr, err := tar.FileInfoHeader(info, "")
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(base, path)
		hdr.Name = rel
		if err := tw.WriteHeader(hdr); err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()
		_, err = io.Copy(tw, file)
		return err
	})
}

// ── Config ────────────────────────────────────────────────────────────────────

func loadConfig(path string) (Config, error) {
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		sample := Config{
			Listen: ":8080",
			Servers: []ServerConfig{
				{
					ID:           "survival-java",
					Name:         "Survival SMP",
					Type:         "java",
					Directory:    "/opt/minecraft/survival",
					Jar:          "server.jar",
					JavaArgs:     []string{"-Xmx4G", "-Xms1G"},
					Port:         25565,
					RCONPort:     25575,
					RCONPassword: "changeme",
				},
				{
					ID:         "bedrock",
					Name:       "Bedrock Server",
					Type:       "bedrock",
					Directory:  "/opt/minecraft/bedrock",
					Executable: "./bedrock_server",
					Port:       19132,
				},
			},
		}
		out, _ := json.MarshalIndent(sample, "", "  ")
		os.WriteFile(path, out, 0644)
		log.Printf("Created sample config at %s — edit to point to your servers.", path)
		return sample, nil
	}
	if err != nil {
		return Config{}, err
	}
	var cfg Config
	cfg.Listen = ":8080"
	return cfg, json.Unmarshal(data, &cfg)
}

// ── Main ──────────────────────────────────────────────────────────────────────

func main() {
	cfg, err := loadConfig("craftpanel.json")
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	db, err := OpenDB("craftpanel.db")
	if err != nil {
		log.Fatalf("db: %v", err)
	}

	app := NewApp(cfg, db)

	go func() {
		t := time.NewTicker(5 * time.Second)
		for range t.C {
			for _, ms := range app.all() {
				ms.UpdateStats()
			}
		}
	}()

	mux := http.NewServeMux()
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, "static/index.html")
	})

	mux.HandleFunc("GET /api/servers", app.handleServers)
	mux.HandleFunc("POST /api/servers/{id}/action", app.handleAction)
	mux.HandleFunc("POST /api/servers/{id}/command", app.handleCommand)
	mux.HandleFunc("GET /api/servers/{id}/console/stream", app.handleConsoleStream)
	mux.HandleFunc("GET /api/servers/{id}/players", app.handlePlayers)
	mux.HandleFunc("GET /api/servers/{id}/plugins", app.handlePlugins)
	mux.HandleFunc("GET /api/servers/{id}/files", app.handleFiles)
	mux.HandleFunc("GET /api/servers/{id}/files/content", app.handleFileContent)
	mux.HandleFunc("GET /api/servers/{id}/backups", app.handleBackups)
	mux.HandleFunc("POST /api/servers/{id}/backups", app.handleCreateBackup)
	mux.HandleFunc("GET /api/servers/{id}/stats", app.handleStats)
	mux.HandleFunc("GET /api/servers/{id}/stats/history", app.handleStatsHistory)

	log.Printf("CraftPanel on %s (db: craftpanel.db)", cfg.Listen)
	log.Fatal(http.ListenAndServe(cfg.Listen, mux))
}
