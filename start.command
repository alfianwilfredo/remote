#!/bin/bash
# ==============================================================================
# WebMote 1-Click Launcher (macOS)
# Cukup klik dua kali (Double-Click) file ini untuk langsung menjalankan WebMote!
# ==============================================================================

cd "$(dirname "$0")"

echo "============================================================"
echo "🎮 Menyalakan WebMote 8-Bit TV Remote..."
echo "============================================================"

# Buka browser otomatis setelah 1.5 detik
(sleep 1.5 && open "http://localhost:3000") &

# 1. Prioritaskan standalone binary jika sudah di-build
xattr -cr . 2>/dev/null || true
chmod +x ./webmote* 2>/dev/null || true

if [ -f "./webmote-macos-arm64" ]; then
  ./webmote-macos-arm64
elif [ -f "./webmote-macos-x64" ]; then
  ./webmote-macos-x64
elif [ -f "./webmote" ]; then
  ./webmote
# 2. Coba jalankan via Bun
elif command -v bun >/dev/null 2>&1; then
  bun run dev:bun
# 3. Coba jalankan via Node.js / NPM / npx
elif command -v npx >/dev/null 2>&1; then
  npx tsx server/index.ts
elif command -v npm >/dev/null 2>&1; then
  npm run dev
else
  echo ""
  echo "⚠️ PERINGATAN: Node.js atau Bun belum terinstal di Mac Anda."
  echo "Silakan unduh dan pasang salah satunya:"
  echo "  👉 Node.js: https://nodejs.org"
  echo "  👉 Bun:     https://bun.sh"
  echo ""
  read -p "Tekan [Enter] untuk keluar..."
fi
