@echo off
REM ==============================================================================
REM WebMote 1-Click Launcher (Windows)
REM Cukup klik dua kali (Double-Click) file ini untuk langsung menjalankan WebMote!
REM ==============================================================================

cd /d "%~dp0"

echo ============================================================
echo [WebMote] Menyalakan 8-Bit TV Remote...
echo ============================================================

REM Buka browser otomatis setelah 2 detik
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

REM 1. Coba standalone binary jika ada
if exist "webmote.exe" (
    webmote.exe
    goto :end
)

if exist "webmote" (
    webmote
    goto :end
)

REM 2. Coba jalankan via Bun
where bun >nul 2>nul
if %errorlevel% equ 0 (
    bun run dev:bun
    goto :end
)

REM 3. Coba jalankan via Node / npx / npm
where npx >nul 2>nul
if %errorlevel% equ 0 (
    npx tsx server/index.ts
    goto :end
)

where npm >nul 2>nul
if %errorlevel% equ 0 (
    npm run dev
    goto :end
)

echo.
echo [PERINGATAN] Node.js atau Bun belum terinstal di komputer Anda.
echo Silakan unduh dan pasang salah satunya:
echo   - Node.js: https://nodejs.org
echo   - Bun:     https://bun.sh
echo.
pause

:end
