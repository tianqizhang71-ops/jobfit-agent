$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonPath = Join-Path $projectRoot ".venv\Scripts\python.exe"
$nodePath = (Get-Command node).Source

if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw "缺少 .venv，请先在项目目录运行：python -m venv .venv"
}

function Test-LocalPort([int]$Port) {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $client.Connect("127.0.0.1", $Port)
        $client.Close()
        return $true
    } catch {
        return $false
    }
}

function Start-HiddenCommand([string]$FileName, [string]$Arguments) {
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = $FileName
    $info.Arguments = $Arguments
    $info.WorkingDirectory = $projectRoot
    $info.UseShellExecute = $true
    $info.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $info.CreateNoWindow = $true
    return [System.Diagnostics.Process]::Start($info)
}

if (-not (Test-LocalPort 8000)) {
    $backend = Start-HiddenCommand $pythonPath "-m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"
    Write-Host "JobFit 后端已启动，进程 $($backend.Id)"
} else {
    Write-Host "8000 端口已有后端运行"
}

if (-not (Test-LocalPort 4173)) {
    $frontend = Start-HiddenCommand $nodePath "node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173"
    Write-Host "JobFit 网页已启动，进程 $($frontend.Id)"
} else {
    Write-Host "4173 端口已有网页运行"
}

Write-Host "请打开：http://localhost:4173/"
