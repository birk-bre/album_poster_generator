"use client";

import { useEffect, useRef, useState } from "react";

import skmeans from "skmeans";
import convert from "color-convert";
import "./grain.css";
import { PDFViewer } from "@react-pdf/renderer";
import PDF from "./pdf";

export default function Create() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [reload, setReload] = useState(false);

  const [fileState, setFileState] = useState<File | null>(null);
  const [songs, setSongs] = useState<string[]>([
    "Foreword",
    "Where this flower blooms",
    "Sometimes...",
    "See you again",
    "Who dat boy",
    "Pothole",
    "Garden shed",
    "Boredom",
    "I ain't got time!",
    "911 / Mr. Lonely",
    "Droppin' seeds",
    "November",
    "Glitter",
    "Enjoy right now, today",
  ]);
  const [songInput, setSongInput] = useState("");
  const [category, setCategory] = useState("Hip hop | Jazz rap | Neo soul");

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const width = entry.contentRect.height * 1.414;
          entry.target.style.width = `${width}px`;
        }
      });

      resizeObserver.observe(containerRef.current);

      // Clean up the observer on unmount
      return () => resizeObserver.disconnect();
    }
  }, []);

  const [colors, setColors] = useState<
    {
      r: number;
      g: number;
      b: number;
    }[]
  >([]);

  function processImage(file?: File) {
    console.log("FILE", file);
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {
      console.log(fileInputRef, canvasRef);
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

      setColors(colors);
    };
  }

  return (
    <div className="flex flex-col items-center justify-center text-black">
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
      />
      <canvas ref={canvasRef} id="canvas" className="hidden"></canvas>
      <h1 className="text-white text-2xl">Create new poster</h1>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files[0];
          setFileState(file);
          processImage(file);
        }}
      />
      <div className="flex flex-col gap-2">
        ADD SONGS
        <input
          className="p-2"
          type="text"
          placeholder="Song"
          value={songInput}
          onChange={(e) => setSongInput(e.target.value)}
        />
        <button
          className="rounded-md p-2 bg-white"
          onClick={() => {
            setSongs((s) => [...s, songInput]);
            setSongInput("");
          }}
        >
          ADD SONG
        </button>
      </div>

      <PDFViewer className="w-screen h-screen" showToolbar>
        {/* reload this each render */}

        <PDF
          imageSrc={fileState ? URL.createObjectURL(fileState) : ""}
          category={category}
          songs={songs}
          colors={colors}
        />
      </PDFViewer>
    </div>
  );
}
