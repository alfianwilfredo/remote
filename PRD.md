# PRD: Web-Based Ad-Free Android/Google TV Remote ("WebMote")

## 1. Executive Summary & Problem Statement
* **Latar Belakang:** Banyak pengguna mengandalkan aplikasi smartphone pihak ketiga untuk mengontrol Smart TV mereka. Namun, aplikasi-aplikasi ini dipenuhi oleh iklan popup/banner yang mengganggu, pelacakan data (*tracking*), dan memerlukan navigasi antar-layar yang lambat.
* **Tujuan Produk:** Membangun aplikasi remote control berbasis Web (*Web-based Remote*) yang **100% bebas iklan (ad-free)**, berkecepatan tinggi, berukuran ultra-ringan, dan dapat diakses langsung melalui browser laptop maupun smartphone pada jaringan Wi-Fi lokal yang sama.
* **Target TV Platform:** Android TV & Google TV (Xiaomi TV, TCL, Sony Bravia, Realme, Chromecast with Google TV, Coocaa, dsb.).

---

## 2. Arsitektur Teknis & Protokol Komunikasi

Aplikasi ini menggunakan arsitektur **Universal Hybrid Single-Port Engine**:

```
+------------------------------------+      WebSocket / HTTP (:3000)      +------------------------------------------+
|  Client Web Browser / Mobile PWA   | <--------------------------------> |  Universal Hybrid Bridge Server          |
|  (Zero-Build Vanilla HTML/CSS/JS)  |       / (UI)  &  /ws (Bridge)      |  (Bun.serve / Node.js http + ws Engine)  |
+------------------------------------+                                    +--------------------+---------------------+
                                                                                               |
                                                                                Wi-Fi / LAN    | (TLS v2 / Protobuf / ADB)
                                                                                               v
                                                                                  +------------+-------------+
                                                                                  |   Android / Google TV    |
                                                                                  |  (Port 6466/6467 / 5555) |
                                                                                  +--------------------------+
```

### 2.1 Mode Koneksi (Hybrid Approach)
1. **Primary Protocol (Android TV Remote Protocol v2):**
   * Menggunakan sertifikat TLS + pairing PIN 6 digit yang muncul di layar TV.
   * Tidak membutuhkan aktivasi *Developer Mode* di TV.
   * Mendukung navigasi tombol, kontrol volume, power, peluncuran aplikasi (*deep link*), dan input teks.
2. **Fallback Protocol (Wireless ADB):**
   * Menggunakan koneksi Android Debug Bridge via TCP (Port 5555).
   * Berguna untuk kontrol alternatif jika protokol v2 mengalami kendala pairing.

### 2.2 Server & Runtime Universal
* **Dual Engine Backend:** Otomatis mendeteksi runtime (`Bun.serve` saat dijalankan via Bun, atau `node:http` + `ws` saat dijalankan via Node.js / NPM / PNPM / Yarn).
* **Single Port Unification:** Menyajikan antarmuka frontend statis (`/`), REST API (`/api/*`), dan WebSocket bridge (`/ws`) pada 1 port tunggal (default `:3000`), mengeliminasi isu CORS dan kebutuhan multi-process dev server.
* **Standalone Binary:** Dapat dikompilasi menjadi satu file executable mandiri (`./webmote`) menggunakan `bun run build:binary`.

### 2.3 Dual-Band Wi-Fi (2.4 GHz vs 5 GHz) & Network Routing
* **Subnet Bridging Support:** Mendukung skenario di mana Smart TV terhubung ke pita 2.4 GHz dan perangkat pengontrol (Laptop / Smartphone) terhubung ke pita 5 GHz pada router dual-band yang sama (subnet IP sama, misal `192.168.x.x`).
* **mDNS & Multicast Fallback:** Jika paket multicast mDNS terisolasi antar pita 2.4G dan 5G oleh router, sistem menyediakan fallback koneksi langsung menggunakan input IP manual dan probe ARP.
* **AP Isolation / Client Isolation Handling:** Dokumentasi panduan konfigurasi router untuk menonaktifkan *AP Isolation* dan menghindari *Guest Wi-Fi*.

