"use client";

import axios from "axios";
import { colors, type Color } from "components/Button/Color";
import CanvaPixelWar, { type CanvasSize } from "components/CanvaPixelWar";
import { useEffect, useState } from "react";
import updateBaseScale from "utils/computeInitialScale";
import { PIXEL_PER_UNIT } from "components/CanvaPixelWar";
import BottomToolbar from "components/BottomToolbar";

const SLIDER_STEP = 0.01;

export default function Home() {
  const [selectedColor, setSelectedColor] = useState<Color>(colors[0]);
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const [minSliderValue, setMinSliderValue] = useState<number | null>(null);
  const [maxSliderValue, setMaxSliderValue] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [delay, setDelay] = useState<number | null>(null);
  const [pixelClicked, setPixelClicked] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [pixelsData, setPixelsData] = useState<string | null>(null);

  const fetchPixelData = async () => {
    try {
      const res = await axios.get("/api/pixels");
      setPixelsData(res.data);
    } catch (err) {
      console.error("Failed to fetch pixel data:", err);
    }
  };

  const fetchDelay = async () => {
    try {
      const res = await axios.get("/api/delay");
      const delay = res.data;
      if (typeof delay === "number") {
        setDelay(delay);
      }
    } catch (err) {
      console.error("Failed to fetch delay:", err);
    }
  };

  // Countdown effect
  useEffect(() => {
    if (countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  // Initial fetch of pixel data and delay
  useEffect(() => {
    fetchDelay();
    fetchPixelData();
  }, []);

  const handleRefresh = async () => {
    try {
      await fetchPixelData();
    } catch (err) {
      console.error("Failed to refresh pixel data:", err);
    }
  };

  const handleUpload = async () => {
    if (!pixelClicked) return;

    try {
      const response = await axios.post("/api/pixel", {
        x: pixelClicked.x,
        y: pixelClicked.y,
        color: selectedColor,
      });

      if (response.status === 200) {
        await fetchPixelData(); // Refresh pixels if successful
        if (delay !== null) {
          setCountdown(delay);
        }
      } else {
        // Non-200 status (rare with axios but just in case)
        alert(`Upload failed: ${response.data || "Unknown error"}`);
      }
    } catch (error: any) {
      // Axios error or network error
      if (error.response) {
        // The server responded with a status code outside 2xx
        alert(`Error: ${error.response.data || "Request failed"}`);
      } else if (error.request) {
        // Request was made but no response received
        alert("Network error: No response from server");
      } else {
        // Other errors (setup, etc)
        alert(`Unexpected error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    axios
      .get("/api/size")
      .then((response) => {
        const { width, height } = response.data;

        if (typeof width === "number" && typeof height === "number") {
          setCanvasSize({ width, height });

          // Compute initial slider value based on screen and canvas size
          const scale = updateBaseScale(
            width * PIXEL_PER_UNIT,
            height * PIXEL_PER_UNIT,
            window.innerWidth,
            window.innerHeight
          );

          setMinSliderValue(scale);
          setSliderValue(scale);
          setMaxSliderValue(scale * 5);
        } else {
          console.error("Invalid data structure:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching /api/size:", error);
      });
  }, []);

  return (
    <div className="flex flex-col">
      <div className="pt-5 px-3 container mx-auto dark:text-white text-lg">
        <div className="flex justify-center">
          <div className="inline-flex bg-neutral-600 py-1 px-2 rounded-lg">
            {countdown > 0 ? (
              <p className="pr-1 font-bold text-red-500">{`${countdown}s`}</p>
            ) : (
              <p className="pr-1 font-bold text-green-500">Ready</p>
            )}
            <p className="pr-3 font-bold">
              {pixelClicked ? `(${pixelClicked.x},${pixelClicked.y})` : "(?,?)"}
            </p>
            <p>{`x${sliderValue !== null ? sliderValue.toFixed(2) : ""}`}</p>
          </div>
        </div>
      </div>
      <CanvaPixelWar
        width={canvasSize?.height}
        height={canvasSize?.height}
        scale={sliderValue}
        currentColor={selectedColor}
        setPixelClicked={setPixelClicked}
        pixelsData={pixelsData}
      />
      <BottomToolbar
        sliderValue={sliderValue}
        minSliderValue={minSliderValue}
        maxSliderValue={maxSliderValue}
        step={SLIDER_STEP}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        onSliderChange={setSliderValue}
        onRefresh={handleRefresh}
        onUpload={handleUpload}
      />
    </div>
  );
}
