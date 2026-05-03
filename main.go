package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

// ─── Types ──────────────────────────────────────────────────────────────────

type Server struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	MOTD       string  `json:"motd"`
	Icon       string  `json:"icon"`
	Version    string  `json:"version"`
	Status     string  `json:"status"`
	Players    int     `json:"players"`
	MaxPlayers int     `json:"maxPlayers"`
	CPU        float64 `json:"cpu"`
	RAM        float64 `json:"ram"`
	RAMMax     float64 `json:"ramMax"`
	TPS        float64 `json:"tps"`
	Uptime     string  `json:"uptime"`
	IP         string  `json:"ip"`
	Type       string  `json:"type"`
	Plugins    int     `json:"plugins"`
	Mods       int     `json:"mods"`
	World      string  `json:"world"`
}

type Player struct {
	Name     string `json:"name"`
	UUID     string `json:"uuid"`
	Op       bool   `json:"op"`
	Ping     int    `json:"ping"`
	Playtime string `json:"playtime"`
	Joined   string `json:"joined"`
	Skin     string `json:"skin"`
	World    string `json:"world"`
	Status   string `json:"status"`
}

type Plugin struct {
	Name    string `json:"name"`
	Version string `json:"version"`
	Author  string `json:"author"`
	Enabled bool   `json:"enabled"`
	Desc    string `json:"desc"`
	Icon    string `json:"icon"`
}

type Backup struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Size    string `json:"size"`
	Created string `json:"created"`
	Auto    bool   `json:"auto"`
	Status  string `json:"status"`
}

type ConsoleLine struct {
	T   string `json:"t"`
	Lvl string `json:"lvl"`
	Txt string `json:"txt"`
	Col string `json:"col"`
}

type CommandRequest struct {
	Command string `json:"command"`
}

