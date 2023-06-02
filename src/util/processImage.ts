import { RefObject } from "react";
import skmeans from "skmeans";
import convert from "color-convert";

export async function processImage(
  canvasRef: RefObject<HTMLCanvasElement>,
  file?: File
) {
  if (!file) return;
  return new Promise<{ r: number; g: number; b: number }[]>((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {
      const canvas = canvasRef.current;
      if (!canvas) return; // add null check
      const ctx = canvas.getContext("2d");
      if (!ctx) return; // add null check
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let pixels = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lab = convert.rgb.lab([r, g, b]);
        pixels.push(lab);
      }

      const result = skmeans(pixels, 5);

      let dominantColors = result.centroids;
      const colors = dominantColors.map((color) => {
        const [r, g, b] = convert.lab.rgb(color);
        return { r, g, b };
      });

      resolve(colors);
    };
  });
}
