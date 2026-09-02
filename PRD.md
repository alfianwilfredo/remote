# PRD: Web-Based Ad-Free Android/Google TV Remote ("WebMote")

## 1. Executive Summary & Problem Statement
* **Latar Belakang:** Banyak pengguna mengandalkan aplikasi smartphone pihak ketiga untuk mengontrol Smart TV mereka. Namun, aplikasi-aplikasi ini dipenuhi oleh iklan popup/banner yang mengganggu, pelacakan data (*tracking*), dan memerlukan navigasi antar-layar yang lambat.
* **Tujuan Produk:** Membangun aplikasi remote control berbasis Web (*Web-based Remote*) yang **100% bebas iklan (ad-free)**, berkecepatan tinggi, dan dapat diakses langsung melalui browser laptop pada jaringan Wi-Fi lokal yang sama.
* **Target TV Platform:** Android TV & Google TV (Xiaomi TV, TCL, Sony Bravia, Realme, Chromecast with Google TV, Coocaa, dsb.).

---

## 2. Arsitektur Teknis & Protokol Komunikasi

Karena browser memiliki batasan keamanan (CORS dan pembatasan raw TCP/TLS socket ke IP lokal), aplikasi ini mengadopsi arsitektur **Local Bridge Engine**:

```
+------------------------+      WebSocket / HTTP      +---------------------------+
|  Laptop Web Browser    | <------------------------> |  Local Bun Bridge Server  |
|  (React 19 + Vite UI)  |       localhost:port       |  (Bun Runtime + Engine)   |
+------------------------+                            +-------------+-------------+
                                                                    |
                                                     Wi-Fi / LAN    | (TLS / Protobuf / ADB)
                                                                    v
                                                      +-------------+-------------+
                                                      |   Android / Google TV     |
                                                      |  (Port 6466 / 6467 / 5555)|
                                                      +---------------------------+
```

### 2.1 Mode Koneksi (Hybrid Approach)
1. **Primary Protocol (Android TV Remote Protocol v2):**
   * Menggunakan sertifikat TLS + pairing PIN 6 digit yang muncul di layar TV.
   * Tidak membutuhkan aktivasi *Developer Mode* di TV.
   * Mendukung navigasi tombol, kontrol volume, power, peluncuran aplikasi (*deep link*), dan input teks.
2. **Fallback Protocol (Wireless ADB):**
   * Menggunakan koneksi Android Debug Bridge via TCP (Port 5555).
   * Berguna untuk kontrol alternatif jika protokol v2 mengalami kendala pairing.

---

## 3. Fitur Utama (Core Functional Requirements)

### 3.1 Auto-Discovery & Pairing Management
* **mDNS / Local IP Scanner:** Otomatis mendeteksi perangkat Android/Google TV yang aktif di subnet Wi-Fi yang sama (`_androidtvremote2._tcp` / SSDP).
* **Manual IP Configuration:** Pengguna dapat memasukkan IP TV secara manual jika mDNS terblokir oleh router.
* **Interactive PIN Pairing Modal:** Menampilkan dialog input PIN di Web UI saat pertama kali menghubungkan laptop ke TV.
* **Session Persistence:** Menyimpan sertifikat/token pairing secara lokal di backend, sehingga koneksi berikutnya terjadi secara instan tanpa perlu pairing ulang.

### 3.2 Navigasi & Kontrol TV Lengkap
* **D-Pad Directional Controller:** Up, Down, Left, Right, dan tombol Center/OK.
* **System Keys:** Back, Home, Menu, Power (Sleep/Wake), Settings, Source/Input.
* **Audio Controls:** Volume Up, Volume Down, Quick Mute / Unmute.
* **Media Playback:** Play, Pause, Fast Forward, Rewind.

### 3.3 Keyboard Shortcut Integration (Laptop-first Experience)
Pengguna dapat mengontrol TV secara langsung menggunakan keyboard fisik laptop tanpa perlu mengklik tombol di layar:
* `Panah (Up/Down/Left/Right)` : Navigasi D-Pad
* `Enter / Space` : OK / Select / Play-Pause
* `Escape / Backspace` : Back
* `H` : Home
* `+ / -` : Volume Up / Volume Down
* `M` : Mute / Unmute

