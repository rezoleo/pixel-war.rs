"use client";

import { PIXEL_PER_UNIT, type CanvasSize } from "components/CanvaPixelWar";
import axios from "axios";
import { useEffect, useState } from "react";
import AdminCanvaPart from "components/admin/adminCanva";
import AdminNewSize from "components/admin/adminNewSize";

export default function AdminControl() {
  const [pixelsData, setPixelsData] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const goalSize = 400; // in px

  const fetchPixelData = async () => {
    try {
      const res = await axios.get("/api/pixels");
      setPixelsData(res.data);
    } catch (err) {
      console.error("Failed to fetch pixel data:", err);
    }
  };

  const fetchSize = async () => {
    try {
      axios
        .get("/api/size")
        .then((res) => {
          const { width, height } = res.data;
          if (typeof width === "number" && typeof height === "number") {
            setCanvasSize({ width, height });
            const size = Math.min(width, height);
            const scale = goalSize / (size * PIXEL_PER_UNIT);
            setScale(scale);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch canvas size:", err);
        });
    } catch (err) {
      console.error("Failed to fetch canvas size:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchPixelData(), fetchSize()]);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <AdminCanvaPart
        canvasSize={canvasSize}
        fetchPixelData={fetchPixelData}
        scale={scale}
        pixelsData={pixelsData}
      />
      <AdminNewSize canvasSize={canvasSize} />
    </div>
  );
}
