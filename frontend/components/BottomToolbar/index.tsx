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
    <div className="fixed bottom-0 left-0 w-full flex justify-center py-2 z-50">
      <div className="inline-flex items-center">
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
        {colors.map((color, index) => (
          <ColorButton
            key={index}
            color={color}
            className="mx-1"
            selected={selectedColor === color}
            onClick={onColorSelect}
          />
        ))}
        <Button onClick={onRefresh} className="mx-4">
          Refresh
        </Button>
        <Button onClick={onUpload}>Upload</Button>
      </div>
    </div>
  );
};

export default BottomToolbar;
