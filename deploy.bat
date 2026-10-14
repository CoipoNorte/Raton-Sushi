@echo off
rem ============================================================================
rem  RATON SUSHI - Instalacion, preparacion y despliegue a GitHub Pages
rem ============================================================================
rem  - Todas las llamadas a node, npm, npx y git usan CALL.
rem  - No se genera JavaScript con ECHO dentro de este BAT.
rem  - La preparacion vive en scripts\deploy-prepare.cjs.
rem  - DelayedExpansion esta desactivado para no modificar signos ! del codigo.
rem ============================================================================

setlocal DisableDelayedExpansion
chcp 65001 >nul
title Raton Sushi - Deploy

set "REPO_URL=https://github.com/CoipoNorte/Raton-Sushi.git"
set "WEB_URL=https://coiponorte.github.io/Raton-Sushi/"
set "COMMIT_MSG=chore: despliegue Raton Sushi"

rem Limpia restos creados por versiones anteriores del BAT.
del /f /q "._rs_pkg.cjs" >nul 2>nul
del /f /q "._rs_vite.cjs" >nul 2>nul
del /f /q "._raton_patch_pkg.cjs" >nul 2>nul
del /f /q "._raton_patch_vite.cjs" >nul 2>nul

echo.
echo ============================================================
echo   RATON SUSHI - Deploy automatico a GitHub Pages
echo ============================================================
echo   Repo : %REPO_URL%
echo   Web  : %WEB_URL%
echo ============================================================
echo.

rem ----------------------------------------------------------------------------
echo [1/11] Comprobando Node.js y npm...
where node >nul 2>nul
if errorlevel 1 (
  echo   [ERROR] Node.js no esta instalado.
  echo   Descargalo desde https://nodejs.org
  goto :fail
)
where npm >nul 2>nul
if errorlevel 1 (
  echo   [ERROR] npm no esta disponible.
  goto :fail
)
call node -v
if errorlevel 1 goto :fail
call npm -v
if errorlevel 1 goto :fail
echo   Node.js y npm disponibles.
echo.

rem ----------------------------------------------------------------------------
echo [2/11] Verificando Git, origin y rama main...
where git >nul 2>nul
if errorlevel 1 (
  echo   [ERROR] Git no esta instalado.
  echo   Descargalo desde https://git-scm.com
  goto :fail
)

if not exist ".git" (
  echo   Inicializando repositorio Git...
  call git init
  if errorlevel 1 goto :fail
)

call git remote get-url origin >nul 2>nul
if errorlevel 1 (
  call git remote add origin "%REPO_URL%"
  if errorlevel 1 goto :fail
  echo   Origin creado: %REPO_URL%
) else (
  call git remote set-url origin "%REPO_URL%"
  if errorlevel 1 goto :fail
  echo   Origin actualizado: %REPO_URL%
)

rem Cambia a main sin reiniciar ni borrar cambios locales.
call git rev-parse --verify refs/heads/main >nul 2>nul
if errorlevel 1 (
  call git checkout -b main
  if errorlevel 1 goto :fail
) else (
  call git checkout main
  if errorlevel 1 goto :fail
)
echo   Rama activa: main.
echo.

rem ----------------------------------------------------------------------------
echo [3/11] Verificando .gitignore y limpiando temporales...
if not exist ".gitignore" (
  echo node_modules/ > .gitignore
  echo dist/ >> .gitignore
  echo dist-ssr/ >> .gitignore
  echo .vite/ >> .gitignore
  echo *.log >> .gitignore
  echo .env >> .gitignore
  echo .env.* >> .gitignore
  echo .DS_Store >> .gitignore
  echo Thumbs.db >> .gitignore
  echo *.tsbuildinfo >> .gitignore
  echo ._rs_*.cjs >> .gitignore
  echo ._raton_patch_*.cjs >> .gitignore
  echo   .gitignore creado.
) else (
  echo   .gitignore encontrado.
)
echo.

rem ----------------------------------------------------------------------------
echo [4/11] Preparando package.json para el deploy...
if not exist "scripts\deploy-prepare.cjs" (
  echo   [ERROR] Falta scripts\deploy-prepare.cjs
  echo   Copia el proyecto completo antes de ejecutar este BAT.
  goto :fail
)
call node "scripts\deploy-prepare.cjs" package
if errorlevel 1 goto :fail
echo.

