:: Deployment script for the TiTan-6 project
@echo off
:: Change to the project directory
cd /d C:\Users\19625\Documents\GitHub\casa0017-web-TiTan-6\Website\back-end

:: Get the ip address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4 Address"') do (
    set ip=%%a
    call set ip=%%ip:~1%%
)

:: Start the server
echo Starting the server...
start node server.js
echo Deployment completed! The server is running on http://%ip%:3000.
echo For Chinese users, its a little bit confusing that the web have two ip address display on two terminals, one is start with 192, another is start with 10. 
echo However, both of them can be used to access the web.
pause
