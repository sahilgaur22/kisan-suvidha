@echo off
echo Starting Kisan Suvidha Full-Stack Servers...
start "Backend API (FastAPI)" cmd /k "cd backend && ..\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
start "Frontend Web (Next.js)" cmd /k "cd frontend && npm run dev"
echo Opening Kisan Suvidha Web Portal in your browser...
timeout /t 7 >nul
start http://localhost:3000
