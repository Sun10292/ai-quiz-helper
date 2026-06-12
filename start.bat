@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo   📝 AI 智能出题助手
echo ========================================
echo.
echo 正在启动服务...
start "" http://localhost:3000
npm run dev
pause
