//go:build windows

// Yodgor for Windows: one exe, its own window (Microsoft WebView2, built into
// Windows 10/11). The game is embedded and served on a fixed local address so
// saves persist. Fullscreen and quit are native. If WebView2 is missing, the
// game opens in Chrome/Edge as a fallback.
package main

import (
	_ "embed"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"syscall"
	"unsafe"

	webview2 "github.com/jchv/go-webview2"
)

//go:embed game.html
var game []byte

const fixedAddr = "127.0.0.1:47819"

// buildID changes with every release (set by the build command)
var buildID = "dev"

var (
	user32            = syscall.NewLazyDLL("user32.dll")
	procMessageBoxW   = user32.NewProc("MessageBoxW")
	procGetWindowLong = user32.NewProc("GetWindowLongPtrW")
	procSetWindowLong = user32.NewProc("SetWindowLongPtrW")
	procGetWindowRect = user32.NewProc("GetWindowRect")
	procSetWindowPos  = user32.NewProc("SetWindowPos")
	procMonitorFromW  = user32.NewProc("MonitorFromWindow")
	procGetMonitorInf = user32.NewProc("GetMonitorInfoW")
	procShowWindow    = user32.NewProc("ShowWindow")
	procSetForeground = user32.NewProc("SetForegroundWindow")
)

const (
	gwlStyle         = ^uintptr(15) // -16
	wsOverlappedWin  = 0x00CF0000
	wsPopup          = 0x80000000
	wsVisible        = 0x10000000
	swpFrameChanged  = 0x0020
	swpNoZOrder      = 0x0004
	swpNoOwnerZOrder = 0x0200
	monitorNearest   = 2
	swMaximize       = 3
	swRestore        = 9
)

type rect struct{ L, T, R, B int32 }
type monitorInfo struct {
	Size    uint32
	Monitor rect
	Work    rect
	Flags   uint32
}

func msgBox(text string) {
	t, _ := syscall.UTF16PtrFromString("Yodgor")
	m, _ := syscall.UTF16PtrFromString(text)
	procMessageBoxW.Call(0, uintptr(unsafe.Pointer(m)), uintptr(unsafe.Pointer(t)), 0x40)
}

// borderless fullscreen on the window's monitor, and back
type fullscreen struct {
	mu    sync.Mutex
	on    bool
	style uintptr
	r     rect
}

func (f *fullscreen) set(hwnd uintptr, on bool) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if on == f.on || hwnd == 0 {
		return
	}
	if on {
		f.style, _, _ = procGetWindowLong.Call(hwnd, gwlStyle)
		procGetWindowRect.Call(hwnd, uintptr(unsafe.Pointer(&f.r)))
		mon, _, _ := procMonitorFromW.Call(hwnd, monitorNearest)
		mi := monitorInfo{Size: uint32(unsafe.Sizeof(monitorInfo{}))}
		procGetMonitorInf.Call(mon, uintptr(unsafe.Pointer(&mi)))
		procSetWindowLong.Call(hwnd, gwlStyle, (f.style&^wsOverlappedWin)|wsPopup|wsVisible)
		m := mi.Monitor
		procSetWindowPos.Call(hwnd, 0, uintptr(m.L), uintptr(m.T), uintptr(m.R-m.L), uintptr(m.B-m.T), swpFrameChanged|swpNoZOrder|swpNoOwnerZOrder)
	} else {
		procSetWindowLong.Call(hwnd, gwlStyle, f.style)
		r := f.r
		procSetWindowPos.Call(hwnd, 0, uintptr(r.L), uintptr(r.T), uintptr(r.R-r.L), uintptr(r.B-r.T), swpFrameChanged|swpNoZOrder|swpNoOwnerZOrder)
	}
	f.on = on
}

func serve() (string, bool) {
	ln, err := net.Listen("tcp", fixedAddr)
	if err != nil {
		return "http://" + fixedAddr + "/", false // already running
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && r.URL.Path != "/index.html" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		_, _ = w.Write(game)
	})
	go func() { _ = http.Serve(ln, mux) }()
	return "http://" + fixedAddr + "/", true
}

