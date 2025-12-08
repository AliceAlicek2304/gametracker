Add-Type -AssemblyName System.Web

# ========================================
# Load Configuration from GitHub
# ========================================
try {
    $configUrl = "https://raw.githubusercontent.com/AliceAlicek2304/gametracker/main/config.json"
    $config = Invoke-RestMethod -Uri $configUrl -TimeoutSec 10
    $environment = $config.activeEnvironment
    $BACKEND_URL = $config.backend.$environment
    $FRONTEND_URL = $config.frontend.$environment
}
catch {
    $BACKEND_URL = "http://localhost:8080"
    $FRONTEND_URL = "http://localhost:3000"
}
# ========================================

$gamePath = $null
$urlFound = $false
$logFound = $false
$folderFound = $false
$err = ""
$checkedDirectories = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$originalErrorPreference = $ErrorActionPreference

# We silence errors for path searching to not confuse users
$ErrorActionPreference = "SilentlyContinue"

Write-Output "Attempting to find URL automatically..."

#Args: [0] - $gamepath
function LogCheck {
    if (!(Test-Path $args[0])) {
        $folderFound = $false
        $logFound = $false
        $urlFound = $false
        return $folderFound, $logFound, $urlFound
    }
    else {
        $folderFound = $true
    }
    $gachaLogPath = $args[0] + '\Client\Saved\Logs\Client.log'
    $debugLogPath = $args[0] + '\Client\Binaries\Win64\ThirdParty\KrPcSdk_Global\KRSDKRes\KRSDKWebView\debug.log'
    $engineIniPath = $args[0] + '\Client\Saved\Config\WindowsNoEditor\Engine.ini'

    $logDisabled = $false
    if (Test-Path $engineIniPath) {
        $engineIniContent = Get-Content $engineIniPath -Raw
        if ($engineIniContent -match '\[Core\.Log\][\r\n]+Global=(off|none)') {
            $logDisabled = $true
            
            Write-Host "`nERROR: Your Engine.ini file contains a setting that prevents you from importing your data. Would you like us to attempt to automatically fix it?" -ForegroundColor Red
            Write-Host "`nWe can automatically edit your $engineIniPath file to re-enable logging. You will need to re-import and run this script afterwards.`n"
            Write-Warning "We are not responsible for any consequences from this script. Please proceed at your own risk!`n`n"
            
            $confirmation = Read-Host "Do you want to proceed? (Y/N)"
            if ($confirmation -ne 'Y' -and $confirmation -ne 'y') {
                Write-Host "`nERROR: Unable to import data due to bad Engine.ini file. Press any key to continue..." -ForegroundColor Red
                $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
                exit
            }

            if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
                Write-Host "`n"
                Write-Warning "You need administrator rights to modify the game's Program Files. Attempting to restart PowerShell as admin..."
                Start-Process powershell.exe "-File `"$PSCommandPath`"" -Verb RunAs
                exit
            }
            
            $backupPath = $engineIniPath + ".backup"
            Copy-Item -Path $engineIniPath -Destination $backupPath -Force
            Write-Host "Created backup at $backupPath" -ForegroundColor Green
            
            $newContent = $engineIniContent -replace '\[Core\.Log\][^\[]*', ''
            Set-Content -Path $engineIniPath -Value $newContent
            Write-Host "`nSuccessfully modified Engine.ini to enable logging." -ForegroundColor Green
            Write-Host "`nPlease restart your game and open the Convene History page before running this script again." -ForegroundColor Yellow
            $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
            exit
        }
    }

    if (Test-Path $gachaLogPath) {
        $logFound = $true
        $gachaUrlEntry = Select-String -Path $gachaLogPath -Pattern "https://aki-gm-resources(-oversea)?\.aki-game\.(net|com)/aki/gacha/index\.html#/record*" | Select-Object -Last 1
        if ([string]::IsNullOrWhiteSpace($gachaUrlEntry)) {
            $gachaUrlEntry = $null
        }
    }
    else {
        $gachaUrlEntry = $null
    }

    if (Test-Path $debugLogPath) {
        $logFound = $true
        $debugUrlEntry = Select-String -Path $debugLogPath -Pattern '"#url": "(https://aki-gm-resources(-oversea)?\.aki-game\.(net|com)/aki/gacha/index\.html#/record[^"]*)"' | Select-Object -Last 1
        if ([string]::IsNullOrWhiteSpace($debugUrlEntry)) {
            $debugUrl = $null
        }
        else {
            $debugUrl = $debugUrlEntry.Matches.Groups[1].Value
        }
    }
    else {
        $debugUrl = $null
    }

    if ($gachaUrlEntry -or $debugUrl) {
        if ($gachaUrlEntry) {
            $urlToCopy = $gachaUrlEntry -replace '.*?(https://aki-gm-resources(-oversea)?\.aki-game\.(net|com)[^"]*).*', '$1'
        }
        if ([string]::IsNullOrWhiteSpace($urlToCopy)) {
            $urlToCopy = $debugUrl
        }

        if (![string]::IsNullOrWhiteSpace($urlToCopy)) {
            $urlFound = $true
            
            # COPY TO CLIPBOARD AND NOTIFY USER
            try {
                Set-Clipboard -Value $urlToCopy
                Write-Host "✓ Gacha URL found and copied to clipboard!" -ForegroundColor Green
                Write-Host "Please paste it into the input box on the website." -ForegroundColor Cyan
                
                # Auto-open Chrome with tracker URL
                $websiteUrl = "$FRONTEND_URL/tracker"
                
                # Try to open in Chrome
                $chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
                if (Test-Path $chromePath) {
                    Start-Process $chromePath $websiteUrl
                }
                else {
                    # Fallback to default browser
                    Start-Process $websiteUrl
                }
            }
            catch {
                Write-Host "✗ Failed to copy to clipboard" -ForegroundColor Red
            }
        }
    }
    return $folderFound, $logFound, $urlFound
}

