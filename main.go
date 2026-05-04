package main

import (
	"archive/tar"
	"bufio"
	"compress/gzip"
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
)

// ── Config ────────────────────────────────────────────────────────────────────

type Config struct {
	Listen  string         `json:"listen"`
	Servers []ServerConfig `json:"servers"`
}

type ServerConfig struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Directory    string   `json:"directory"`
	Jar          string   `json:"jar"`
	JavaArgs     []string `json:"java_args"`
	Port         int      `json:"port"`
	RCONPort     int      `json:"rcon_port"`
	RCONPassword string   `json:"rcon_password"`
}

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
	Name   string `json:"name"`
	Online bool   `json:"online"`
	World  string `json:"world"`
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

type FileEntry struct {
	Name    string `json:"name"`
	IsDir   bool   `json:"is_dir"`
	Size    int64  `json:"size"`
	ModTime string `json:"mod_time"`
}

// ── Managed Server ────────────────────────────────────────────────────────────

type ManagedServer struct {
	Config     ServerConfig
	mu         sync.RWMutex
	cmd        *exec.Cmd
	stdin      io.WriteCloser
	status     ServerStatus
	startedAt  time.Time
	lines      []ConsoleLine
	clientsMu  sync.Mutex
	clients    map[chan ConsoleLine]struct{}
	currentCPU float64
	prevProc   uint64
	prevTime   time.Time
}

func NewManagedServer(cfg ServerConfig) *ManagedServer {
	return &ManagedServer{
		Config:  cfg,
		status:  StatusOffline,
		lines:   make([]ConsoleLine, 0, 1000),
		clients: make(map[chan ConsoleLine]struct{}),
	}
}

func (s *ManagedServer) Start() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.status == StatusOnline || s.status == StatusStarting {
		return fmt.Errorf("server already running")
	}
	args := append(append([]string{}, s.Config.JavaArgs...), "-jar", s.Config.Jar, "nogui")
	cmd := exec.Command("java", args...)
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
	if s.stdin == nil {
		return fmt.Errorf("no stdin")
	}
	_, err := fmt.Fprintln(s.stdin, cmd)
	return err
}

func (s *ManagedServer) readOutput(r io.Reader) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		raw := scanner.Text()
		cl := parseLine(raw)
		s.mu.Lock()
		if s.status == StatusStarting && strings.Contains(raw, "Done (") {
			s.status = StatusOnline
		}
		if len(s.lines) >= 2000 {
			s.lines = s.lines[500:]
		}
		s.lines = append(s.lines, cl)
		s.mu.Unlock()
		s.broadcast(cl)
	}
}

