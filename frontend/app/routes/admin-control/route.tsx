"use client";

import CanvaPixelWar from "components/CanvaPixelWar";
import axios from "axios";
import { useEffect, useState } from "react";

export default function AdminControl() {
  const [pixelsData, setPixelsData] = useState<string | null>(null);
  const [pixelStart, setPixelStart] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });
  const [pixelEnd, setPixelEnd] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });

  const handlePixelStart = (x: number, y: number) => {
    setPixelStart({ x: x, y: y });
  };

  const handlePixelEnd = (x: number, y: number) => {
    setPixelEnd({ x: x, y: y });
  };

  const fetchPixelData = async () => {
    try {
      const res = await axios.get("/api/pixels");
      setPixelsData(res.data);
    } catch (err) {
      console.error("Failed to fetch pixel data:", err);
    }
  };

  useEffect(() => {
    fetchPixelData();
  }, []);

  console.log("pixelStart: ", pixelStart);
  console.log("pixelEnd: ", pixelEnd);

  return (
    <CanvaPixelWar
      width={80}
      height={80}
      scale={1}
      currentColor="#FFFFFF"
      setPixelClicked={() => {}}
      admin={true}
      pixelsData={pixelsData}
      setPixelEnd={handlePixelEnd}
      setPixelStart={handlePixelStart}
      pixelStart={pixelStart}
    />
  );
}
