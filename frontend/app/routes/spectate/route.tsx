import CanvaPixelWar, {
  PIXEL_PER_UNIT,
  type CanvasSize,
} from "components/CanvaPixelWar";
import { useEffect, useState } from "react";

export default function Spectate() {
  const [scale, setScale] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);
  const [pixelsData, setPixelsData] = useState<string | null>(null);

  const fetchPixelData = async () => {
    try {
      const res = await fetch("/api/pixels");
      const data = await res.json();
      setPixelsData(data);
    } catch (err) {
      console.error("Failed to fetch pixel data:", err);
    }
  };

  const fetchSize = async () => {
    try {
      const res = await fetch("/api/size");
      const data = await res.json();
      if (
        data &&
        typeof data.width === "number" &&
        typeof data.height === "number"
      ) {
        setCanvasSize({ width: data.width, height: data.height });
        const size = Math.min(data.width, data.height);
        const goalSize = Math.min(window.innerWidth, window.innerHeight);
        const scale = goalSize / (size * PIXEL_PER_UNIT);
        setScale(scale);
      } else {
        console.error("❌ Invalid canvas size response format");
      }
    } catch (err) {
      console.error("❌ Failed to fetch canvas size:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchPixelData(), fetchSize()]);
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchPixelData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CanvaPixelWar
      width={canvasSize?.width}
      height={canvasSize?.height}
      scale={scale}
      currentColor={"#FFFFFF"}
      setPixelClicked={() => {}}
      pixelsData={pixelsData}
      readonly={true}
    />
  );
}
