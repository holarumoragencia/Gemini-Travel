# La misma animación en Google Earth Studio

[Google Earth Studio](https://earth.google.com/studio/) es la herramienta web de Google para animar Google Earth. Exporta una secuencia de imágenes (hasta 4K) que después unís en tu editor de video. Es gratis; solo hay que entrar con una cuenta de Google en Chrome.

## Pasos

1. Abrí Earth Studio → **Blank Project**. Elegí la resolución (1920×1080, o 1080×1920 para vertical), **30 fps** y una duración de **12 s**.
2. Activá los keyframes (el reloj ◷) de **Camera Target** y **Camera Position**. Si preferís, usá directamente **Longitude, Latitude, Altitude, Heading y Tilt**.
3. Cargá estos keyframes moviendo el cursor de tiempo y escribiendo los valores:

| Tiempo | Longitud | Latitud | Altitud | Heading | Tilt | Qué se ve |
|---|---|---|---|---|---|---|
| 0:00 | -55.0 | 15.0 | 20 000 km | 0° | 0° | La Tierra completa |
| 0:02 | -55.0 | 15.0 | 20 000 km | 0° | 0° | Pausa |
| 0:07 | -70.2 | 18.75 | 700 km | 0° | 0° | República Dominicana entera |
| 0:10 | -69.9312 | 18.4861 | 8 km | 20° | 60° | Bajada sobre Santo Domingo |
| 0:12 | -69.9312 | 18.4861 | 8 km | 25° | 60° | Leve giro final (se agrega el pin) |

4. Seleccioná todos los keyframes → clic derecho → **Ease In/Out** (o "Auto ease"), para que el movimiento sea suave.
5. Para el pin, la forma más simple es **3D Tracking → Add Track Point** en Santo Domingo (lat 18.4861, lng -69.9312). Al exportar, Earth Studio genera un `.json` con la posición del punto en pantalla en cada cuadro. Con eso, en After Effects (script incluido en la exportación) el pin queda "pegado" al lugar. En CapCut o Premiere alcanza con poner el pin en el centro de la pantalla en los últimos 2 segundos, porque la cámara termina centrada en Santo Domingo.
6. **Render → Download**. Te baja un `.zip` con los cuadros; importalos como secuencia de imágenes en tu editor.

## Atribución

Google exige mostrar la atribución que aparece en pantalla ("Google Earth" y los proveedores de datos). Earth Studio la agrega sola al render; no la tapes.
