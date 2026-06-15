@echo off
title EduTech AI Starter Script
echo ===================================================
echo               EduTech AI local run script
echo          Supporting SDG 4: Quality Education
echo ===================================================
echo.

:: Ensure folders exist
cd %~dp0

echo [Step 1/3] Starting Python FastAPI AI Service...
start "FastAPI AI Service" cmd /k "cd ai-service && pip install -r requirements.txt && python main.py"

echo [Step 2/3] Starting Spring Boot Backend (Uses Local H2 Database Fallback)...
start "Spring Boot Backend" cmd /k "cd backend && run-backend.bat"

echo [Step 3/3] Starting Next.js 15 Frontend Portal...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Done! All services have been launched in separate terminals:
echo   - AI Service:   http://localhost:8000
echo   - Backend API:  http://localhost:8080
echo   - Frontend UI:  http://localhost:3000
echo   - H2 Console:   http://localhost:8080/h2-console
echo.
echo Please allow 10-15 seconds for compilation and startup.
echo You can use the "Fast-Track" buttons on the login page
echo to explore the fully functional student/admin demo!
echo ===================================================
pause
