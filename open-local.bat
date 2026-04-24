@echo off
setlocal EnableExtensions

cd /d "%~dp0"

set "PORT=8000"
set "NO_OPEN=0"
set "CHECK_ONLY=0"

:parse_args
if "%~1"=="" goto args_done
if /I "%~1"=="--no-open" (
  set "NO_OPEN=1"
  shift
  goto parse_args
)
if /I "%~1"=="--check" (
  set "CHECK_ONLY=1"
  shift
  goto parse_args
)
if /I "%~1"=="--port" (
  shift
  if "%~1"=="" (
    echo [ERROR] --port requires a value, for example: --port 9000
    exit /b 2
  )
  set "PORT=%~1"
  shift
  goto parse_args
)
echo [WARN] Ignoring unknown argument: %~1
shift
goto parse_args

:args_done
set "PY_CMD="
where py >nul 2>nul
if %ERRORLEVEL%==0 set "PY_CMD=py"
if not defined PY_CMD (
  where python >nul 2>nul
  if %ERRORLEVEL%==0 set "PY_CMD=python"
)

if not defined PY_CMD (
  echo [ERROR] Python was not found.
  echo [ERROR] Install Python 3, then run this file again.
  echo [ERROR] Download: https://www.python.org/downloads/
  pause
  exit /b 1
)

echo [INFO] Project root: %CD%
echo [INFO] Python command: %PY_CMD%
echo [INFO] Starting local server on port %PORT%

if "%CHECK_ONLY%"=="1" (
  echo [INFO] Check passed. Python and script are ready.
  exit /b 0
)

if "%NO_OPEN%"=="0" (
  start "" "http://127.0.0.1:%PORT%/index.html"
)

echo [INFO] Keep this window open. Press Ctrl+C to stop the server.
%PY_CMD% -m http.server %PORT%