function SearchAllDiskLetters {
    Write-Host "Searching all disk letters (A-Z) for Wuthering Waves Game folder..." -ForegroundColor Yellow
    
    $availableDrives = Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Name
    Write-Host "Available drives: $($availableDrives -join ', ')" -ForegroundColor Yellow
    
    foreach ($driveLetter in [char[]](65..90)) {
        $drive = "$($driveLetter):"
        
        if ($driveLetter -notin $availableDrives) {
            continue
        }
        
        Write-Host "Searching drive $drive..."
        
        $gamePaths = @(
            "$drive\SteamLibrary\steamapps\common\Wuthering Waves",
            "$drive\SteamLibrary\steamapps\common\Wuthering Waves\Wuthering Waves Game",
            "$drive\Program Files (x86)\Steam\steamapps\common\Wuthering Waves\Wuthering Waves Game",
            "$drive\Program Files (x86)\Steam\steamapps\common\Wuthering Waves",
            "$drive\Program Files\Steam\steamapps\common\Wuthering Waves\Wuthering Waves Game",
            "$drive\Program Files\Steam\steamapps\common\Wuthering Waves",
            "$drive\Games\Steam\steamapps\common\Wuthering Waves\Wuthering Waves Game",
            "$drive\Games\Steam\steamapps\common\Wuthering Waves",
            "$drive\Steam\steamapps\common\Wuthering Waves\Wuthering Waves Game",
            "$drive\Steam\steamapps\common\Wuthering Waves",
            "$drive\SteamLibrary\steamapps\common\Wuthering Waves\Wuthering Waves Game",
            "$drive\SteamLibrary\steamapps\common\Wuthering Waves",
            "$drive\Program Files\Epic Games\WutheringWavesj3oFh",
            "$drive\Program Files\Epic Games\WutheringWavesj3oFh\Wuthering Waves Game",
            "$drive\Program Files (x86)\Epic Games\WutheringWavesj3oFh",
            "$drive\Program Files (x86)\Epic Games\WutheringWavesj3oFh\Wuthering Waves Game",
            "$drive\Wuthering Waves Game",
            "$drive\Wuthering Waves\Wuthering Waves Game",
            "$drive\Program Files\Wuthering Waves\Wuthering Waves Game",
            "$drive\Games\Wuthering Waves Game",
            "$drive\Games\Wuthering Waves\Wuthering Waves Game",
            "$drive\Program Files (x86)\Wuthering Waves\Wuthering Waves Game"
        )

    
        foreach ($path in $gamePaths) {
            if (!(Test-Path $path)) {
                continue
            }
            
            Write-Host "Found potential game folder: $path" -ForegroundColor Green
            
            if ($path -like "*OneDrive*") {
                $err += "Skipping path as it contains 'OneDrive': $($path)`n"
                continue
            }

            if ($checkedDirectories.Contains($path)) {
                $err += "Already checked: $($path)`n"
                continue
            }
            
            $checkedDirectories.Add($path) | Out-Null
            $folderFound, $logFound, $urlFound = LogCheck $path
            
            if ($urlFound) { 
                return $true
            }
            elseif ($logFound) {                
                $err += "Path checked: $($path).`n"
                $err += "Cannot find the convene history URL in both Client.log and debug.log! Please open your Convene History first!`n"
                $err += "Contact Us if you think this is correct directory and still facing issues.`n"
            }
            elseif ($folderFound) {
                $err += "No logs found at $path`n"
            }
            else {
                $err += "No Installation found at $path`n"
            }
        }
    }
    
    return $false
}

