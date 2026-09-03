@echo off
echo Stopping Kisan Suvidha Full-Stack Servers...
taskkill /F /IM python.exe /IM node.exe 2>nul
echo Kisan Suvidha servers stopped successfully.
