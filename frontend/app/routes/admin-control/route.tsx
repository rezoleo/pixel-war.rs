"use client";

import { PIXEL_PER_UNIT, type CanvasSize } from "components/CanvaPixelWar";
import axios from "axios";
import { useEffect, useState } from "react";
import AdminCanvaPart from "components/admin/adminCanva";
import AdminNewSize from "components/admin/adminNewSize";
import AdminChangeActive from "components/admin/adminChangeActive";
import AdminResetCanva from "components/admin/adminResetCanva";

export default function AdminControl() {
  const [pixelsData, setPixelsData] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);
  const [active, setActive] = useState<boolean>(true);
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
      const res = await axios.get("/api/size");
      const { width, height } = res.data;

      if (typeof width === "number" && typeof height === "number") {
        setCanvasSize({ width, height });
        const size = Math.min(width, height);
        const scale = goalSize / (size * PIXEL_PER_UNIT);
        setScale(scale);
      } else {
        console.error("❌ Invalid canvas size response format");
      }
    } catch (err) {
      console.error("❌ Failed to fetch canvas size:", err);
    }
  };

  const fetchActive = async () => {
    try {
      const res = await axios.get("/api/active");
      if (typeof res.data?.active === "boolean") {
        setActive(res.data.active);
      } else {
        console.error("❌ Invalid active status response format");
      }
    } catch (err) {
      console.error("❌ Failed to fetch active status:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchPixelData(), fetchSize(), fetchActive()]);
    })();
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
      <AdminChangeActive active={active} setActive={setActive} />
      <AdminResetCanva />
    </div>
  );
}