# MUI Cache
if (!$urlFound) {
    $muiCachePath = "Registry::HKEY_CURRENT_USER\Software\Classes\Local Settings\Software\Microsoft\Windows\Shell\MuiCache"
    try {
        $filteredEntries = (Get-ItemProperty -Path $muiCachePath -ErrorAction SilentlyContinue).PSObject.Properties | Where-Object { $_.Value -like "*wuthering*" } | Where-Object { $_.Name -like "*client-win64-shipping.exe*" }
        if ($filteredEntries.Count -ne 0) {
            $err += "MUI Cache($($filteredEntries.Count)):`n"
            foreach ($entry in $filteredEntries) {
                $gamePath = ($entry.Name -split '\\client\\')[0]
                if ($gamePath -like "*OneDrive*") {
                    $err += "Skipping path as it contains 'OneDrive': $($gamePath)`n"
                    continue
                }

                if ($checkedDirectories.Contains($gamePath)) {
                    $err += "Already checked: $($gamePath)`n"
                    continue
                }
                $checkedDirectories.Add($gamePath) | Out-Null
                $folderFound, $logFound, $urlFound = LogCheck $gamePath
                if ($urlFound) { break }
                elseif ($logFound) {
                    $err += "Path checked: $($gamePath).`n"
                    $err += "Cannot find the convene history URL in both Client.log and debug.log! Please open your Convene History first!`n"
                    $err += "Contact Us if you think this is correct directory and still facing issues.`n"
                }
                elseif ($folderFound) {
                    $err += "No logs found at $gamePath`n"
                }
                else {
                    $err += "No Installation found at $gamePath`n"
                }
            }
        }
        else {
            $err += "No entries found in MUI Cache.`n"
        }
    }
    catch {
        $err += "Error accessing MUI Cache: $_`n"
    }
}

# Firewall 
if (!$urlFound) {
    $firewallPath = "Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\FirewallRules"
    try {
        $filteredEntries = (Get-ItemProperty -Path $firewallPath -ErrorAction SilentlyContinue).PSObject.Properties | Where-Object { $_.Value -like "*wuthering*" } | Where-Object { $_.Name -like "*client-win64-shipping*" }
        if ($filteredEntries.Count -ne 0) {
            $err += "Firewall($($filteredEntries.Count)):`n"
            foreach ($entry in $filteredEntries) {
                $gamePath = (($entry.Value -split 'App=')[1] -split '\\client\\')[0]
                if ($gamePath -like "*OneDrive*") {
                    $err += "Skipping path as it contains 'OneDrive': $($gamePath)`n"
                    continue
                }

                if ($checkedDirectories.Contains($gamePath)) {
                    $err += "Already checked: $($gamePath)`n"
                    continue
                }

                $checkedDirectories.Add($gamePath) | Out-Null
                $folderFound, $logFound, $urlFound = LogCheck $gamePath
                if ($urlFound) { break }
                elseif ($logFound) {
                    $err += "Path checked: $($gamePath).`n"
                    $err += "Cannot find the convene history URL in both Client.log and debug.log! Please open your Convene History first!`n"
                    $err += "Contact Us if you think this is correct directory and still facing issues.`n"
                }
                elseif ($folderFound) {
                    $err += "No logs found at $gamePath`n"
                }
                else {
                    $err += "No Installation found at $gamePath`n"
                }
            }
        }
        else {
            $err += "No entries found in firewall.`n"
        }
    }
    catch {
        $err += "Error accessing firewall rules: $_`n"
    }
}

