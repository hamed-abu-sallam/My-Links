@echo off
REM Start local server for My_Links app
cd /d "%~dp0"
echo.
echo ========================================
echo   🚀 Starting Smart Task Manager Server
echo ========================================
echo.
echo Opening browser...
timeout /t 2 /nobreak
start http://localhost:8000
echo.
echo Server running at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
pause