func main() {
	url, fresh := serve()
	if !fresh {
		msgBox("Yodgor is already running.\nЁдгор уже запущен.")
		return
	}
	base := filepath.Join(os.Getenv("LOCALAPPDATA"), "Yodgor2")
	_ = os.MkdirAll(base, 0o755)
	cfg := filepath.Join(base, "vsync.off")
	// A new build starts from safe options: risky ones saved by an older build are dropped.
	verFile := filepath.Join(base, "build.txt")
	if b, _ := os.ReadFile(verFile); string(b) != buildID {
		_ = os.Remove(cfg)
		_ = os.WriteFile(verFile, []byte(buildID), 0o644)
	}
	// If the last start never reported that it was alive (black window, crash),
	// this start drops risky options and asks the game to reset its graphics.
	pending := filepath.Join(base, "boot.pending")
	reset := false
	if _, err := os.Stat(pending); err == nil {
		_ = os.Remove(cfg)
		reset = true
	}
	_ = os.WriteFile(pending, []byte("starting"), 0o644)
	args := "--autoplay-policy=no-user-gesture-required --disable-features=CalculateNativeWinOcclusion --enable-gpu-rasterization --ignore-gpu-blocklist"
	if _, err := os.Stat(cfg); err == nil {
		args += " --disable-gpu-vsync --disable-frame-rate-limit"
	}
	os.Setenv("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", args)

	w := webview2.NewWithOptions(webview2.WebViewOptions{
		DataPath:  filepath.Join(base, "webview"),
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title: "Yodgor", Width: 1280, Height: 760, IconId: 1, Center: true,
		},
	})
	if w == nil {
		browserFallback(url)
		return
	}
	defer w.Destroy()
	hwnd := uintptr(w.Window())
	fs := &fullscreen{}
	_ = w.Bind("yodgorFullscreen", func(on bool) bool {
		w.Dispatch(func() { fs.set(hwnd, on) })
		return on
	})
	_ = w.Bind("yodgorQuit", func() {
		w.Dispatch(func() { w.Terminate() })
	})
	_ = w.Bind("yodgorApp", func() string { return "webview2" })
	_ = w.Bind("yodgorAlive", func() bool { _ = os.Remove(pending); return true })
	// (if the game never reports in, boot.pending stays and the next start resets risky options)
	_ = w.Bind("yodgorVsync", func(on bool) bool {
		if on {
			_ = os.Remove(cfg)
		} else {
			_ = os.WriteFile(cfg, []byte("V-Sync is off. Delete this file to turn it back on.\n"), 0o644)
		}
		return on
	})
	_ = w.Bind("yodgorWindow", func(width, height int) bool {
		w.Dispatch(func() {
			if fs.on {
				return
			}
			procShowWindow.Call(hwnd, swRestore)
			mon, _, _ := procMonitorFromW.Call(hwnd, monitorNearest)
			mi := monitorInfo{Size: uint32(unsafe.Sizeof(monitorInfo{}))}
			procGetMonitorInf.Call(mon, uintptr(unsafe.Pointer(&mi)))
			wa := mi.Work
			ww, wh := int32(width), int32(height)
			if ww > wa.R-wa.L {
				ww = wa.R - wa.L
			}
			if wh > wa.B-wa.T {
				wh = wa.B - wa.T
			}
			x, y := wa.L+(wa.R-wa.L-ww)/2, wa.T+(wa.B-wa.T-wh)/2
			procSetWindowPos.Call(hwnd, 0, uintptr(x), uintptr(y), uintptr(ww), uintptr(wh), swpNoZOrder|swpNoOwnerZOrder)
		})
		return true
	})
	procShowWindow.Call(hwnd, swMaximize)
	procSetForeground.Call(hwnd)
	if reset {
		url += "?resetgfx"
	}
	w.Navigate(url)
	w.Run()
}

/* ---------- fallback: Chrome or Edge in app mode ---------- */
func findBrowser() string {
	pf, pf86, local := os.Getenv("ProgramFiles"), os.Getenv("ProgramFiles(x86)"), os.Getenv("LOCALAPPDATA")
	for _, c := range []string{
		filepath.Join(pf86, `Microsoft\Edge\Application\msedge.exe`),
		filepath.Join(pf, `Microsoft\Edge\Application\msedge.exe`),
		filepath.Join(pf, `Google\Chrome\Application\chrome.exe`),
		filepath.Join(pf86, `Google\Chrome\Application\chrome.exe`),
		filepath.Join(local, `Google\Chrome\Application\chrome.exe`),
	} {
		if st, err := os.Stat(c); err == nil && !st.IsDir() {
			return c
		}
	}
	return ""
}

func browserFallback(url string) {
	b := findBrowser()
	if b == "" {
		_ = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
		msgBox("The game is open in your browser.\nClose this window when you finish playing.")
		return
	}
	profile := filepath.Join(os.Getenv("LOCALAPPDATA"), "Yodgor2", "browser")
	_ = os.MkdirAll(profile, 0o755)
	cmd := exec.Command(b, "--app="+url, "--user-data-dir="+profile, "--start-fullscreen",
		"--no-first-run", "--no-default-browser-check", "--autoplay-policy=no-user-gesture-required")
	if cmd.Start() == nil {
		_ = cmd.Wait()
	}
}