---

## 3. Fitur Utama (Core Functional Requirements)

### 3.1 Auto-Discovery & Pairing Management
* **mDNS / SSDP / ARP Subnet Scanner:** Otomatis mendeteksi perangkat Android/Google TV yang aktif di subnet Wi-Fi yang sama (`_androidtvremote2._tcp`, SSDP, dan probe ARP lokal).
* **Manual IP Configuration:** Pengguna dapat memasukkan IP TV secara manual jika discovery otomatis terhalang oleh router.
* **Interactive PIN Pairing Modal:** Menampilkan dialog input PIN di Web UI saat pertama kali menghubungkan laptop/HP ke TV.
* **Session & Certificate Persistence:** Menyimpan sertifikat/token pairing secara lokal (`.webmote-certs.json`), sehingga koneksi berikutnya terjadi instan tanpa perlu pairing ulang.
* **Wipe Credentials Action:** Opsi 1-klik untuk mereset seluruh data sertifikat dan memulai pairing baru dari awal.

### 3.2 Navigasi & Kontrol TV Lengkap
* **D-Pad Directional Controller:** Up, Down, Left, Right, dan tombol Center/OK.
* **System Keys:** Back, Home, Menu, Power (Sleep/Wake).
* **Audio Controls:** Volume Up, Volume Down, Quick Mute / Unmute, serta visualizer volume live (10-block phosphor meter).
* **Media Playback:** Play/Pause, Fast Forward, Rewind.

### 3.3 Keyboard Shortcut Integration (Laptop Experience)
Pengguna dapat mengontrol TV secara langsung menggunakan keyboard fisik laptop:
* `Panah (Up/Down/Left/Right)` : Navigasi D-Pad
* `Enter / Space` : OK / Select / Play-Pause
* `Escape / Backspace / B` : Back
* `H` : Home
* `+ / -` : Volume Up / Volume Down
* `M` : Mute / Unmute
* `P` : Power Sleep / Wake

### 3.4 Fast Text Typing & Search Bar
* Mengatasi masalah lambatnya mengetik huruf satu per satu menggunakan D-pad di TV.
* **Direct Type Text:** Ketik kalimat di laptop/HP lalu tekan *Enter* / *Type Text* untuk mengirim seluruh teks langsung ke input box aktif di TV (didukung toggle *Auto-Enter*).
* **YouTube Deep Search:** Tombol instan `▶ YT SEARCH` untuk langsung mencari video di aplikasi YouTube TV.

### 3.5 Quick App Shortcuts (Deep Linking Cartridges)
Tombol cartridge 1-klik untuk meluncurkan aplikasi populer secara instan:
* YouTube (`vnd.youtube.launch://` / `com.google.android.youtube.tv`)
* Netflix (`netflix://` / `com.netflix.ninja`)
* Spotify (`spotify://` / `com.spotify.tv.android`)
* Disney+ Hotstar (`hotstar://` / `in.startv.hotstar.dplus`)
* Prime Video (`https://app.primevideo.com` / `com.amazon.amazonvideo.livingroom`)
* Twitch (`twitch://` / `tv.twitch.android.app`)

### 3.6 Multi-Device & Mobile Access (PWA)
* Dapat diakses dari smartphone (iOS / Android) di Wi-Fi yang sama melalui browser mobile (`http://<IP_MAC>:3000`).
* Mendukung instalasi PWA (*Add to Home Screen*) untuk tampilan full-screen layaknya aplikasi native tanpa address bar browser.

---

## 4. Non-Functional Requirements (NFR)