rem ----------------------------------------------------------------------------
echo [5/11] Preparando Vite y GitHub Pages...
call node "scripts\deploy-prepare.cjs" vite
if errorlevel 1 goto :fail
echo.

rem ----------------------------------------------------------------------------
echo [6/11] Instalando dependencias del proyecto...
echo   npm install: React, Vite, Tailwind, Framer Motion e iconos.
call npm install
if errorlevel 1 goto :fail

echo   Comprobando gh-pages...
call npm ls gh-pages --depth=0 >nul 2>nul
if errorlevel 1 (
  echo   Instalando gh-pages como devDependency...
  call npm install --save-dev gh-pages
  if errorlevel 1 goto :fail
) else (
  echo   gh-pages ya esta instalado.
)
echo   Dependencias listas.
echo.

rem ----------------------------------------------------------------------------
echo [7/11] Compilando la version de produccion...
call npm run build
if errorlevel 1 goto :fail

if not exist "dist\index.html" (
  echo   [ERROR] No se genero dist\index.html
  goto :fail
)
if not exist "dist\.nojekyll" (
  echo   [AVISO] Copiando .nojekyll a dist...
  if exist "public\.nojekyll" copy /y "public\.nojekyll" "dist\.nojekyll" >nul
)
echo   Build verificado: dist\index.html existe.
echo.

rem ----------------------------------------------------------------------------
echo [8/11] Creando commit de despliegue...
call git add -A
if errorlevel 1 goto :fail

call git diff --cached --quiet
if errorlevel 1 (
  call git commit -m "%COMMIT_MSG%"
  if errorlevel 1 (
    echo   [ERROR] No se pudo crear el commit.
    echo   Si Git pide identidad, ejecuta:
    echo     git config --global user.name "Tu Nombre"
    echo     git config --global user.email "tu@email.com"
    goto :fail
  )
  echo   Commit creado.
) else (
  echo   No hay cambios nuevos; se reutiliza el commit actual.
)
echo.

rem ----------------------------------------------------------------------------
echo [9/11] Subiendo la rama main a GitHub...
call git push -u origin main
if errorlevel 1 (
  echo   [ERROR] GitHub rechazo el push de main.
  echo   Revisa tu inicio de sesion, token o permisos.
  goto :fail
)
echo   Rama main publicada.
echo.

rem ----------------------------------------------------------------------------
echo [10/11] Publicando dist en la rama gh-pages...
call npm run deploy
if errorlevel 1 (
  echo   npm run deploy fallo. Probando fallback con npx...
  call npx gh-pages -d dist
  if errorlevel 1 goto :fail
)
echo   Deploy enviado a gh-pages.
echo.

rem ----------------------------------------------------------------------------
echo [11/11] Verificando la rama remota gh-pages...
call git ls-remote --exit-code --heads origin gh-pages >nul 2>nul
if errorlevel 1 (
  echo   [AVISO] La rama gh-pages aun no aparece en el remoto.
  echo   Espera unos segundos y revisa:
  echo   https://github.com/CoipoNorte/Raton-Sushi/branches
) else (
  echo   Rama origin/gh-pages confirmada.
)
echo.

echo ============================================================
echo   DESPLIEGUE COMPLETADO
echo ============================================================
echo   Web: %WEB_URL%
echo.
echo   Solo la primera vez, confirma en GitHub:
echo   Settings - Pages - Deploy from a branch
echo   Branch: gh-pages   Folder: / (root)
echo.
echo   Configuracion directa:
echo   https://github.com/CoipoNorte/Raton-Sushi/settings/pages
echo ============================================================
echo.
endlocal
pause
exit /b 0

:fail
echo.
echo ============================================================
echo   [FALLO] El despliegue se detuvo.
echo   El proyecto no fue borrado ni reiniciado.
echo   Corrige el mensaje anterior y vuelve a ejecutar deploy.bat.
echo ============================================================
echo.
endlocal
pause
exit /b 1