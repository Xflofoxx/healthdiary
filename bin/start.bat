@echo off
echo Starting Healthdiary...
echo.

echo [1/2] Starting server...
start "Healthdiary Server" cmd /k "cd /d %~dp0..\server && bun run dev"

echo [2/2] Starting client...
start "Healthdiary Client" cmd /k "cd /d %~dp0..\client && bun start"

echo.
echo ================================================
echo Healthdiary is running!
echo Server: http://localhost:3000
echo Client: http://localhost:4200
echo ================================================
