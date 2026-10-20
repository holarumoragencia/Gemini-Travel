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

## Video "DEPARTURES" (vuelos directos a Brasil)

`videos/departures-brasil-1080x1920.mp4`: video vertical de 16 s con una pantalla azul de aeropuerto. Los vuelos salen desde Córdoba, Rosario, Buenos Aires, Mendoza, Salta, Tucumán y Bariloche, y Córdoba y Rosario aparecen resaltadas. Las letras giran al aparecer y al irse, los nombres largos se desplazan dentro de su columna, el título alterna DEPARTURES / PARTIDAS / SALIDAS y el destino alterna entre BRASIL y la ciudad.

Para volver a generarlo después de cambiar vuelos, colores o tiempos en `render/departures.py` (necesita Python con Pillow y `ffmpeg`):

```bash
python3 render/departures.py
python3 render/departures.py --preview 5 --out cuadro.png   # un solo cuadro, para probar
```
