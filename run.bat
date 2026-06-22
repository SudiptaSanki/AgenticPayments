@echo off
title Agentic Pay - Full Stack
cd /d "%~dp0"

echo Starting Agentic Pay full stack...
echo.

start "Agentic Pay Backend (port 3000)" cmd /k "cd /d "%~dp0agentic-payments-ui\backend" && node server.js"
timeout /t 2 /nobreak >nul
start "Agentic Pay Frontend (port 5173)" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Backend:  http://localhost:3000/api/health
echo Frontend: http://localhost:5173
echo.
echo Both servers launched in separate windows.
pause
