import React from "react";

interface SliderProps {
  min: number | null;
  max: number | null;
  step: number;
  value: number | null;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ min, max, step, value, onChange }) => {
  const effectiveMin = min ?? 1;
  const effectiveMax = max ?? 20;
  const effectiveValue = value ?? 1;

  // Amount to change with keyboard arrows
  const keyboardStep = 0.5;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(effectiveValue + keyboardStep, effectiveMax));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(effectiveValue - keyboardStep, effectiveMin));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mr-4">
      <label className="mb-1 font-bold text-lg text-white">Zoom</label>
      <input
        type="range"
        min={effectiveMin}
        max={effectiveMax}
        step={step}
        value={effectiveValue}
        onChange={(e) => onChange(Number(e.target.value))}
        onKeyDown={handleKeyDown}
        className="w-40 h-2 mb-3 rounded-lg appearance-none cursor-pointer 
                   bg-gradient-to-r from-rose-900 to-red-950 
                   accent-white focus:outline-none focus:ring-2 focus:ring-rose-700"
      />
    </div>
  );
};

export default Slider;
