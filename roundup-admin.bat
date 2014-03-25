@echo off
if NOT "%_4ver%" == "" "H:\roundup\Scripts\python.exe" -c "from roundup.scripts.roundup_admin import run; run()" %$
if     "%_4ver%" == "" "H:\roundup\Scripts\python.exe" -c "from roundup.scripts.roundup_admin import run; run()" %*