# Native
if (!$urlFound) {
    $64 = "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*"
    $32 = "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
    try {
        $gamePath = (Get-ItemProperty -Path $32, $64 | Where-Object { $_.DisplayName -like "*wuthering*" } | Select-Object -ExpandProperty InstallPath)
        if ($gamePath) {
            if ($gamePath -like "*OneDrive*") {
                $err += "Skipping path as it contains 'OneDrive': $($gamePath)`n"
            }
            elseif ($checkedDirectories.Contains($gamePath)) {
                $err += "Already checked: $($gamePath)`n"
            }
            else {
                $checkedDirectories.Add($gamePath) | Out-Null
                $folderFound, $logFound, $urlFound = LogCheck $gamePath
                if (!$urlFound) {
                    if ($logFound) {
                        $err += "Path checked: $($gamePath).`n"
                        $err += "Cannot find the convene history URL in both Client.log and debug.log! Please open your Convene History first!`n"
                        $err += "Contact Us if you think this is correct directory and still facing issues.`n"
                    }
                    elseif ($folderFound) {
                        $err += "No logs found at $gamePath`n"
                    }
                    else {
                        $err += "No Installation found at $gamePath`n"
                    }
                }
            }
        }
        else {
            $err += "No Entry found for Native Client.`n"
        }
    }
    catch {
        Write-Output "[ERROR] Cannot access registry: $_"
        $gamePath = $null
    }  
}

if (!$urlFound) {
    $urlFound = SearchAllDiskLetters
}

$ErrorActionPreference = $originalErrorPreference

Write-Host $err -ForegroundColor Magenta

# Manual
while (!$urlFound) {
    Write-Host "Game install location not found or log files missing. Did you open your in-game Convene History first?" -ForegroundColor Red
   
    Write-Host @"
    +--------------------------------------------------+
    |         ARE YOU USING A THIRD-PARTY APP?         |
    +--------------------------------------------------+
    | It looks like a third-party script or tool may   |
    | have been used previously. These can interfere   |
    | with the game's logs or import process.          |
    |                                                  |
    | Please disable any such tools or consider        |
    | reinstalling the game before importing again.    |
    +--------------------------------------------------+
"@ -ForegroundColor Yellow
  

    Write-Host "If you think that any of the above installation directory is correct and you've tried disabling third-party apps & reinstalling, please join our Discord server for help: https://wuwatracker.com/discord."
   
    Write-Host "`nOtherwise, please enter the game install location path."
    Write-Host 'Common install locations:'
    Write-Host '  C:\Wuthering Waves' -ForegroundColor Yellow
    Write-Host '  C:\Wuthering Waves\Wuthering Waves Game' -ForegroundColor Yellow
    Write-Host '  C:\Program Files\Wuthering Waves\Wuthering Waves Game' -ForegroundColor Yellow
    Write-Host 'For Epic Games:'
    Write-Host '  C:\Program Files\Epic Games\WutheringWavesj3oFh' -ForegroundColor Yellow
    Write-Host '  C:\Program Files\Epic Games\WutheringWavesj3oFh\Wuthering Waves Game' -ForegroundColor Yellow
    Write-Host 'For Steam:' -ForegroundColor Gray
    Write-Host '  C:\Steam\steamapps\common\Wuthering Waves' -ForegroundColor Yellow
    $path = Read-Host "Input your installation location (otherwise, type `"exit`" to quit)"
    if ($path) {
        if ($path.ToLower() -eq "exit") {
            break
        }
        $gamePath = $path
        Write-Host "`n`n`nUser provided path: $($path)" -ForegroundColor Magenta
        $folderFound, $logFound, $urlFound = LogCheck $path
        if ($urlFound) { break }
        elseif ($logFound) {            
            $err += "Path checked: $($gamePath).`n"
            $err += "Cannot find the convene history URL in both Client.log and debug.log! Please open your Convene History first!`n"
            $err += "If this is the correct directory and you're still facing issues, raise a ticket in wuwatracker.com/discord`n"
        }
        elseif ($folderFound) {
            Write-Host "No logs found at $gamePath`n"
        }
        else {
            Write-Host "Folder not found in user-provided path: $path"
            Write-Host "Could not find log files. Did you set your game location properly or open your Convene History first?" -ForegroundColor Red
        }
    }
    else {
        Write-Host "Invalid game location. Did you set your game location properly?" -ForegroundColor Red
    }
}