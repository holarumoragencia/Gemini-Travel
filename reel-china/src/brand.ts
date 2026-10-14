import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Montserrat (licencia OFL) servida desde public/fonts, así el render no depende de internet
export const fontFamily = "Montserrat";
for (const weight of ["600", "700", "800", "900"]) {
  loadFont({ family: fontFamily, url: staticFile(`fonts/montserrat-latin-${weight}-normal.woff2`), weight });
}

// Colores tomados de la placa y del isologo animado de Gemini Travel
export const C = {
  azul: "#017ea6",
  azulOscuro: "#0b5f80",
  dorado: "#c4a356",
  marino: "#2c405a",
  acero: "#6a8cb1",
  blanco: "#ffffff",
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;
