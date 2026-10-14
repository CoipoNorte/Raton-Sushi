@echo off
rem ============================================================================
rem   RATON SUSHI - Script de despliegue a GitHub Pages (11 pasos) - Windows
rem   ----------------------------------------------------------------------------
rem   REGLA DE ORO: TODAS las llamadas a npm / npx / git / node llevan "call"
rem   para no matar la ejecucion del proceso padre de este .bat
rem   ----------------------------------------------------------------------------
rem   Uso: doble clic en deploy.bat  (o  deploy.bat  desde cmd)
rem   Es idempotente: puedes reejecutarlo las veces que haga falta.
rem ============================================================================
setlocal EnableDelayedExpansion
chcp 65001 >nul
title Raton Sushi - Despliegue a GitHub Pages

set "REPO_URL=https://github.com/CoipoNorte/Raton-Sushi.git"
set "WEB_URL=https://coiponorte.github.io/Raton-Sushi/"
set "BASE_PATH=/Raton-Sushi/"
set "APP_NAME=raton-sushi"
set "COMMIT_MSG=chore: despliegue Raton Sushi"

echo.
echo ============================================================
echo   RATON SUSHI  -  Despliegue automatico a GitHub Pages
echo ============================================================
echo   Repo : %REPO_URL%
echo   Web  : %WEB_URL%
echo ============================================================
echo.

rem ----------------------------------------------------------------------------
echo [1/11] Comprobando Node.js y npm...
where node >nul 2>nul
if errorlevel 1 (
  echo   [ERROR] Node.js no esta instalado. Bajalo de https://nodejs.org
  goto :fail
)
call node -v
if errorlevel 1 goto :fail
call npm -v
if errorlevel 1 goto :fail
echo   Node.js y npm OK.
echo.

rem ----------------------------------------------------------------------------
echo [2/11] Verificando Git, inicializando y asegurando origin/main...
where git >nul 2>nul
if errorlevel 1 (
  echo   [ERROR] Git no esta instalado. Bajalo de https://git-scm.com
  goto :fail
)
if not exist ".git" (
  echo   Inicializando repositorio git...
  call git init
  if errorlevel 1 goto :fail
)
call git remote get-url origin >nul 2>nul
if errorlevel 1 (
  call git remote add origin "%REPO_URL%"
  if errorlevel 1 goto :fail
  echo   Remoto 'origin' creado: %REPO_URL%
) else (
  call git remote set-url origin "%REPO_URL%"
  if errorlevel 1 goto :fail
  echo   Remoto 'origin' actualizado: %REPO_URL%
)
call git checkout -B main
if errorlevel 1 goto :fail
echo   Rama activa: main.
echo.

rem ----------------------------------------------------------------------------
echo [3/11] Verificando .gitignore...
if exist ".gitignore" (
  echo   .gitignore ya existe, se respeta tal cual.
) else (
  echo   Creando .gitignore completo...
  (
    echo node_modules/
    echo dist/
    echo dist-ssr/
    echo .vite/
    echo *.local
    echo .env
    echo .env.*
    echo logs/
    echo *.log
    echo npm-debug.log*
    echo yarn-debug.log*
    echo yarn-error.log*
    echo .DS_Store
    echo Thumbs.db
    echo .idea/
    echo .vscode/
    echo coverage/
    echo *.tsbuildinfo
  ) > .gitignore
  echo   .gitignore creado.
)
echo.

rem ----------------------------------------------------------------------------
echo [4/11] Ajustando package.json: name, predeploy y deploy...
if not exist "package.json" (
  echo   [ERROR] package.json no encontrado. Ejecuta este .bat en la raiz del proyecto.
  goto :fail
)
call node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.name='%APP_NAME%';if(p.scripts===undefined){p.scripts={};}p.scripts.predeploy='npm run build';p.scripts.deploy='gh-pages -d dist';fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');console.log('   name=raton-sushi, predeploy=build, deploy=gh-pages -d dist');"
if errorlevel 1 goto :fail
echo   package.json listo.
echo.

