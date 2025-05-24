'use client';

import axios from "axios";
import Button from "components/Button";
import ColorButton, { colors, type Color } from "components/Button/Color";
import CanvaPixelWar, { type CanvasSize } from "components/CanvaPixelWar";
import Slider from "components/Slider";
import { useEffect, useState } from "react";

const MIN_SLIDER_VALUE = 1;
const MAX_SLIDER_VALUE = 30;
const SLIDER_STEP = 1;

export default function Home() {
  const [selectedColor, setSelectedColor] = useState<Color>(colors[0]);
  const [sliderValue, setSliderValue] = useState<number>(MIN_SLIDER_VALUE);
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);

  useEffect(() => {
    axios.get("/api/size")
      .then((response) => {
        const { width, height } = response.data;

        if (typeof width === "number" && typeof height === "number") {
          setCanvasSize({ width, height });
        } else {
          console.error("Invalid data structure:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching /api/size:", error);
      });
  }, []);


  const toggleSelectedColor = (color: Color) => {
    setSelectedColor(color);
  };

  return (
    <>
      <div className="pt-5 px-3 container mx-auto dark:text-white text-lg">
        <div className="flex justify-center">
          <div className="inline-flex bg-neutral-600 py-1 px-2 rounded-lg">
            <p className="pr-1 font-bold">Timer</p>
            <p className="pr-3 font-bold">(?,?)</p>
            <p className="font-bold">{`x${sliderValue}`}</p>
          </div>
        </div>
        <div className="justify-center flex my-5">
          <CanvaPixelWar width={canvasSize?.height} height={canvasSize?.height} scale={sliderValue} />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full flex justify-center py-2 z-50">
        <div className="inline-flex items-center">
          <Slider
            min={MIN_SLIDER_VALUE}
            max={MAX_SLIDER_VALUE}
            step={SLIDER_STEP}
            value={sliderValue}
            onChange={(val) =>
              setSliderValue(
                Math.min(Math.max(val, MIN_SLIDER_VALUE), MAX_SLIDER_VALUE)
              )
            }
          />
          {colors.map((color, index) => (
            <ColorButton
              key={index}
              color={color}
              className="mx-1"
              selected={selectedColor === color}
              onClick={toggleSelectedColor}
            />
          ))}
          <Button onClick={() => {}} className="mx-4">
            Refresh
          </Button>
          <Button onClick={() => {}}>Upload</Button>
        </div>
      </div>
    </>
  );
}
