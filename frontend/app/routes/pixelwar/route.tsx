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
          setMaxSliderValue(scale * 3);
        } else {
          console.error("Invalid data structure:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching /api/size:", error);
      });
  }, []);

  return (
    <>
      <div className="pt-5 px-3 container mx-auto dark:text-white text-lg">
        <div className="flex justify-center">
          <div className="inline-flex bg-neutral-600 py-1 px-2 rounded-lg">
            <p className="pr-1 font-bold">Timer</p>
            <p className="pr-3 font-bold">(?,?)</p>
            <p>{`x${sliderValue !== null ? sliderValue.toFixed(2) : ""}`}</p>
          </div>
        </div>
        <div className="w-full flex justify-center overflow-hidden my-5">
          <CanvaPixelWar
            width={canvasSize?.height}
            height={canvasSize?.height}
            scale={sliderValue}
          />
        </div>
      </div>
      <BottomToolbar
        sliderValue={sliderValue}
        minSliderValue={minSliderValue}
        maxSliderValue={maxSliderValue}
        step={SLIDER_STEP}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        onSliderChange={setSliderValue}
        onRefresh={() => {}}
        onUpload={() => {}}
      />
    </>
  );
}
