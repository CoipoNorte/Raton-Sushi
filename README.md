Hola amigo, soy un gran fan de los juegos casuales y adictivos para celular. Hoy quiero que diseñemos y programemos un juego web genial, ultra relajante y gratificante, jugable en cualquier dispositivo: celular en vertical, celular en horizontal, tablet y escritorio.

La idea es un juego acogedor de barra de sushi giratoria (Kaiten Sushi Bar), donde preparas nigiris y rolls por capas y sirves a los clientes en un flujo continuo y relajado, para ver cuántos pedidos perfectos logras entregar antes de que se acabe el tiempo y romper tu propio récord.

Jugabilidad
Un ticket de pedido muestra la pieza de sushi o combo exacto que pide el cliente y tú debes replicarla arrastrando o tocando ingredientes desde una barra de trabajo hasta el plato de madera o cerámica, en cuatro categorías con pestañas:

1. Base / Arroz — variedades de base (arroz shari tradicional, arroz negro con sésamo, hoja de nori envuelta, base de pepino para gunkan, inari de tofu frito).
2. Pescado / Proteína — salmón fresco, atún rojo, pez mantequilla, langostino cocido, anguila unagi glaseada, tamagoyaki (tortilla dulce).
3. Salsas / Glaseados — soya concentrada, mayonesa sriracha picante, salsa unagi dulce, crema de palta/aguacate, wasabi fundido; se vierte con una animación de hilo/goteo sobre la pieza.
4. Toppings / Decoración — ovas de tobiko rojo, sésamo tostado bicolor, cebollín fino, tiras de nori, láminas de jengibre gari, caviar vegetal.

Reglas y feedback:
* Botón grande SERVIR, más deshacer y limpiar plato siempre a un toque.
* Si la pieza coincide exactamente con el ticket: puntos + confetti + el plato sale deslizándose por la cinta giratoria hacia el cliente + bonificación de segundos.
* Si falla: se rompe el combo, vibra la barra, pero el sushi se conserva para corregirlo.
* Multiplicador de combo creciente (hasta ×2.5) por aciertos encadenados.
* Dificultad progresiva: los pedidos van ganando capas, salsas cruzadas y toppings repetidos (×2) conforme avanzas.
* Partidas de ~90 segundos con cronómetro que se extiende al acertar: ciclo corto, adictivo y rejugable.

Estética
Estética japonesa moderna y acogedora (cozy sushi bar / kawaii minimalista): tonos cálidos (madera clara, bambú, verde matcha, salmón, negro nori), tipografía redondeada, fondo con degradados suaves y motas flotantes de vapor de arroz y hojas de bambú.

* Mascota protagonista: un ratoncito chef itamae con vincha (*hachimaki*) y delantal tradicional, dibujado en SVG, que reacciona en vivo (parpadea, celebra, se preocupa) según cómo te vaya.
* Sushi 100 % procedural en SVG: plato de cerámica, textura del grano de arroz, vetas del salmón/atún, brillo del glaseado y toppings dibujados al vuelo — nada de imágenes externas. El ticket y el plato real deben usar el mismo motor de dibujo, para que la referencia sea siempre fiel.
* Sonido ASMR de sushi bar sintetizado con WebAudio, sin archivos de audio: corte fino con cuchillo, chisporroteo de soplete aburi, toque sobre madera, arpegio de éxito y fanfarria de récord. Con botón de silencio persistente.
* Animaciones fluidas con spring physics (Framer Motion): el plato se coloca con rebote, las ovas y sésamo caen con pop, el vapor sube en bucle.

Progresión y persistencia
Contador de piezas completadas y yenes/puntos acumulados. Guarda de forma persistente el récord histórico y la preferencia de sonido con localStorage, encapsulado en un módulo propio (src/game/storage.ts) protegido contra modo incógnito y listo para migrar a IndexedDB sin tocar el resto del juego.