func (s *ManagedServer) waitProcess() {
	if s.cmd != nil {
		s.cmd.Wait()
	}
	s.mu.Lock()
	s.status = StatusOffline
	s.cmd = nil
	s.stdin = nil
	s.mu.Unlock()
	s.broadcast(ConsoleLine{
		Time:    time.Now().Format("15:04:05"),
		Level:   "INFO",
		Message: "Server process exited.",
	})
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

func (s *ManagedServer) UpdateStats() {
	pid := s.PID()
	if pid == 0 {
		s.mu.Lock()
		s.currentCPU = 0
		s.mu.Unlock()
		return
	}
	data, err := os.ReadFile(fmt.Sprintf("/proc/%d/stat", pid))
	if err != nil {
		return
	}
	fields := strings.Fields(string(data))
	if len(fields) < 15 {
		return
	}
	utime, _ := strconv.ParseUint(fields[13], 10, 64)
	stime, _ := strconv.ParseUint(fields[14], 10, 64)
	proc := utime + stime
	now := time.Now()

	s.mu.Lock()
	if !s.prevTime.IsZero() {
		elapsed := now.Sub(s.prevTime).Seconds()
		if elapsed > 0 {
			s.currentCPU = float64(proc-s.prevProc) / 100.0 / elapsed * 100.0
		}
	}
	s.prevProc = proc
	s.prevTime = now
	s.mu.Unlock()
}

// ── RCON ──────────────────────────────────────────────────────────────────────

type rconClient struct {
	addr     string
	password string
}

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

func parseLine(raw string) ConsoleLine {
	cl := ConsoleLine{
		Time:    time.Now().Format("15:04:05"),
		Level:   "INFO",
		Message: raw,
	}
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
}

func NewApp(cfg Config) *App {
	app := &App{servers: make(map[string]*ManagedServer)}
	for _, sc := range cfg.Servers {
		app.servers[sc.ID] = NewManagedServer(sc)
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
		pid := ms.PID()
		var ram int64
		if pid > 0 {
			ram = readProcRAM(pid)
		}
		props := readServerProperties(ms.Config.Directory)
		maxPlayers := 20
		if v := props["max-players"]; v != "" {
			if n, err := strconv.Atoi(v); err == nil {
				maxPlayers = n
			}
		}
		version := props["version"]

		players := 0
		if ms.Status() == StatusOnline && ms.Config.RCONPort > 0 {
			rc := &rconClient{
				addr:     fmt.Sprintf("localhost:%d", ms.Config.RCONPort),
				password: ms.Config.RCONPassword,
			}
			if resp, err := rc.Execute("list"); err == nil {
				fmt.Sscanf(resp, "There are %d", &players)
			}
		}

		ms.mu.RLock()
		cpu := ms.currentCPU
		ms.mu.RUnlock()

		result = append(result, Server{
			ID:         ms.Config.ID,
			Name:       ms.Config.Name,
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
	var players []Player

	if ms.Status() == StatusOnline && ms.Config.RCONPort > 0 {
		rc := &rconClient{
			addr:     fmt.Sprintf("localhost:%d", ms.Config.RCONPort),
			password: ms.Config.RCONPassword,
		}
		if resp, err := rc.Execute("list"); err == nil {
			if idx := strings.Index(resp, ": "); idx >= 0 {
				for _, name := range strings.Split(resp[idx+2:], ", ") {
					name = strings.TrimSpace(name)
					if name != "" {
						players = append(players, Player{Name: name, Online: true, World: "world"})
					}
				}
			}
		}
	}

	// Merge usercache.json for offline players
	if raw, err := os.ReadFile(filepath.Join(ms.Config.Directory, "usercache.json")); err == nil {
		var cache []struct {
			Name string `json:"name"`
		}
		if json.Unmarshal(raw, &cache) == nil {
			online := make(map[string]bool)
			for _, p := range players {
				online[p.Name] = true
			}
			for _, c := range cache {
				if !online[c.Name] {
					players = append(players, Player{Name: c.Name, Online: false})
				}
			}
		}
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
	dir := filepath.Join(ms.Config.Directory, "plugins")
	entries, err := os.ReadDir(dir)
	if err != nil {
		jsonResp(w, []Plugin{})
		return
	}
	var plugins []Plugin
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".jar") {
			continue
		}
		plugins = append(plugins, Plugin{
			Name:    strings.TrimSuffix(e.Name(), ".jar"),
			Enabled: true,
		})
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
		files = append(files, FileEntry{
			Name:    e.Name(),
			IsDir:   e.IsDir(),
			Size:    size,
			ModTime: modTime,
		})
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
		backups = append(backups, Backup{
			ID: e.Name(), Name: e.Name(), Size: size, CreatedAt: mod,
		})
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
	worldDir := filepath.Join(ms.Config.Directory, "world")
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
	pid := ms.PID()
	var ram int64
	if pid > 0 {
		ram = readProcRAM(pid)
	}
	ms.mu.RLock()
	cpu := ms.currentCPU
	ms.mu.RUnlock()
	jsonResp(w, map[string]any{
		"cpu":    cpu,
		"ram":    ram,
		"uptime": ms.Uptime(),
	})
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
					ID:           "survival",
					Name:         "Survival SMP",
					Directory:    "/opt/minecraft/survival",
					Jar:          "server.jar",
					JavaArgs:     []string{"-Xmx4G", "-Xms1G"},
					Port:         25565,
					RCONPort:     25575,
					RCONPassword: "changeme",
				},
			},
		}
		out, _ := json.MarshalIndent(sample, "", "  ")
		os.WriteFile(path, out, 0644)
		log.Printf("Created sample config at %s — edit it to point to your server directories.", path)
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

	app := NewApp(cfg)

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

	log.Printf("CraftPanel on %s", cfg.Listen)
	log.Fatal(http.ListenAndServe(cfg.Listen, mux))
}
