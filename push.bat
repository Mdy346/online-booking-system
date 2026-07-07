@echo off
cd /d "D:\MyPro\online-booking-system"

echo === 1. ?????????? ===
git commit -m "feat: add backend Spring Boot project with full REST API implementation"

echo === 2. ???????? ===
git pull origin main --rebase

echo === 3. ??? GitHub ===
git push origin main

echo === ??! ===
pause
