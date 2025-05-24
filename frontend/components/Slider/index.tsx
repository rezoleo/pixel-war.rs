import React from "react";

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ min, max, step, value, onChange }) => {
  return (
    <div className="flex flex-col items-center justify-center mr-4">
      <label className="mb-1 font-bold text-lg text-white">Zoom</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-40 h-2 mb-3 rounded-lg appearance-none cursor-pointer 
                   bg-gradient-to-r from-rose-900 to-red-950 
                   accent-white focus:outline-none focus:ring-2 focus:ring-rose-700"
      />
    </div>
  );
};

export default Slider;
