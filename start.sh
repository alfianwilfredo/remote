#!/bin/bash
# ==============================================================================
# WebMote 1-Click Launcher (Linux)
# Cukup jalankan atau double-click file ini untuk menyalakan WebMote!
# ==============================================================================

cd "$(dirname "$0")"

echo "============================================================"
echo "🎮 Menyalakan WebMote 8-Bit TV Remote..."
echo "============================================================"

# Buka browser otomatis di Linux via xdg-open atau gio
(
  sleep 1.5
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:3000"
  elif command -v gio >/dev/null 2>&1; then
    gio open "http://localhost:3000"
  fi
) &

chmod +x ./webmote* 2>/dev/null || true

# 1. Coba standalone binary jika ada
if [ -f "./webmote-linux-x64" ]; then
  ./webmote-linux-x64
elif [ -f "./webmote" ]; then
  ./webmote
# 2. Coba jalankan via Bun
elif command -v bun >/dev/null 2>&1; then
  bun run dev:bun
# 3. Coba jalankan via Node / npx / npm
elif command -v npx >/dev/null 2>&1; then
  npx tsx server/index.ts
elif command -v npm >/dev/null 2>&1; then
  npm run dev
else
  echo ""
  echo "⚠️ PERINGATAN: Node.js atau Bun belum terinstal di komputer Linux Anda."
  echo "Silakan unduh dan pasang salah satunya:"
  echo "  👉 Node.js: https://nodejs.org"
  echo "  👉 Bun:     https://bun.sh"
  echo ""
  read -p "Tekan [Enter] untuk keluar..."
fi
