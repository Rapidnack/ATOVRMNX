Start-Job -ScriptBlock { py -3.7 -m websockify 54011 127.0.0.1:54001 }
Start-Job -ScriptBlock { py -3.7 -m websockify 54012 127.0.0.1:54002 }
Get-Job | Wait-Job