rem ----------------------------------------------------------------------------
echo [5/11] Asegurando base: '%BASE_PATH%' en vite.config.ts...
if not exist "vite.config.ts" (
  echo   [ERROR] vite.config.ts no encontrado.
  goto :fail
)
call node -e "const fs=require('fs');let s=fs.readFileSync('vite.config.ts','utf8');if(s.indexOf('%BASE_PATH%')>-1){console.log('   base ya configurada, no se toca');}else{const lines=s.split('\n');let hit=false;for(let i=0;i<lines.length;i++){if(lines[i].indexOf('base')>-1&&lines[i].indexOf(':')>-1){lines[i]='  base: \'%BASE_PATH%\',';hit=true;}}if(hit===false){s=s.replace('defineConfig({','defineConfig({\n  base: \'%BASE_PATH%\','\n');}else{s=lines.join('\n');}fs.writeFileSync('vite.config.ts',s);console.log('   base insertada: %BASE_PATH%');}if(fs.readFileSync('vite.config.ts','utf8').indexOf('%BASE_PATH%')===-1){console.error('   [ERROR] no se pudo fijar la base');process.exit(1);}"
if errorlevel 1 goto :fail
echo.

rem ----------------------------------------------------------------------------
echo [6/11] Instalando dependencias y asegurando gh-pages (devDependency)...
call npm install
if errorlevel 1 goto :fail
call npm ls gh-pages >nul 2>nul
if errorlevel 1 (
  echo   Instalando gh-pages...
  call npm install -D gh-pages
  if errorlevel 1 goto :fail
) else (
  echo   gh-pages ya esta instalado.
)
echo.

rem ----------------------------------------------------------------------------
echo [7/11] Compilando produccion (npm run build) y validando dist...
call npm run build
if errorlevel 1 goto :fail
if not exist "dist\index.html" (
  echo   [ERROR] El build termino pero no existe dist\index.html
  goto :fail
)
echo   Build verificado: dist\index.html generado.
echo.

rem ----------------------------------------------------------------------------
echo [8/11] Preparando commit con todo el proyecto...
call git add -A
if errorlevel 1 goto :fail
call git diff --cached --quiet
if errorlevel 1 (
  call git commit -m "%COMMIT_MSG%"
  if errorlevel 1 (
    echo   [ERROR] No se pudo crear el commit.
    echo   Si es tu primer commit, configura tu identidad:
    echo     git config --global user.name "Tu Nombre"
    echo     git config --global user.email "tu@email.com"
    goto :fail
  )
  echo   Commit creado: %COMMIT_MSG%
) else (
  echo   No hay cambios pendientes: se omite el commit.
)
echo.

rem ----------------------------------------------------------------------------
echo [9/11] Subiendo la rama main a origin...
call git push -u origin main
if errorlevel 1 (
  echo   [ERROR] No se pudo subir main.
  echo   Revisa tu autenticacion en GitHub (token personal o SSH).
  goto :fail
)
echo   Rama main publicada en GitHub.
echo.

rem ----------------------------------------------------------------------------
echo [10/11] Desplegando dist a la rama gh-pages...
call npm run deploy
if errorlevel 1 (
  echo   'npm run deploy' fallo; probando fallback: npx gh-pages -d dist
  call npx gh-pages -d dist
  if errorlevel 1 goto :fail
)
echo   Carpeta dist publicada en gh-pages.
echo.

rem ----------------------------------------------------------------------------
echo [11/11] Verificando la rama remota origin/gh-pages...
call git ls-remote --heads origin gh-pages >nul 2>nul
if errorlevel 1 (
  echo   [AVISO] origin/gh-pages no se ve todavia desde aqui.
  echo   Puede tardar unos segundos; compruebala en: %REPO_URL%/tree/gh-pages
) else (
  echo   origin/gh-pages confirmada. El artefacto de GitHub Pages esta listo.
)
echo.

rem ----------------------------------------------------------------------------
echo ============================================================
echo   DESPLIEGUE COMPLETADO
echo ============================================================
echo   Queda un unico paso manual (solo LA PRIMERA VEZ):
echo.
echo   1. Abre: https://github.com/CoipoNorte/Raton-Sushi/settings/pages
echo   2. En 'Build and deployment':
echo        Source : Deploy from a branch
echo        Branch : gh-pages     Folder : / (root)
echo   3. Pulsa Save y espera 1-2 minutos.
echo.
echo   Tu juego estara en linea en:
echo     %WEB_URL%
echo.
echo   Para futuras actualizaciones basta con volver a ejecutar
echo   deploy.bat: recompila, hace commit, sube y redespliega.
echo ============================================================
echo.
endlocal
pause
exit /b 0

rem ----------------------------------------------------------------------------
:fail
echo.
echo ============================================================
echo   [FALLO] El despliegue se detuvo en el paso anterior.
echo   Lee el mensaje de error, corrigelo y vuelve a ejecutar
echo   deploy.bat con total seguridad: es reejecutable.
echo ============================================================
endlocal
pause
exit /b 1
