// Reel "China Milenaria y Futurista" (1080x1920, 20 s).
// Editá textos, tiempos y clips acá. Los tiempos están en segundos.
// Cada escena usa el video ../clips/<clip>.mp4. Si el archivo no existe, se usa una foto de muestra
// y aparece una etiqueta "FALTA CLIP" para saber qué video va en ese lugar.
// `desde` es el segundo del clip donde arranca el recorte.
window.REEL = {
  duracion: 20,
  colores: {
    azul: "#017ea6",
    azulOscuro: "#0b5f80",
    dorado: "#c4a356",
    marino: "#2c405a",
    acero: "#6a8cb1",
    blanco: "#ffffff",
  },

  escenas: [
    { id: "intro", inicio: 0, fin: 3, clip: "muralla", desde: 0 },
    { id: "ciudad", inicio: 3, fin: 4.35, clip: "beijing", desde: 0, ciudad: "BEIJING", noches: 3,
      destacados: ["Gran Muralla China", "Ciudad Prohibida"] },
    { id: "ciudad", inicio: 4.35, fin: 5.7, clip: "xian", desde: 0, ciudad: "XI'AN", noches: 2,
      destacados: ["Guerreros de Terracota"] },
    { id: "ciudad", inicio: 5.7, fin: 7.05, clip: "chengdu", desde: 0, ciudad: "CHENGDU", noches: 2,
      destacados: ["Experiencia con osos panda", "Gran Buda de Leshan"] },
    { id: "ciudad", inicio: 7.05, fin: 8.4, clip: "chongqing", desde: 0, ciudad: "CHONGQING", noches: 2,
      destacados: ["Ciudad 8D"] },
    { id: "ciudad", inicio: 8.4, fin: 9.75, clip: "zhangjiajie", desde: 0, ciudad: "ZHANGJIAJIE", noches: 2,
      destacados: ["Montañas Avatar"] },
    { id: "ciudad", inicio: 9.75, fin: 11.1, clip: "shanghai", desde: 0, ciudad: "SHANGHÁI", noches: 3,
      destacados: ["Visita de la ciudad"] },
    { id: "incluye", inicio: 11.1, fin: 13.6, clip: "incluye", desde: 0 },
    { id: "precio", inicio: 13.6, fin: 17.4, clip: "precio", desde: 0 },
    { id: "cierre", inicio: 17.4, fin: 20, clip: null },
  ],

  intro: {
    etiqueta: "SALIDA GRUPAL ACOMPAÑADA",
    titulo: "CHINA",
    bajada: ["MILENARIA", "Y FUTURISTA"],
  },

  incluye: [
    { icono: "avion", texto: "Aéreo Ethiopian Airlines", sub: "con equipaje de 23 kg + carry on" },
    { icono: "cama", texto: "Hoteles 4★ con desayuno", sub: "+ 8 comidas" },
    { icono: "tren", texto: "Trenes de alta velocidad", sub: "+ vuelo doméstico a Shanghái" },
    { icono: "escudo", texto: "Asistencia al viajero", sub: "+ seguro de cancelación any reason" },
  ],

  precio: {
    datos: ["14 NOCHES", "SALIDA 25 DE MARZO"],
    origen: "DESDE BUENOS AIRES",
    monto: 4935,
    detalle: "Base doble + imp. USD 1.275",
    cuotas: "RESERVÁ HOY Y ABONÁ EN CUOTAS",
    cuotasDetalle: "1ª cuota USD 1.088 + 3 cuotas de USD 1.707",
    legal: "Por persona. Promoción válida del 01/10 al 26/10/2026, sujeta a disponibilidad.",
  },

  cierre: {
    texto: "Salida grupal acompañada",
  },
};