1. **Zero Advertisements (Bebas Iklan 100%):** Tanpa skrip analitik, tanpa iklan pihak ketiga, tanpa pelacakan data.
2. **Ultra-Lightweight Frontend:** Zero-build static files (< 30 KB payload total), tanpa runtime framework berat (React/Tailwind/Vite dieliminasi untuk performa maksimal).
3. **Ultra-low Latency:** Respon tombol ke TV < 50ms melalui koneksi WebSocket & raw TLS socket lokal.
4. **Security & Privacy:** Komunikasi murni berjalan di LAN lokal antara perangkat pengguna dan TV tanpa mengirim telemetry ke internet.
5. **Universal Developer & User Experience:**
   - NPM: `npm run dev`
   - PNPM: `pnpm dev`
   - Yarn: `yarn dev`
   - Bun: `bun run dev:bun` (atau `bun run dev`)
   - Standalone Binary: `./webmote`

---

## 5. UI/UX Design Specifications (8-Bit Classic NES & GameBoy Pixel Art)

* **Design Style:** *8-Bit Classic NES / GameBoy Arcade Remote*.
* **Typography:** `'Press Start 2P'` (Headers, Labels, Status) & `'Silkscreen'` (Text inputs, IPs) dari Google Fonts.
* **Color Palette:**
  * Chassis / Body: `#d1cfc7` (NES Grey) & `#24242e` (Chassis Dark / GameBoy Dark)
  * Action / Power: `#d82800` (NES Crimson Red)
  * D-Pad Cross: `#1e1e24` (Solid 8-bit Black) dengan bevel 3D dan panah `#fcbc00`
  * Status / Screen Phosphor: `#5cd016` (GameBoy Green) & `#fcbc00` (Arcade Gold) & `#38bdf8` (Cyan)
  * Pixel Border: Stepped 3D pixel border (`box-shadow` dengan zero border-radius).
* **Audio & Screen Effects:**
  * **8-Bit Web Audio API SFX:** Feedback audio sintetis blip/bleep retro instan tanpa file audio eksternal (Move, Select, Back, Volume, Power Sweep, Cartridge chime) + toggle Mute.
  * **CRT Scanline Overlay:** Filter garis layar TV tabung retro dengan toggle On/Off.
* **Layout Structure:**
  * **Header:** Retro Dot-matrix LCD Screen (Status TV, Target IP, Active App, Volume Bar, Status Message).
  * **Center Controller:** NES-styled chunky D-Pad ✚, tombol System (Power, Home, Back), dan dual grid (Volume & Playback).
  * **Fast Typing Bar:** Terminal input box pixelated untuk mengetik teks langsung ke TV.
  * **Bottom App Cartridges:** Grid cartridge game pixel 8-bit dengan color notches.

---

## 6. Project Status & Deliverables

| Deliverable | Status | Keterangan |
| :--- | :--- | :--- |
| **Android TV v2 TLS Protocol Engine** | ✅ Selesai | TLS v2 socket + custom pairing logic kompatibel dengan Bun & Node. |
| **Wireless ADB Fallback Controller** | ✅ Selesai | Port 5555 keyevent & text injection fallback. |
| **Auto Network Scanner (mDNS/SSDP/ARP)** | ✅ Selesai | Auto discovery + subnet chunk prober untuk deteksi TV. |
| **Zero-Build 8-Bit Pixel UI** | ✅ Selesai | Pure HTML5 + CSS + Native JS (< 30 KB total). |
| **Web Audio API Retro SFX Engine** | ✅ Selesai | Synthesizer square/triangle wave bawaan tanpa aset audio file. |
| **Multi-Package Manager Support** | ✅ Selesai | Berjalan di `npm`, `pnpm`, `yarn`, dan `bun`. |
| **Single Standalone Executable Binary** | ✅ Selesai | Binary portabel 1 file (`./webmote`). |
| **Mobile & PWA Access** | ✅ Selesai | Responsif untuk smartphone & dapat diinstal ke Home Screen. |
