@echo off
echo H5P-Dateien Bereinigungstool
echo ===========================
echo.
echo Dieses Tool hilft bei der Bereinigung von H5P-Dateien, die nicht korrekt gelöscht wurden.
echo.

:menu
echo Bitte wählen Sie eine Option:
echo.
echo [1] Scan-Modus (nur anzeigen, was gelöscht werden könnte)
echo [2] Clean-Modus (alle verwaisten Dateien löschen)
echo [3] ID-bezogene Bereinigung (Dateien für bestimmte Inhalts-ID löschen)
echo [4] Hilfe anzeigen
echo [0] Beenden
echo.

set /p choice="Ihre Wahl (0-4): "

if "%choice%"=="1" goto scan
if "%choice%"=="2" goto clean
if "%choice%"=="3" goto idclean
if "%choice%"=="4" goto help
if "%choice%"=="0" goto end

echo Ungültige Eingabe. Bitte versuchen Sie es erneut.
goto menu

:scan
echo.
echo Führe Scan-Modus aus...
node app/scripts/fix-delete.js --scan
echo.
echo Scan abgeschlossen. Zurück zum Hauptmenü...
pause
cls
goto menu

:clean
echo.
echo ACHTUNG: Sie sind dabei, alle verwaisten H5P-Dateien zu löschen!
set /p confirm="Sind Sie sicher? (j/n): "
if /i not "%confirm%"=="j" (
  echo Operation abgebrochen.
  goto menu
)
echo.
echo Führe Bereinigung aus...
node app/scripts/fix-delete.js --clean
echo.
echo Bereinigung abgeschlossen. Zurück zum Hauptmenü...
pause
cls
goto menu

:idclean
echo.
set /p contentId="Bitte geben Sie die Inhalts-ID ein: "
echo.
echo Sie sind dabei, alle Dateien für H5P-Inhalt mit ID %contentId% zu löschen!
set /p confirm="Sind Sie sicher? (j/n): "
if /i not "%confirm%"=="j" (
  echo Operation abgebrochen.
  goto menu
)
echo.
echo Führe ID-spezifische Bereinigung aus...
node app/scripts/fix-delete.js --id=%contentId%
echo.
echo ID-Bereinigung abgeschlossen. Zurück zum Hauptmenü...
pause
cls
goto menu

:help
cls
echo H5P-Dateien Bereinigungstool - Hilfe
echo ===================================
echo.
echo Dieses Tool hilft bei der Bereinigung von H5P-Dateien, die bei Löschvorgängen
echo im H5P-Viewer nicht korrekt aus dem Dateisystem entfernt wurden.
echo.
echo Optionen:
echo.
echo [1] Scan-Modus:
echo    Durchsucht das System nach verwaisten H5P-Dateien und -Ordnern,
echo    die keinen zugehörigen Datenbankeintrag mehr haben. Es werden keine
echo    Dateien gelöscht, sondern nur potentiell zu löschende Elemente angezeigt.
echo.
echo [2] Clean-Modus:
echo    Identifiziert und löscht alle verwaisten H5P-Dateien und -Ordner,
echo    die keinen entsprechenden Datenbankeintrag mehr haben.
echo    VORSICHT: Stellen Sie sicher, dass Sie ein Backup haben!
echo.
echo [3] ID-bezogene Bereinigung:
echo    Löscht gezielt alle Dateien und Ordner, die zu einer bestimmten
echo    H5P-Inhalts-ID gehören. Nützlich, wenn ein bestimmter Inhalt
echo    Probleme verursacht oder nicht vollständig gelöscht wurde.
echo.
pause
cls
goto menu

:end
echo Bereinigungstool wird beendet...
echo Auf Wiedersehen!
timeout /t 2 > nul