### 3.4 Fast Text Typing & Search Bar
* Mengatasi masalah lambatnya mengetik satu per satu huruf menggunakan D-pad di TV.
* Pengguna mengetik kalimat pencarian (misal judul video YouTube atau film Netflix) di input box laptop, lalu tekan *Send* atau *Enter* untuk mengirim seluruh teks langsung ke input field aktif di TV.

### 3.5 Quick App Shortcuts (Deep Linking)
* Tombol instan 1-klik untuk meluncurkan aplikasi populer:
  * YouTube (`com.google.android.youtube.tv`)
  * Netflix (`com.netflix.ninja`)
  * Spotify (`com.spotify.tv.android`)
  * Disney+ Hotstar (`in.startv.hotstar.dplus` / `com.disney.disneyplus`)
  * Prime Video (`com.amazon.amazonvideo.livingroom`)
  * Twitch, VLC, SmartTube, dsb.

---

## 4. Non-Functional Requirements (NFR)

1. **Zero Advertisements (Bebas Iklan 100%):** Tidak ada skrip analitik pihak ketiga, SDK iklan, atau banner eksternal.
2. **Ultra-low Latency:** Respon tombol ke TV < 50ms melalui koneksi socket lokal.
3. **Security & Privacy:** Komunikasi murni berjalan di LAN lokal antara laptop dan TV tanpa mengirim telemetry ke internet.
4. **Developer Experience:** Menjalankan proyek dengan 1 perintah: `bun dev` (menjalankan backend bridge sekaligus frontend Vite secara paralel/terintegrasi).

---

## 5. UI/UX Design Specifications (8-Bit Classic NES & GameBoy Pixel Art)

* **Design Style:** *8-Bit Classic NES / GameBoy Arcade Remote*.
* **Typography:** `'Press Start 2P'` (Headers, Labels, Status) & `'Silkscreen'` (Text inputs, IPs) dari Google Fonts.
* **Color Palette:**
  * Chassis / Body: `#d1cfc7` (NES Grey) & `#1b1b22` (Chassis Black / GameBoy Dark)
  * Action / Power: `#d82800` (NES Crimson Red)
  * D-Pad Cross: `#121214` (Solid 8-bit Black) dengan bevel pixel 3D
  * Status / Screen Phosphor: `#5cd016` (GameBoy Green) & `#fcbc00` (Arcade Gold)
  * Pixel Border: `3px solid #000` / box-shadow stepped pixel border (zero border-radius).
* **Audio & Screen Effects:**
  * **8-Bit Web Audio API SFX:** Feedback audio sintetis blip/bleep retro instan untuk setiap penekanan tombol, dilengkapi tombol toggle Sound Mute.
  * **CRT Scanline Overlay:** Filter garis layar TV tabung retro dengan toggle On/Off.
* **Layout Structure:**
  * **Header:** Retro Dot-matrix LCD Screen (Status TV, IP, Connected LED, CRT & Sound toggle, Power Switch).
  * **Center Controller:** NES-styled chunky D-Pad ✚, tombol Select / Start, Volume Rockers pixel, dan tombol navigasi Back/Home.
  * **Fast Typing Bar:** Terminal input box pixelated untuk mengetik teks langsung ke TV.
  * **Bottom App Cartridges:** Grid cartridge game pixel 8-bit untuk peluncuran cepat (YouTube, Netflix, Spotify, Disney+, dll.).

---

## 6. Roadmap & Implementation Phases

| Fase | Target Deliverable | Deskripsi |
| :--- | :--- | :--- |
| **Fase 1** | Local Bridge Core & Pairing | Implementasi pairing TLS v2 + socket handler di backend Bun (`server.ts`). |
| **Fase 2** | UI Component & Design System | Membangun UI Remote Glassmorphic di React 19 + Lucide Icons + CSS Variables. |
| **Fase 3** | Keyboard Mapping & Input Engine | Menghubungkan keyboard listener laptop ke socket remote command. |
| **Fase 4** | App Launcher & Auto Discovery | Menambahkan mDNS scanner & package deep linking. |
| **Fase 5** | Polish & Optimization | Pengujian latensi, status indicator, dan fallback ADB mode. |
