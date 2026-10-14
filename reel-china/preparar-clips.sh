#!/usr/bin/env bash
# Convierte los videos de stock (Pexels) a 1080x1920 y los copia a public/clips con el nombre que usa el reel.
# Uso: ./preparar-clips.sh <carpeta-con-los-videos-originales>
# Cada línea: nombre-en-el-reel  parte-del-nombre-del-archivo-original  fps
set -euo pipefail
SRC="${1:?Pasá la carpeta con los videos originales}"
mkdir -p public/clips
while read -r name pattern fps; do
  src=$(ls "$SRC"/*"$pattern"* | head -1)
  echo "$name <- $(basename "$src")"
  ffmpeg -v error -y -i "$src" -an \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=$fps,setsar=1" \
    -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -g 15 -movflags +faststart "public/clips/$name.mp4"
done <<'LIST'
muralla-arco      exageram_001_1080p_1.mp4  30
templo-acantilado exageram_001_1080p_2.mp4  30
faroles           16434374  30
templo-escalinata 17021050  30
tulou             13753276  60
shanghai-torres   16025862  30
shanghai-noche    15911234  30
calle-noche       16870311  30
bund-dia          15028255  30
pagoda-lago       17053702  30
pueblo-canales    exageram_001_1080p.mp4  30
jardin-lago       exageram_001_1080p_5.mp4  30
LIST