type ActionRequest struct {
	Action string `json:"action"` // start | stop | restart | kill
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

var servers = []Server{
	{
		ID: "survival-pl", Name: "SurvivalPL", MOTD: "Polski survival od 2019",
		Icon: "grass", Version: "1.20.4 Paper", Status: "online",
		Players: 47, MaxPlayers: 100, CPU: 42, RAM: 6.2, RAMMax: 8, TPS: 19.8,
		Uptime: "14d 6h", IP: "survival.example.pl:25565", Type: "Survival",
		Plugins: 23, Mods: 0, World: "overworld",
	},
	{
		ID: "creative-build", Name: "CreativeBuild", MOTD: "Plot world & WorldEdit",
		Icon: "diamond", Version: "1.20.4 Spigot", Status: "online",
		Players: 12, MaxPlayers: 50, CPU: 18, RAM: 3.1, RAMMax: 6, TPS: 20.0,
		Uptime: "3d 12h", IP: "creative.example.pl:25566", Type: "Creative",
		Plugins: 31, Mods: 0, World: "flat",
	},
	{
		ID: "skyblock-1", Name: "SkyBlock Reborn", MOTD: "Klasyczny skyblock",
		Icon: "gold", Version: "1.20.1 Purpur", Status: "starting",
		Players: 0, MaxPlayers: 80, CPU: 78, RAM: 2.4, RAMMax: 8, TPS: 18.2,
		Uptime: "2m", IP: "sky.example.pl:25567", Type: "SkyBlock",
		Plugins: 18, Mods: 0, World: "void",
	},
	{
		ID: "modded-rpg", Name: "Forge RPG Adventure", MOTD: "Modded RPG | 200+ mods",
		Icon: "netherite", Version: "1.19.2 Forge", Status: "online",
		Players: 28, MaxPlayers: 60, CPU: 67, RAM: 11.4, RAMMax: 16, TPS: 19.4,
		Uptime: "6d 22h", IP: "rpg.example.pl:25568", Type: "Modded",
		Plugins: 4, Mods: 247, World: "rpg-overworld",
	},
	{
		ID: "minigames", Name: "MiniGames Hub", MOTD: "BedWars, SkyWars, TNT Run",
		Icon: "tnt", Version: "1.20.4 Paper", Status: "offline",
		Players: 0, MaxPlayers: 200, CPU: 0, RAM: 0, RAMMax: 12, TPS: 0,
		Uptime: "—", IP: "mini.example.pl:25569", Type: "MiniGames",
		Plugins: 42, Mods: 0, World: "lobby",
	},
	{
		ID: "test-snapshot", Name: "Snapshot Test", MOTD: "1.21 testing ground",
		Icon: "enderpearl", Version: "1.21-pre1", Status: "online",
		Players: 3, MaxPlayers: 20, CPU: 8, RAM: 1.2, RAMMax: 4, TPS: 20.0,
		Uptime: "4h", IP: "test.example.pl:25570", Type: "Vanilla",
		Plugins: 0, Mods: 0, World: "overworld",
	},
}

var players = []Player{
	{Name: "Steve_PL", UUID: "a8e6...", Op: true, Ping: 24, Playtime: "142h", Joined: "2024-03-12", Skin: "steve", World: "overworld", Status: "op"},
	{Name: "AlexCrafter", UUID: "b3f1...", Op: false, Ping: 68, Playtime: "89h", Joined: "2024-08-04", Skin: "alex", World: "overworld", Status: "normal"},
	{Name: "EnderKiller99", UUID: "c2a9...", Op: false, Ping: 112, Playtime: "210h", Joined: "2023-11-22", Skin: "enderman", World: "the_end", Status: "vip"},
	{Name: "redstoneMaster", UUID: "d4b8...", Op: true, Ping: 18, Playtime: "512h", Joined: "2022-01-15", Skin: "redstone", World: "overworld", Status: "op"},
	{Name: "pixel_panda", UUID: "e7c2...", Op: false, Ping: 45, Playtime: "34h", Joined: "2025-01-08", Skin: "panda", World: "overworld", Status: "normal"},
	{Name: "NetherWalker", UUID: "f1d3...", Op: false, Ping: 89, Playtime: "167h", Joined: "2024-06-30", Skin: "piglin", World: "nether", Status: "vip"},
	{Name: "Cr3eperFan", UUID: "0a2b...", Op: false, Ping: 156, Playtime: "12h", Joined: "2025-09-01", Skin: "creeper", World: "overworld", Status: "normal"},
	{Name: "WitchPrincess", UUID: "1b3c...", Op: false, Ping: 38, Playtime: "78h", Joined: "2024-12-19", Skin: "witch", World: "overworld", Status: "normal"},
	{Name: "IronGolemPro", UUID: "2c4d...", Op: false, Ping: 22, Playtime: "301h", Joined: "2023-05-04", Skin: "iron", World: "overworld", Status: "vip"},
}

var plugins = []Plugin{
	{Name: "EssentialsX", Version: "2.20.1", Author: "EssentialsX Team", Enabled: true, Desc: "Podstawowe komendy serwera", Icon: "book"},
	{Name: "WorldEdit", Version: "7.3.0", Author: "EngineHub", Enabled: true, Desc: "Szybka edycja świata", Icon: "wood-axe"},
	{Name: "WorldGuard", Version: "7.0.10", Author: "EngineHub", Enabled: true, Desc: "Ochrona regionów", Icon: "shield"},
	{Name: "LuckPerms", Version: "5.4.0", Author: "lucko", Enabled: true, Desc: "System uprawnień i grup", Icon: "paper"},
	{Name: "Vault", Version: "1.7.3", Author: "MilkBowl", Enabled: true, Desc: "API ekonomii i uprawnień", Icon: "gold-ingot"},
	{Name: "PlaceholderAPI", Version: "2.11.6", Author: "clip", Enabled: true, Desc: "Placeholdery dla pluginów", Icon: "paper"},
	{Name: "CoreProtect", Version: "22.4", Author: "Intelli", Enabled: true, Desc: "Logowanie i rollback", Icon: "compass"},
	{Name: "mcMMO", Version: "2.2.018", Author: "nossr50", Enabled: true, Desc: "RPG skille dla graczy", Icon: "enchanted-book"},
	{Name: "Citizens", Version: "2.0.33", Author: "fullwall", Enabled: true, Desc: "NPC i questy", Icon: "villager"},
	{Name: "ProtocolLib", Version: "5.3.0", Author: "dmulloy2", Enabled: true, Desc: "Manipulacja protokołem", Icon: "eye-of-ender"},
	{Name: "DiscordSRV", Version: "1.28.0", Author: "Scarsz", Enabled: true, Desc: "Most Discord ↔ Minecraft", Icon: "lapis"},
	{Name: "ChestShop", Version: "3.12.4", Author: "Acrobot", Enabled: false, Desc: "Sklepy w skrzyniach", Icon: "chest"},
	{Name: "Citizens-Quests", Version: "1.4.2", Author: "PikaMug", Enabled: true, Desc: "System questów", Icon: "paper"},
	{Name: "AntiCheat", Version: "0.2.5", Author: "shaneBeee", Enabled: true, Desc: "Wykrywanie hackow", Icon: "iron-sword"},
}

var backups = []Backup{
	{ID: "b1", Name: "auto-2026-04-28-06h", Size: "847 MB", Created: "2026-04-28 06:00", Auto: true, Status: "ready"},
	{ID: "b2", Name: "auto-2026-04-27-06h", Size: "839 MB", Created: "2026-04-27 06:00", Auto: true, Status: "ready"},
	{ID: "b3", Name: "pre-update-1.20.4", Size: "812 MB", Created: "2026-04-25 14:30", Auto: false, Status: "ready"},
	{ID: "b4", Name: "auto-2026-04-26-06h", Size: "835 MB", Created: "2026-04-26 06:00", Auto: true, Status: "ready"},
	{ID: "b5", Name: "manual-spawn-rebuild", Size: "798 MB", Created: "2026-04-20 22:14", Auto: false, Status: "ready"},
}

var initialConsole = []ConsoleLine{
	{T: "09:42:01", Lvl: "INFO", Txt: `Done (12.341s)! For help, type "help"`, Col: "#aaaaaa"},
	{T: "09:42:18", Lvl: "INFO", Txt: "Steve_PL[/192.168.1.42:54321] logged in with entity id 8742", Col: "#ffffff"},
	{T: "09:42:18", Lvl: "INFO", Txt: "Steve_PL joined the game", Col: "#ffff55"},
	{T: "09:43:02", Lvl: "INFO", Txt: "<Steve_PL> hej, ktoś chce na diamenty?", Col: "#ffffff"},
	{T: "09:43:24", Lvl: "INFO", Txt: "AlexCrafter joined the game", Col: "#ffff55"},
	{T: "09:43:31", Lvl: "INFO", Txt: "<AlexCrafter> jadę", Col: "#ffffff"},
	{T: "09:44:15", Lvl: "WARN", Txt: "Can't keep up! Is the server overloaded? Running 2147ms or 42 ticks behind", Col: "#ffaa00"},
	{T: "09:44:48", Lvl: "INFO", Txt: "EnderKiller99 issued server command: /tpa Steve_PL", Col: "#aaaaaa"},
	{T: "09:45:02", Lvl: "INFO", Txt: "[CoreProtect] Logged 248 events.", Col: "#5fa3e8"},
	{T: "09:45:30", Lvl: "INFO", Txt: "Saving the game (this may take a moment!)", Col: "#ffffff"},
	{T: "09:45:32", Lvl: "INFO", Txt: "Saved the game", Col: "#aaaaaa"},
	{T: "09:46:11", Lvl: "INFO", Txt: "<redstoneMaster> ktoś tam grał z Witch?", Col: "#ffffff"},
	{T: "09:46:44", Lvl: "INFO", Txt: "WitchPrincess joined the game", Col: "#ffff55"},
	{T: "09:47:01", Lvl: "INFO", Txt: "[mcMMO] Steve_PL gained 234 XP in Mining", Col: "#80ff20"},
	{T: "09:47:25", Lvl: "ERROR", Txt: "Could not pass event PlayerInteractEvent to ChestShop v3.12.4", Col: "#ff5555"},
	{T: "09:48:13", Lvl: "INFO", Txt: "Cr3eperFan was blown up by Creeper", Col: "#ff5555"},
	{T: "09:48:55", Lvl: "INFO", Txt: "[DiscordSRV] Synced 47 members", Col: "#5fa3e8"},
	{T: "09:49:32", Lvl: "INFO", Txt: "pixel_panda has made the advancement [Diamonds!]", Col: "#5cdbd5"},
	{T: "09:50:10", Lvl: "INFO", Txt: "Server tick took 78ms (TPS: 19.4)", Col: "#aaaaaa"},
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func jsonOK(w http.ResponseWriter, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("json encode: %v", err)
	}
}

func corsOK(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func randomConsoleLine() ConsoleLine {
	now := time.Now()
	ts := now.Format("15:04:05")

	players := []string{"Steve_PL", "AlexCrafter", "EnderKiller99", "pixel_panda", "WitchPrincess"}
	skills := []string{"Mining", "Excavation", "Combat", "Fishing", "Acrobatics"}
	advancements := []string{"Diamonds!", "Stone Age", "The End?", "Monster Hunter", "Hot Stuff"}
	msgs := []string{"hej", "idę na nether", "ktoś chce na enderpearle?", "kto na diamenty?", "gdzie spawn?"}

	r := rand.Intn(6)
	switch r {
	case 0:
		return ConsoleLine{T: ts, Lvl: "INFO",
			Txt: fmt.Sprintf("Server tick %dms · TPS %.2f", rand.Intn(40)+20, 19.2+rand.Float64()*0.8),
			Col: "#aaaaaa"}
	case 1:
		p := players[rand.Intn(len(players))]
		return ConsoleLine{T: ts, Lvl: "INFO",
			Txt: fmt.Sprintf("<%s> %s", p, msgs[rand.Intn(len(msgs))]),
			Col: "#ffffff"}
	case 2:
		p := players[rand.Intn(len(players))]
		sk := skills[rand.Intn(len(skills))]
		return ConsoleLine{T: ts, Lvl: "INFO",
			Txt: fmt.Sprintf("[mcMMO] %s gained %d XP in %s", p, rand.Intn(500)+50, sk),
			Col: "#80ff20"}
	case 3:
		p := players[rand.Intn(len(players))]
		adv := advancements[rand.Intn(len(advancements))]
		return ConsoleLine{T: ts, Lvl: "INFO",
			Txt: fmt.Sprintf("%s has made the advancement [%s]", p, adv),
			Col: "#5cdbd5"}
	case 4:
		return ConsoleLine{T: ts, Lvl: "INFO",
			Txt: fmt.Sprintf("[DiscordSRV] Synced %d members", rand.Intn(50)+40),
			Col: "#5fa3e8"}
	default:
		p := players[rand.Intn(len(players))]
		return ConsoleLine{T: ts, Lvl: "INFO",
			Txt: fmt.Sprintf("%s joined the game", p),
			Col: "#ffff55"}
	}
}

// ─── Handlers ────────────────────────────────────────────────────────────────

func handleIndex(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/index.html")
}

func handleServers(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		corsOK(w)
		return
	}
	jsonOK(w, servers)
}

func handleServerByID(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		corsOK(w)
		return
	}
	id := r.PathValue("id")
	for _, s := range servers {
		if s.ID == id {
			jsonOK(w, s)
			return
		}
	}
	http.NotFound(w, r)
}