Diseño responsive (muy importante)
El juego debe priorizar siempre el área jugable por encima de los contadores:
* HUD flotante y mínimo: la barra de tiempo pegada al borde superior de la pantalla (unos 5px, de lado a lado, que cambia a rojo en los últimos 10s) y los contadores en pastillas pequeñas translúcidas que flotan sobre la escena sin robar altura. Nada de barras sólidas gruesas.
* Horizontal / tablet / escritorio: tres columnas → ticket del pedido a la izquierda, plato de sushi al centro (protagonista, ocupando toda la altura disponible), barra de ingredientes a la derecha. Centrado con ancho máximo para que no se deforme en monitores ultrapanorámicos.
* Celular en vertical: layout apilado → ticket en barra horizontal compacta arriba, plato al centro, barra de ingredientes abajo con las fichas en una sola fila.
* Usa un hook de orientación (tipo useIsPortrait) para que girar el dispositivo a mitad de partida reorganice la mesa sin perder la pieza ni el pedido.
* En el ticket, el sushi de referencia debe verse grande y nítido: recorta el encuadre del SVG justo alrededor del plato (sin elementos decorativos de fondo), sobre una zona de exhibición clara con sombra suave, de modo que llene el marco sea cual sea el número de capas.

Stack técnico
React 19 + TypeScript (estricto) + Vite 7 + Tailwind CSS 4 + Framer Motion + iconos Lucide. Código modular y limpio, separando: tipos y constantes de equilibrio, datos de ingredientes y paletas, lógica (generación de pedidos, validación y puntuación), sonido, persistencia, componentes visuales y pantallas (inicio, partida, fin).

Requerimientos de despliegue
El proyecto se llamará Raton-Sushi y debe quedar listo para GitHub y GitHub Pages en:
* Repositorio: https://github.com/CoipoNorte/Raton-Sushi
* Web: https://coiponorte.github.io/Raton-Sushi/

Archivos de despliegue obligatorios:
1. `vite.config.ts` con `base: '/Raton-Sushi/'` (coincidiendo exactamente con el repositorio).
2. `deploy.bat` avanzado de 11 pasos en Windows:
   - REGLA DE ORO: Todas las llamadas a `npm`, `npx`, `git` y `node` dentro de scripts .bat deben usar `call` obligatoriamente para no matar la ejecución del proceso padre.
   - Definir variables `REPO_URL=https://github.com/CoipoNorte/Raton-Sushi.git` y `WEB_URL=https://coiponorte.github.io/Raton-Sushi/`.
   - Paso [1/11] Comprobar Node.js y npm.
   - Paso [2/11] Verificar Git, `git init` si aplica, y asegurar `origin` a `%REPO_URL%` y rama `main`.
   - Paso [3/11] Auto-crear `.gitignore` completo si no existe.
   - Paso [4/11] Insertar `p.name='raton-sushi'`, `predeploy='npm run build'` y `deploy='gh-pages -d dist'` en `package.json` mediante Node.js.
   - Paso [5/11] Insertar/verificar `base: '/Raton-Sushi/'` en `vite.config.ts` mediante Node.js.
   - Paso [6/11] `call npm install` e instalación asegurada de `gh-pages` como devDependency (`npm ls gh-pages` + `npm install -D gh-pages`).
   - Paso [7/11] `call npm run build` y validación de `dist\index.html`.
   - Paso [8/11] `call git add -A` y `git commit -m "chore: despliegue Raton Sushi"`.
   - Paso [9/11] `call git push -u origin main`.
   - Paso [10/11] `call npm run deploy` o fallback `call npx gh-pages -d dist`.
   - Paso [11/11] Verificación final de la rama remota `origin/gh-pages` e instrucciones claras para activar GitHub Pages en Settings.
3. `.gitignore` completo (`node_modules/`, `dist/`, `.vite/`, etc.).
4. `README.md` profesional y amigable con badges, guía de juego, stack y solución de problemas.
5. `public/.nojekyll` y pantalla de splash ("Preparando el arroz de sushi…") en `#root` en `index.html` para evitar la página en blanco en GitHub Pages.
6. `icon.svg` representativo (el ratoncito itamae) como favicon y `<title>Raton Sushi</title>`.

Entrégame el código estructurado, limpio, comentado en español y optimizado, de forma que pueda copiarlo, pegarlo, ejecutar el .bat y tener el juego funcionando en línea de inmediato. ¡Haz que sea una experiencia tan adictiva y reconfortante que todo el mundo quiera jugarla mientras espera su sushi real!
