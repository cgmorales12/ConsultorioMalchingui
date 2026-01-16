@echo off
set "SOURCE=d:\2 parcial\Ionic\Consultorio_Luz_y_Vida\PHP"
set "DEST=C:\xampp\htdocs\consultorio"

echo Deploying PHP files from %SOURCE% to %DEST%...

if not exist "%DEST%" (
    echo Creating destination directory...
    mkdir "%DEST%"
)

xcopy "%SOURCE%\*" "%DEST%\" /E /Y /D

echo Deployment complete!
pause
