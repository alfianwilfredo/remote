# WebMote

Web remote control berbasis browser untuk Android TV dan Google TV. Berjalan langsung di jaringan lokal tanpa iklan, tanpa telemetri, dan dengan UI retro 8-bit NES.

Frontend dibangun tanpa build step (pure HTML5, CSS, dan vanilla JS berukuran < 30 KB), disajikan langsung oleh backend hybrid yang mendukung Node.js dan Bun.

---

## 🟢 Cara Pakai Cepat (Untuk Orang Awam / Tanpa Koding & Tanpa Node/Bun)

Jika kamu bukan programmer dan tidak ingin menginstal Node.js/Bun atau mengetik perintah di terminal:

### Opsi A: Menggunakan File Standalone (.exe / Binary Siap Pakai)
1. Unduh file aplikasi mandiri dari [Halaman Releases](https://github.com/alfianwilfredo/remote/releases):
   - **Windows:** Unduh **`webmote-windows-x64.exe`** (atau `webmote-windows-x64.zip`)
   - **Mac Apple Silicon (M1/M2/M3/M4):** Unduh **`webmote-macos-arm64.zip`**
   - **Mac Intel:** Unduh **`webmote-macos-x64.zip`**
   - **Linux (Ubuntu/Debian/Fedora/Arch):** Unduh **`webmote-linux-x64.zip`**
2. **Klik dua kali (*Double-Click*)** file yang sudah diunduh atau jalankan `start.command` / `start.bat` / `start.sh`.
3. Browser akan otomatis terbuka sendiri ke tampilan remote!

### Opsi B: Menggunakan File Script 1-Klik di Repo Ini
1. **Pengguna Mac:** Cukup klik dua kali (*Double-Click*) file **`start.command`**.
2. **Pengguna Windows:** Cukup klik dua kali (*Double-Click*) file **`start.bat`**.
3. **Pengguna Linux:** Jalankan file **`start.sh`**.

---

### Langkah Selanjutnya (Buka di HP & Hubungkan ke TV):
1. **Buka di HP (Scan QR Code):**
   - Di layar laptop, klik tombol **`📱 HP`** di pojok kanan atas.
   - Arahkan kamera HP ke QR Code yang muncul di layar untuk langsung membuka remote di smartphone.
2. **Hubungkan ke TV:**
   - Klik tombol **`📺 DEVICES`** ➜ klik **`CONNECT`** pada TV Anda.
   - Masukkan 6-digit kode PIN yang muncul di layar TV Anda, lalu klik **`VERIFY PIN`**. Selesai!

---

## Fitur

- **True Single-File Executable:** Dapat berjalan langsung sebagai 1 file binary mandiri (`.exe` / native binary) tanpa membutuhkan Node.js, Bun, NPM, atau dependensi eksternal apapun di komputer.
- **Zero-Build & Ringan:** Payload frontend < 30 KB tanpa framework berat (React, Vite, dan Tailwind dieliminasi untuk memangkas latensi dan ukuran bundle).
- **Multi-Runtime:** Berjalan di Node.js (`npm`, `pnpm`, `yarn`) dan `bun`, atau dikompilasi jadi binary mandiri (`./webmote`).
- **Protokol Hybrid:** Menggunakan Android TV Remote Protocol v2 (TLS + PIN pairing) dengan fallback ke Wireless ADB (port 5555).
- **Scan QR Code HP:** Cukup scan QR code di layar laptop dengan kamera smartphone untuk langsung membuka remote di HP tanpa perlu mengetik IP.
- **Voice Search (Speech-to-Text):** Bicara langsung ke mic HP atau laptop untuk mencari video di YouTube atau mengetik ke TV secara instan via Web Speech API native.
- **Fast Text Input & YouTube Search:** Mengetik teks panjang langsung ke input box aktif di TV atau mencari video langsung di YouTube TV.
- **Deep Link App Cartridges:** 1-klik buka aplikasi YouTube, Netflix, Spotify, Disney+ Hotstar, Prime Video, dan Twitch.
- **Synthesizer Web Audio:** Efek suara retro 8-bit sintetis tanpa memuat file audio eksternal.
- **PWA Ready:** Tampilan responsif dan bisa di-install ke Home Screen HP agar tampil fullscreen tanpa address bar.

---

## Persyaratan

- **Untuk Standalone Executable (`.exe` / Binary):** **TIDAK PERLU** install apapun! Cukup jalankan filenya.
- **Untuk Mode Development (Source Code):** **Node.js** (v18+) atau **Bun** (v1.0+).
- Laptop/HP dan Android TV terhubung ke **jaringan Wi-Fi / LAN yang sama**.
- Perangkat berbasis **Android TV** atau **Google TV** (Xiaomi TV, TCL, Sony Bravia, Realme, Chromecast with Google TV, Coocaa, Polytron, dll.).

---

## Quickstart

Clone repositori dan masuk ke direktori:

```bash
git clone https://github.com/alfianwilfredo/remote.git
cd remote
```

Jalankan sesuai package manager yang kamu gunakan:

### Bun (Rekomendasi)
```bash
bun install
bun run dev:bun   # atau: bun run dev
```

### NPM
```bash
npm install
npm run dev
```

### PNPM
```bash
pnpm install
pnpm dev
```

### Yarn
```bash
yarn install
yarn dev
```

Buka browser di `http://localhost:3000`.

### Build Binary Mandiri (Standalone Executable)
Jika ingin membuat 1 file binary executable yang bisa langsung dijalankan tanpa perlu instalasi Node/Bun:

```bash
bun run build:binary
./webmote
```

---

## Cara Menghubungkan ke TV (Pairing PIN)

1. Pastikan TV menyala dan terhubung ke Wi-Fi yang sama dengan laptop.
2. Buka `http://localhost:3000`, lalu klik tombol **DEVICES** di toolbar kanan atas.
3. WebMote akan otomatis memindai TV di jaringan lokal. Klik **CONNECT** pada TV yang ditemukan.
   - *Catatan:* Jika TV tidak muncul otomatis, masukkan IP TV secara manual (misal: `192.168.x.x`) di kolom input dan klik **CONNECT DEVICE**.
4. Lihat layar TV Anda, akan muncul dialog permintaan pairing dengan kode PIN 6 karakter (misal: `471B6C`).
5. Masukkan kode PIN tersebut di dialog WebMote dan klik **VERIFY PIN**.
6. Status di layar LCD remote akan berubah jadi **ONLINE**. Kredensial pairing tersimpan otomatis di `.webmote-certs.json` sehingga koneksi berikutnya tidak perlu pairing ulang.

---

## Catatan Jaringan: Wi-Fi 2.4 GHz vs 5 GHz

Di banyak router rumahan (IndiHome, MyRepublic, Biznet, First Media, dll.), frekuensi 2.4 GHz dan 5 GHz aktif bersamaan:

```
[ Router Dual-Band ] (Subnet sama: 192.168.x.x)
    ├── Jaringan 2.4 GHz ──> Android TV (IP: 192.168.x.TV)
    └── Jaringan 5.0 GHz ──> Laptop / HP (IP: 192.168.x.PC)
```

- **Apakah laptop di 5 GHz bisa mengontrol TV di 2.4 GHz?**  
  Bisa. Selama router menjembatani (*bridge*) kedua frekuensi tersebut ke subnet IP yang sama (misal sama-sama `192.168.x.xxx`), komunikasi soket lokal tetap berjalan normal.

- **Kapan masalah koneksi bisa terjadi?**
  1. **SSID Terpisah & Tidak di-Bridge:** Jika router memisahkan akses antar-SSID, sambungkan laptop/HP ke SSID yang sama dengan TV (misal sama-sama ke `WiFi_2.4G`).
  2. **AP Isolation / Client Isolation Aktif:** Fitur ini mencegah perangkat di Wi-Fi saling berkomunikasi. Matikan opsi *AP Isolation* di halaman admin router (biasanya `http://192.168.1.1` atau `http://192.168.0.1` ➜ menu *Wireless Advanced*).
  3. **Guest Network:** Jangan hubungkan TV atau laptop ke Wi-Fi Tamu (*Guest Wi-Fi*) karena jaringan ini memblokir komunikasi lokal.
  4. **mDNS Terblokir:** Jika auto-scan tidak menemukan TV karena router memblokir paket multicast, masukkan IP TV secara manual di menu **DEVICES**.

---

## Shortcut Keyboard Laptop

Kamu bisa mengontrol TV langsung menggunakan keyboard laptop:

| Tombol | Aksi Remote |
| :--- | :--- |
| `↑` `↓` `←` `→` | Navigasi D-Pad |
| `Enter` / `Space` | Select / OK |
| `Escape` / `Backspace` / `B` | Back / Kembali |
| `H` | Home Screen |
| `+` / `-` | Volume Up / Down |
| `M` | Mute / Unmute |
| `P` | Power (Sleep / Wake) |

*Shortcut dinonaktifkan otomatis saat kursor aktif di input teks.*

---

## Voice Search, Mengetik Teks & Cari di YouTube

1. **Voice Search (`🎙 VOICE`):**
   - Klik tombol **`🎙 VOICE`** dan izinkan akses mikrofon browser saat diminta.
   - Tombol akan berkedip merah (**LISTENING...**) dan nada blip pembuka akan berbunyi.
   - Bicara kata kunci yang diinginkan (misal: *"Lofi hip hop"* atau *"Film aksi"*).
   - Suara Anda akan langsung diubah jadi teks secara real-time. Begitu selesai bicara, teks otomatis terisi di kolom input.
   - Klik **`▶ YT SEARCH`** untuk langsung mencari di YouTube TV atau **`⌨ TYPE TEXT`** untuk mengetik ke TV.
2. **Ketik Teks Manual (`⌨ TYPE TEXT`):**
   - Ketik kalimat di kolom input, lalu tekan Enter atau klik **`⌨ TYPE TEXT`** untuk mengirim seluruh teks ke input box yang aktif di TV.
   - Aktifkan toggle **`AUTO-ENTER: ON`** jika ingin WebMote otomatis menekan Enter setelah teks terkirim.
3. **Cari YouTube Langsung (`▶ YT SEARCH`):**
   - Ketik atau ucapkan kata kunci, lalu klik **`▶ YT SEARCH`** untuk otomatis membuka YouTube TV dan menampilkan hasil pencarian video.

---

## Akses dari Smartphone (PWA)

WebMote bisa diakses dari HP (iPhone / Android) yang terhubung ke Wi-Fi yang sama:

1. Jalankan server di komputer, lalu perhatikan IP lokal yang tercetak di terminal:
   ```
   🎮 [WebMote] Server running via Bun
      ➜  Local:   http://localhost:3000
      ➜  Network: http://<IP_KOMPUTER_ANDA>:3000
   ```
2. Buka browser di HP dan akses URL jaringan tersebut (misal: `http://192.168.x.x:3000`).
3. **Install ke Home Screen (Fullscreen):**
   - **iOS (Safari):** Tekan icon Share ➜ **Add to Home Screen**.
   - **Android (Chrome):** Tekan menu titik tiga ➜ **Install app** / **Add to Home screen**.

---

## Troubleshooting

- **TV tidak ditemukan saat auto-scan:**  
  Cek IP TV di menu TV (**Settings ➜ Network & Internet ➜ Wi-Fi ➜ IP Address**), lalu masukkan IP tersebut secara manual di menu **DEVICES** WebMote.
- **PIN pairing salah atau kedaluwarsa:**  
  Klik tombol **MINTA PIN BARU** di dialog PIN WebMote untuk men-trigger kode baru di layar TV.
- **Gagal konek ke TV yang sebelumnya sudah pernah terhubung:**  
  Buka menu **DEVICES ➜ BRIDGE SERVER SETTINGS ➜ HAPUS KREDENSIAL PAIRING**, lalu lakukan koneksi dan pairing ulang dari awal.
- **Port 3000 bentrok dengan aplikasi lain:**  
  Ganti port menggunakan environment variable:
  ```bash
  PORT=3005 npm run dev
  # atau
  PORT=3005 bun run dev
  ```

---

## Struktur Proyek

```
remote/
├── public/                 # Static frontend (< 30 KB, zero-build)
│   ├── index.html          # Markup layout NES & modal dialog
│   ├── style.css           # Styling pixel art, token NES, & CRT overlay
│   ├── app.js              # WebSocket client, Web Audio SFX, & event handler
│   ├── favicon.svg         # Favicon retro
│   └── manifest.json       # Web app manifest untuk PWA mobile
├── server/                 # Backend bridge hybrid
│   ├── index.ts            # Entrypoint server (Bun.serve & Node http/ws)
│   ├── androidRemote.ts    # Engine Android TV Remote Protocol v2
│   ├── adbController.ts    # Fallback Wireless ADB (port 5555)
│   ├── discovery.ts        # Scanner jaringan lokal (mDNS, SSDP, ARP probe)
│   ├── certs.ts            # Manajemen sertifikat TLS (.webmote-certs.json)
│   ├── keycodes.ts         # Android keycodes mapping
│   └── types.ts            # Type definitions
├── PRD.md                  # Product Requirement Document
├── README.md               # Dokumentasi proyek
└── package.json            # Scripts & dependencies
```

---

## Batasan & Kekurangan

1. **Khusus Android TV & Google TV:** Tidak mendukung Smart TV dengan OS non-Android seperti Samsung (Tizen OS), LG (webOS), Apple TV (tvOS), atau Roku TV karena masing-masing menggunakan protokol pairing dan proprietary socket yang berbeda.
2. **Hanya Berjalan di Jaringan Lokal (LAN):** Tidak bisa mengontrol TV dari luar rumah via internet atau paket data seluler, karena komunikasi berjalan murni secara lokal (peer-to-peer LAN) tanpa server cloud perantara.
3. **Komputer Host Harus Tetap Menyala:** Karena browser web melarang koneksi langsung raw TCP/TLS socket ke perangkat lokal (kebijakan keamanan browser), server backend bridge (`bun` atau `node`) harus tetap aktif di komputer/laptop untuk menjembatani browser/HP ke TV.
4. **Power-On Hanya Berfungsi Saat TV Standby:** Tombol Power hanya bisa menyalakan TV jika TV berada dalam kondisi *Standby/Sleep* (modul Wi-Fi TV masih aktif). Jika kabel colokan TV dicabut atau TV mati total (*Cold Boot*), modul Wi-Fi TV mati sehingga TV harus dinyalakan manual atau via remote fisik inframerah.

---

## Lisensi

MIT License. Bebas digunakan dan dimodifikasi untuk kebutuhan pribadi maupun pengembangan lebih lanjut.
