// Configuración de la animación. Editá estos valores para cambiar destino, tiempos o encuadre.
// La API key NO va acá: se pasa por la URL (?key=TU_KEY) o se pega en el formulario de la página.
window.TRAVEL_CONFIG = {
  // Texto que aparece debajo del pin al final
  label: "República Dominicana",
  sublabel: "Santo Domingo",

  // Cámara inicial: la Tierra completa (range = distancia en metros desde el centro)
  start: {
    center: { lat: 15, lng: -55, altitude: 0 },
    range: 22000000,
    tilt: 0,
    heading: 0,
  },

  // Tramos de vuelo, en orden. Cada uno termina donde empieza el siguiente.
  flights: [
    {
      // 1) Del globo al país entero
      center: { lat: 18.75, lng: -70.2, altitude: 0 },
      range: 700000,
      tilt: 0,
      heading: 0,
      durationMillis: 6000,
    },
    {
      // 2) Bajada inclinada sobre Santo Domingo (el pin queda en el centro)
      center: { lat: 18.4861, lng: -69.9312, altitude: 0 },
      range: 9000,
      tilt: 60,
      heading: 20,
      durationMillis: 4000,
    },
  ],

  // Pausa antes de arrancar (para que carguen las texturas) y después del pin
  startDelayMillis: 2000,
  endHoldMillis: 4000,

  // Color del pin
  pinColor: "#e63946",
};
