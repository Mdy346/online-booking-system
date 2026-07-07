@echo off
cd /d "D:\MyPro\online-booking-system\backend"
set PATH=D:\soft\OrcaleJdk\jdk21\apache-maven-3.9.16\bin;%PATH%
echo ???????????...
mvn spring-boot:run > "D:\MyPro\online-booking-system\backend\startup.log" 2>&1
echo Exit code: %ERRORLEVEL%
