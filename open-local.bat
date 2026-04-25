@echo off
setlocal EnableExtensions

cd /d "%~dp0"

set "PORT=8000"
set "NO_OPEN=0"
set "CHECK_ONLY=0"
set "PY_CMD="
set "PS_CMD="

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
where py >nul 2>nul
if %ERRORLEVEL%==0 set "PY_CMD=py"
if not defined PY_CMD (
  where python >nul 2>nul
  if %ERRORLEVEL%==0 set "PY_CMD=python"
)

where pwsh >nul 2>nul
if %ERRORLEVEL%==0 set "PS_CMD=pwsh"
if not defined PS_CMD (
  where powershell >nul 2>nul
  if %ERRORLEVEL%==0 set "PS_CMD=powershell"
)
if not defined PS_CMD (
  if exist "%ProgramFiles%\PowerShell\7\pwsh.exe" set "PS_CMD=%ProgramFiles%\PowerShell\7\pwsh.exe"
)
if not defined PS_CMD (
  if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" set "PS_CMD=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
)

echo [INFO] Project root: %CD%
echo [INFO] Requested port: %PORT%
if defined PY_CMD (
  echo [INFO] Python command: %PY_CMD%
) else (
  echo [INFO] Python command: not found
)
if defined PS_CMD (
  echo [INFO] PowerShell command: %PS_CMD%
) else (
  echo [INFO] PowerShell command: not found
)

if "%CHECK_ONLY%"=="1" (
  if defined PY_CMD (
    echo [INFO] Check passed. Python backend is available.
    exit /b 0
  )
  if defined PS_CMD (
    echo [INFO] Check passed. PowerShell fallback backend is available.
    exit /b 0
  )
  echo [ERROR] Check failed. Neither Python nor PowerShell was found.
  exit /b 1
)

if defined PY_CMD (
  echo [INFO] Starting local server on port %PORT% (backend: python)
  if "%NO_OPEN%"=="0" (
    start "" "http://127.0.0.1:%PORT%/index.html"
  )
  echo [INFO] Keep this window open. Press Ctrl+C to stop the server.
  "%PY_CMD%" -m http.server %PORT%
  exit /b %ERRORLEVEL%
)

if defined PS_CMD (
  echo [INFO] Starting local server on port %PORT% (backend: powershell)
  echo [INFO] Keep this window open. Press Ctrl+C to stop the server.
  if "%NO_OPEN%"=="0" (
    "%PS_CMD%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-local.ps1" -Port %PORT% -RootPath "%CD%"
  ) else (
    "%PS_CMD%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-local.ps1" -Port %PORT% -RootPath "%CD%" -NoOpen
  )
  exit /b %ERRORLEVEL%
)

echo [ERROR] Python and PowerShell were not found.
echo [ERROR] Install Python 3, or enable Windows PowerShell.
pause
exit /b 1