func handleServerAction(w http.ResponseWriter, r *http.Request) {
	corsOK(w)
	if r.Method == http.MethodOptions {
		return
	}
	id := r.PathValue("id")
	var req ActionRequest
	json.NewDecoder(r.Body).Decode(&req)
	log.Printf("action %q on server %s", req.Action, id)

	// Update in-memory status
	for i, s := range servers {
		if s.ID == id {
			switch strings.ToLower(req.Action) {
			case "stop":
				servers[i].Status = "offline"
				servers[i].Players = 0
			case "start":
				servers[i].Status = "starting"
			case "restart":
				servers[i].Status = "starting"
			}
			jsonOK(w, servers[i])
			return
		}
	}
	http.NotFound(w, r)
}

func handleCommand(w http.ResponseWriter, r *http.Request) {
	corsOK(w)
	if r.Method == http.MethodOptions {
		return
	}
	id := r.PathValue("id")
	var req CommandRequest
	json.NewDecoder(r.Body).Decode(&req)
	log.Printf("command %q on server %s", req.Command, id)
	jsonOK(w, map[string]string{"status": "ok"})
}

func handlePlayers(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		corsOK(w)
		return
	}
	jsonOK(w, players)
}

func handlePlugins(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		corsOK(w)
		return
	}
	jsonOK(w, plugins)
}

