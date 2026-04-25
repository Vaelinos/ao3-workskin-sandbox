param(
  [int]$Port = 8000,
  [string]$RootPath = "",
  [switch]$NoOpen
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($RootPath)) {
  $RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
}

$RootFullPath = [System.IO.Path]::GetFullPath($RootPath)
if (-not (Test-Path -LiteralPath $RootFullPath -PathType Container)) {
  throw "Root path does not exist: $RootFullPath"
}

function Get-ContentType {
  param([string]$Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".htm" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".gif" { return "image/gif" }
    ".svg" { return "image/svg+xml" }
    ".ico" { return "image/x-icon" }
    ".webp" { return "image/webp" }
    ".txt" { return "text/plain; charset=utf-8" }
    default { return "application/octet-stream" }
  }
}

function Resolve-SafeFilePath {
  param(
    [string]$Root,
    [string]$RequestPath
  )

  $relativePath = ($RequestPath -replace "^/+", "")
  $relativePath = [System.Uri]::UnescapeDataString($relativePath)
  if ([string]::IsNullOrWhiteSpace($relativePath)) {
    $relativePath = "index.html"
  }

  $candidatePath = [System.IO.Path]::GetFullPath((Join-Path -Path $Root -ChildPath $relativePath))
  if (-not $candidatePath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  if (Test-Path -LiteralPath $candidatePath -PathType Container) {
    $candidatePath = [System.IO.Path]::GetFullPath((Join-Path -Path $candidatePath -ChildPath "index.html"))
    if (-not $candidatePath.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) {
      return $null
    }
  }

  return $candidatePath
}

function Write-HttpResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$Reason,
    [string]$ContentType,
    [byte[]]$BodyBytes,
    [string]$Method
  )

  $statusLine = "HTTP/1.1 $StatusCode $Reason`r`n"
  $headers =
    "Content-Type: $ContentType`r`n" +
    "Content-Length: $($BodyBytes.LongLength)`r`n" +
    "Connection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($statusLine + $headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)

  if ($Method -ne "HEAD" -and $BodyBytes.Length -gt 0) {
    $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
  }
}

$prefix = "http://127.0.0.1:$Port/"
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)

try {
  $listener.Start()
} catch {
  Write-Error "Failed to start local server on $prefix. The port may already be in use or blocked."
  throw
}

Write-Host "[INFO] Static server root: $RootFullPath"
Write-Host "[INFO] Serving at: $prefix"

if (-not $NoOpen) {
  Start-Process "$prefix" | Out-Null
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader(
        $stream,
        [System.Text.Encoding]::ASCII,
        $false,
        1024,
        $true
      )

      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $emptyBody = [System.Text.Encoding]::UTF8.GetBytes("")
        Write-HttpResponse -Stream $stream -StatusCode 400 -Reason "Bad Request" -ContentType "text/plain; charset=utf-8" -BodyBytes $emptyBody -Method "GET"
        continue
      }

      $parts = $requestLine.Split(" ")
      if ($parts.Count -lt 2) {
        $badBody = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
        Write-HttpResponse -Stream $stream -StatusCode 400 -Reason "Bad Request" -ContentType "text/plain; charset=utf-8" -BodyBytes $badBody -Method "GET"
        continue
      }

      $method = $parts[0].ToUpperInvariant()
      $requestPath = $parts[1]

      while ($true) {
        $headerLine = $reader.ReadLine()
        if ($null -eq $headerLine -or $headerLine.Length -eq 0) {
          break
        }
      }

      if ($method -ne "GET" -and $method -ne "HEAD") {
        $methodBody = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
        Write-HttpResponse -Stream $stream -StatusCode 405 -Reason "Method Not Allowed" -ContentType "text/plain; charset=utf-8" -BodyBytes $methodBody -Method $method
        continue
      }

      $filePath = Resolve-SafeFilePath -Root $RootFullPath -RequestPath $requestPath
      if ($null -eq $filePath -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
        $notFoundBody = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        Write-HttpResponse -Stream $stream -StatusCode 404 -Reason "Not Found" -ContentType "text/plain; charset=utf-8" -BodyBytes $notFoundBody -Method $method
      } else {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $contentType = Get-ContentType -Path $filePath
        Write-HttpResponse -Stream $stream -StatusCode 200 -Reason "OK" -ContentType $contentType -BodyBytes $bytes -Method $method
      }
    } catch {
      try {
        if ($client -and $client.Connected) {
          $stream = $client.GetStream()
          $body = [System.Text.Encoding]::UTF8.GetBytes("500 Internal Server Error")
          Write-HttpResponse -Stream $stream -StatusCode 500 -Reason "Internal Server Error" -ContentType "text/plain; charset=utf-8" -BodyBytes $body -Method "GET"
        }
      } catch {
      }
    } finally {
      if ($client) {
        $client.Close()
      }
    }
  }
} finally {
  if ($listener) {
    $listener.Stop()
  }
}
