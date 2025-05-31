import React from "react";
import Slider from "components/Slider";
import Button from "components/Button";
import ColorButton, { colors, type Color } from "components/Button/Color";

interface BottomToolbarProps {
  sliderValue: number | null;
  minSliderValue: number | null;
  maxSliderValue: number | null;
  step: number;
  selectedColor: Color;
  onColorSelect: (color: Color) => void;
  onSliderChange: (value: number) => void;
  onRefresh: () => void;
  onUpload: () => void;
}

const BottomToolbar: React.FC<BottomToolbarProps> = ({
  sliderValue,
  minSliderValue,
  maxSliderValue,
  step,
  selectedColor,
  onColorSelect,
  onSliderChange,
  onRefresh,
  onUpload,
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full py-2 z-50">
      <div className="flex flex-wrap justify-center items-center gap-2 px-4">
        <Slider
          min={minSliderValue}
          max={maxSliderValue}
          step={step}
          value={sliderValue}
          onChange={(val) =>
            onSliderChange(
              Math.min(Math.max(val, minSliderValue || 1), maxSliderValue || 20)
            )
          }
        />
        <div className="flex flex-wrap justify-center gap-1">
          {colors.map((color, index) => (
            <ColorButton
              key={index}
              color={color}
              className="w-8 h-8 sm:w-10 sm:h-10"
              selected={selectedColor === color}
              onClick={onColorSelect}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            onClick={onRefresh}
            className="px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base"
          >
            Refresh
          </Button>
          <Button
            onClick={onUpload}
            className="px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base"
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomToolbar;
