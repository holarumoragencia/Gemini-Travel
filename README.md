# Gemini Travel: vuelo a República Dominicana

Animación tipo "video de viaje": arranca con la Tierra completa, hace zoom hasta República Dominicana, baja inclinada sobre Santo Domingo y al final cae un pin de ubicación con el nombre del destino.

Usa los **mapas 3D fotorrealistas de Google** (las mismas imágenes de Google Earth) mediante la Maps JavaScript API (`Map3DElement` + `flyCameraTo`).

## 1. Conseguir la API key (una sola vez)

1. Entrá a <https://console.cloud.google.com/> y creá un proyecto. Hay que tener la facturación activada, pero el uso de una animación así entra en el crédito gratuito mensual.
2. En **APIs y servicios → Biblioteca**, habilitá **Maps JavaScript API** y **Map Tiles API**.
3. En **Credenciales**, creá una **API key**. Conviene restringirla a tu dominio, por ejemplo a `http://localhost:8000/*`.

## 2. Abrir la animación

La página tiene que servirse por HTTP (no abriendo el archivo con doble clic):

```bash
python3 -m http.server 8000
```

Después abrí <http://localhost:8000/?key=TU_API_KEY> en Chrome. La key queda guardada en ese navegador. Si no la pasás por la URL, la página te la pide.

- **▶ Reproducir**: corre la animación. Los botones se ocultan mientras dura.
- **● Grabar video**: Chrome te pide compartir la pestaña; elegí la pestaña actual. Al terminar se descarga el video (`.mp4` o `.webm`).
- **↺ Volver al globo**: vuelve a la vista inicial.
- `?autoplay` en la URL arranca sola. Sirve para grabar con OBS u otra herramienta.

Para un video vertical (reels o stories), abrí la ventana con proporción 9:16 o usá el modo dispositivo de DevTools antes de grabar.

## 3. Personalizar

Todo se edita en [`config.js`](config.js):

- `label` / `sublabel`: los textos bajo el pin.
- `start`: el encuadre inicial (la Tierra entera).
- `flights`: los tramos del vuelo. Cada uno define el centro, `range` (distancia en metros), `tilt` (inclinación), `heading` (rotación) y duración. Para otro destino, cambiá las coordenadas.
- `pinColor`, `startDelayMillis`, `endHoldMillis`.

## Videos MP4 ya renderizados

En [`videos/`](videos/) están los videos listos para usar (12 s, 30 fps):

- `vuelo-rd-1920x1080.mp4`: horizontal (YouTube, web, presentaciones).
- `vuelo-rd-1080x1920.mp4`: vertical (reels, stories, TikTok).

Estos no usan Google, así que no necesitan API key. El globo es la imagen satelital **NASA Blue Marble** (dominio público) y el acercamiento termina en un mapa estilizado hecho con **Natural Earth** (dominio público), con República Dominicana resaltada y el pin sobre Santo Domingo. Los créditos aparecen chicos abajo a la derecha.

Para volver a generarlos, por ejemplo después de cambiar textos, colores o tiempos en `render/scene.html`:

```bash
cd render
npm install
npm run render            # 1920x1080
npm run render:vertical   # 1080x1920
```

Se necesitan Node.js, Chromium (lo instala Playwright con `npx playwright install chromium`) y `ffmpeg`.

## Alternativa sin código: Google Earth Studio

Si preferís renderizar cuadro por cuadro en máxima calidad, mirá [`docs/google-earth-studio.md`](docs/google-earth-studio.md). Ahí están los keyframes listos para cargar en Earth Studio.

## Reel China, versión placa (primer borrador)

Primera versión, descartada: reel de 20 s en 1080x1920 con los colores de Gemini Travel: intro con el título, una placa por ciudad con el recorrido, lo que incluye, el precio con las cuotas y el cierre con el isologo animado.

1. Copiá los videos a [`clips/`](clips/LEEME.md) con los nombres de esa lista. Si falta alguno, se usa una foto de muestra y aparece una etiqueta roja "FALTA CLIP".
2. Textos, precios y tiempos se editan en [`render/reel-config.js`](render/reel-config.js). El diseño y la animación están en `render/reel.html`.
3. Renderizá:

```bash
cd render
npm install
npm run reel            # videos/reel-china-1080x1920.mp4 (ojo: pisa el reel de Remotion)
npm run reel:preview    # lo mismo a 15 fps, para revisar rápido
```

## Reel China Milenaria y Futurista (Remotion)

Anuncio vertical de 20 s (1080x1920, 30 fps) para Meta Ads, hecho con [Remotion](https://www.remotion.dev). Video de stock a pantalla completa, texto cinético y transiciones con movimiento: zoom con desenfoque, barridos rápidos, giro y destellos. Arranca con el video visto a través de las letras de CHINA y cierra con el isologo animado. No tiene audio, así que la música se suma en Meta o se agrega al proyecto.

- El guion (planos, duración, textos y transiciones) está en [`reel-china/src/ReelChina.tsx`](reel-china/src/ReelChina.tsx), en la lista `SHOTS`.
- Precio y cierre: `reel-china/src/Scenes.tsx`. Estilos de texto: `reel-china/src/Text.tsx`. Transiciones: `reel-china/src/transitions.tsx`.
- Los clips no se suben al repo porque pesan mucho. Se preparan desde los originales de Pexels:

```bash
cd reel-china
npm install
./preparar-clips.sh /carpeta/con/los/videos   # crea public/clips/*.mp4
npm run studio    # vista previa interactiva en el navegador
npm run render    # videos/reel-china-1080x1920.mp4
```

Remotion es gratis para personas y empresas de hasta 3 empleados.
