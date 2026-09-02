# WebMote

Web remote control berbasis browser untuk Android TV dan Google TV. Berjalan langsung di jaringan lokal tanpa iklan, tanpa telemetri, dan dengan UI retro 8-bit NES.

Frontend dibangun tanpa build step (pure HTML5, CSS, dan vanilla JS berukuran < 30 KB), disajikan langsung oleh backend hybrid yang mendukung Node.js dan Bun.

---

## Fitur

- **Zero-Build & Ringan:** Payload frontend < 30 KB tanpa framework berat (React, Vite, dan Tailwind dihapus untuk memangkas latensi dan ukuran bundle).
- **Multi-Runtime:** Berjalan di Node.js (`npm`, `pnpm`, `yarn`) dan `bun`, atau dapat dikompilasi jadi 1 file binary mandiri (`./webmote`).
- **Protokol Hybrid:** Menggunakan Android TV Remote Protocol v2 (TLS + PIN pairing) dengan fallback ke Wireless ADB (port 5555).
- **Fast Text Input & YouTube Search:** Mengetik teks panjang langsung ke input box aktif di TV atau mencari video langsung di YouTube TV.
- **Deep Link App Cartridges:** 1-klik buka aplikasi YouTube, Netflix, Spotify, Disney+ Hotstar, Prime Video, dan Twitch.
- **Synthesizer Web Audio:** Efek suara retro 8-bit sintetis tanpa memuat file audio eksternal.
- **PWA Ready:** Tampilan responsif dan bisa di-install ke Home Screen HP agar tampil fullscreen tanpa address bar.

---

## Persyaratan

- **Node.js** (v18+) atau **Bun** (v1.0+) di laptop/komputer.
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

## Mengetik Teks & Cari di YouTube

1. Ketik teks di kolom **FAST TEXT INPUT**.
2. **TYPE TEXT:** Mengirim seluruh teks langsung ke kotak input yang sedang aktif di TV. Aktifkan **AUTO-ENTER: ON** jika ingin otomatis menekan Enter setelah teks terkirim.
3. **YT SEARCH:** Otomatis membuka aplikasi YouTube TV dan mencari video sesuai kata kunci yang diketik.

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
5. **Belum Ada Voice Search:** Belum mendukung transmisi stream audio mikrofon browser ke Google Assistant TV.

---

## Lisensi

MIT License. Bebas digunakan dan dimodifikasi untuk kebutuhan pribadi maupun pengembangan lebih lanjut.