func handleBackups(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		corsOK(w)
		return
	}
	jsonOK(w, backups)
}

// handleConsoleStream streams live console lines via Server-Sent Events (SSE).
// It first flushes the historical log, then generates new lines every 2s.
func handleConsoleStream(w http.ResponseWriter, r *http.Request) {
	corsOK(w)
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	// Send historical lines
	for _, line := range initialConsole {
		data, _ := json.Marshal(line)
		fmt.Fprintf(w, "data: %s\n\n", data)
	}
	flusher.Flush()

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ticker.C:
			line := randomConsoleLine()
			data, _ := json.Marshal(line)
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		}
	}
}

func handleStatHistory(w http.ResponseWriter, r *http.Request) {
	corsOK(w)
	jsonOK(w, map[string][]float64{
		"cpu":     {22, 28, 31, 25, 30, 35, 42, 38, 33, 29, 31, 36, 44, 51, 48, 42, 39, 41, 45, 47, 42, 38, 41, 42},
		"ram":     {4.1, 4.3, 4.5, 4.6, 4.8, 5.1, 5.3, 5.5, 5.6, 5.6, 5.7, 5.9, 6.0, 6.1, 6.2, 6.2, 6.2, 6.1, 6.1, 6.2, 6.2, 6.2, 6.2, 6.2},
		"tps":     {20.0, 20.0, 20.0, 20.0, 19.9, 19.8, 19.5, 19.2, 19.4, 19.7, 19.9, 20.0, 19.8, 19.5, 19.0, 18.7, 19.2, 19.6, 19.8, 19.9, 19.8, 19.7, 19.8, 19.8},
		"players": {12, 14, 18, 22, 26, 31, 35, 38, 42, 44, 45, 46, 47, 48, 47, 47, 46, 45, 47, 48, 47, 47, 47, 47},
	})
}

// ─── Main ────────────────────────────────────────────────────────────────────

func main() {
	rand.Seed(time.Now().UnixNano())

	mux := http.NewServeMux()

	// Static assets
	mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// API — servers
	mux.HandleFunc("GET /api/servers", handleServers)
	mux.HandleFunc("GET /api/servers/{id}", handleServerByID)
	mux.HandleFunc("POST /api/servers/{id}/action", handleServerAction)
	mux.HandleFunc("POST /api/servers/{id}/command", handleCommand)
	mux.HandleFunc("GET /api/console/{id}/stream", handleConsoleStream)
	mux.HandleFunc("GET /api/stats", handleStatHistory)

	// API — global
	mux.HandleFunc("GET /api/players", handlePlayers)
	mux.HandleFunc("GET /api/plugins", handlePlugins)
	mux.HandleFunc("GET /api/backups", handleBackups)

	// CORS preflight
	mux.HandleFunc("OPTIONS /api/", func(w http.ResponseWriter, r *http.Request) {
		corsOK(w)
	})

	// SPA fallback
	mux.HandleFunc("/", handleIndex)

	addr := ":8080"
	log.Printf("CraftPanel running → http://localhost%s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
