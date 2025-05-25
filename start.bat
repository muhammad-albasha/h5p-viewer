@echo off
echo Starting H5P Viewer application...

REM Start Docker containers
echo Starting MySQL database and phpMyAdmin...
docker-compose up -d

REM Wait for database to initialize
echo Waiting for database to initialize (10 seconds)...
timeout /t 10 /nobreak > NUL

REM Prepare H5P environment 
echo Setting up H5P environment...
call npm run prepare-h5p

REM Start NextJS application
echo Starting NextJS application...
npm run dev
