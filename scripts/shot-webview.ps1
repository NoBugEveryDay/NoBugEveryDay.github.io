# Whale-girl mascot QA screenshot: PowerShell + WebView2 (real Chromium pipeline, composites WebGL).
# Config via env vars (WSL interop can't pass -File UNC paths):
#   WV_URL  WV_OUT  WV_WIDTH  WV_HEIGHT  WV_WAITMS  WV_DARK=1
# Usage: WV_URL=... WV_OUT='C:\...\out.png' powershell.exe -NoProfile -ExecutionPolicy Bypass -Command - < scripts/shot-webview.ps1
$Url = if ($env:WV_URL) { $env:WV_URL } else { 'https://nobugeveryday.github.io/' }
$Out = if ($env:WV_OUT) { $env:WV_OUT } else { "$env:TEMP\dshp-webview.png" }
$Width = if ($env:WV_WIDTH) { [int]$env:WV_WIDTH } else { 1280 }
$Height = if ($env:WV_HEIGHT) { [int]$env:WV_HEIGHT } else { 860 }
$WaitMs = if ($env:WV_WAITMS) { [int]$env:WV_WAITMS } else { 15000 }
$Dark = [bool]$env:WV_DARK
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$wv2Dir = 'C:\Program Files (x86)\Microsoft\EdgeWebView\Application\154.0.4258.62'
if (-not (Test-Path "$wv2Dir\Microsoft.Web.WebView2.Core.dll")) {
    $base = 'C:\Program Files (x86)\Microsoft\EdgeWebView\Application'
    $wv2Dir = Get-ChildItem $base -Directory | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName
}
[System.Reflection.Assembly]::LoadFrom("$wv2Dir\Microsoft.Web.WebView2.Core.dll") | Out-Null
[System.Reflection.Assembly]::LoadFrom("$wv2Dir\Microsoft.Web.WebView2.WinForms.dll") | Out-Null

$form = New-Object System.Windows.Forms.Form
$form.Width = $Width
$form.Height = $Height
$form.ShowInTaskbar = $false
$form.FormBorderStyle = 'None'
$form.StartPosition = 'Manual'
$form.Location = New-Object System.Drawing.Point(-10000, -10000)
$form.Opacity = 0.01

$wv = New-Object Microsoft.Web.WebView2.WinForms.WebView2
$wv.Width = $Width
$wv.Height = $Height
$form.Controls.Add($wv)
$form.Show()

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$envObj = New-Object Microsoft.Web.WebView2.Core.CoreWebView2Environment($wv2Dir)
$wv.EnsureCoreWebView2Async($envObj) | Out-Null
while ($wv.CoreWebView2 -eq $null -and $sw.ElapsedMilliseconds -lt 30000) {
    [System.Windows.Forms.Application]::DoEvents()
    Start-Sleep -Milliseconds 100
}
if ($wv.CoreWebView2 -eq $null) { throw 'WebView2 init timeout' }

$wv.CoreWebView2.Settings.AreDefaultContextMenusEnabled = $false
$wv.CoreWebView2.Settings.AreDevToolsEnabled = $false
if ($Dark) {
    $wv.CoreWebView2.Profile.PreferredColorScheme = [Microsoft.Web.WebView2.Core.CoreWebView2PreferredColorScheme]::Dark
}

$script:navDone = $false
$wv.CoreWebView2.add_NavigationCompleted({ $script:navDone = $true })
$wv.CoreWebView2.Navigate($Url)
$sw.Restart()
while (-not $script:navDone -and $sw.ElapsedMilliseconds -lt 45000) {
    [System.Windows.Forms.Application]::DoEvents()
    Start-Sleep -Milliseconds 100
}
Start-Sleep -Milliseconds $WaitMs
[System.Windows.Forms.Application]::DoEvents()
Start-Sleep -Milliseconds 300

$stream = [System.IO.File]::Create($Out)
$wv.CoreWebView2.CapturePreviewAsync(
    [Microsoft.Web.WebView2.Core.CoreWebView2CapturePreviewImageFormat]::Png, $stream
).GetAwaiter().GetResult()
$stream.Close()
$form.Close()
Write-Output "WEBVIEW_SHOT_OK $Out"
