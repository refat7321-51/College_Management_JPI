@echo off
title "Academic Portal & Management System"
color 0A

echo.
echo  ================================================================
echo    ACADEMIC PORTAL AND MANAGEMENT SYSTEM
echo    One-Click Auto Setup and Launcher
echo    Version 2.0
echo  ================================================================
echo.
echo  This script will automatically:
echo    [1] Check Python is installed
echo    [2] Create .env config file if missing
echo    [3] Create a virtual environment (.venv)
echo    [4] Install all required Python packages
echo    [5] Create media folders and run database setup
echo    [6] Launch the web server and open your browser
echo.
echo  ================================================================
echo.

cd /d "%~dp0"

:: ---------------------------------------------------------------
:: STEP 1 - Detect Python
:: ---------------------------------------------------------------
echo [1/6] Checking Python installation...

set PY_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    set PY_CMD=py
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo  ================================================================
        echo   [ERROR] Python is not installed or not added to PATH!
        echo  ================================================================
        echo   Please download Python from: https://www.python.org/downloads/
        echo   Make sure to check "Add python.exe to PATH" during installation.
        echo.
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%v in ('%PY_CMD% --version 2^>^&1') do set PY_VER=%%v
echo     [OK] Found: %PY_VER%  (command: %PY_CMD%)
echo.

:: ---------------------------------------------------------------
:: STEP 2 - Create .env config file
:: ---------------------------------------------------------------
echo [2/6] Checking configuration (.env)...

if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo     [OK] Created .env from .env.example
    ) else (
        (
            echo EMAIL_HOST_USER=your_gmail@gmail.com
            echo EMAIL_HOST_PASSWORD=your_16_character_app_password
        ) > .env
        echo     [OK] Created default .env file
    )
) else (
    echo     [OK] .env file already exists.
)
echo.

:: ---------------------------------------------------------------
:: STEP 3 - Create Virtual Environment
:: ---------------------------------------------------------------
echo [3/6] Setting up virtual environment (.venv)...

if not exist .venv\Scripts\python.exe (
    echo     Creating virtual environment...
    %PY_CMD% -m venv .venv
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo  [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo     [OK] Virtual environment created in .venv\
) else (
    echo     [OK] Virtual environment already exists - skipping creation.
)
echo.

set VENV_PY=.venv\Scripts\python.exe
set VENV_PIP=.venv\Scripts\pip.exe

:: ---------------------------------------------------------------
:: STEP 4 - Install Required Packages
:: ---------------------------------------------------------------
echo [4/6] Checking Python packages...

%VENV_PY% -c "import django" >nul 2>&1
if %errorlevel% equ 0 (
    echo     [OK] Required packages already installed - skipping download.
) else (
    echo     Installing packages from requirements.txt...
    if exist requirements.txt (
        %VENV_PIP% install -r requirements.txt
        echo     [OK] All packages installed successfully!
    ) else (
        echo     [WARNING] requirements.txt not found.
    )
)
echo.

:: ---------------------------------------------------------------
:: STEP 5 - Create Media Folders + Database Migration
:: ---------------------------------------------------------------
echo [5/6] Preparing database and media folders...

if not exist media           mkdir media
if not exist media\profiles  mkdir media\profiles
if not exist media\notices   mkdir media\notices
if not exist media\routines  mkdir media\routines
if not exist media\assignments mkdir media\assignments
if not exist media\books     mkdir media\books
echo     [OK] Media folders are ready.

echo     Checking database migrations...
%VENV_PY% manage.py makemigrations --verbosity 0 >nul 2>&1
%VENV_PY% manage.py migrate --noinput --verbosity 0 >nul 2>&1
echo     [OK] Database is ready!
echo.

:: ---------------------------------------------------------------
:: STEP 6 - Launch Server & Open Browser
:: ---------------------------------------------------------------
echo [6/6] Starting the web server...
echo.
echo  ================================================================
echo.
echo    SETUP COMPLETE! Your system is ready.
echo.
echo    Open this URL in your browser:
echo       http://127.0.0.1:8000
echo.
echo    The browser will open automatically in a few seconds.
echo.
echo    To STOP the server: press Ctrl + C in this window.
echo.
echo  ================================================================
echo.

timeout /t 2 >nul
start "" "http://127.0.0.1:8000"

%VENV_PY% manage.py runserver 0.0.0.0:8000

echo.
echo  Server stopped. Press any key to close this window.
pause >nul
