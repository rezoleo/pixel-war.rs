import React from "react";
export const colors = [
  "#FFFFFF",
  "#E4E4E4",
  "#888888",
  "#222222",
  "#FFA7D1",
  "#E50000",
  "#E59500",
  "#A06A42",
  "#E5D900",
  "#94E044",
  "#02BE01",
  "#00D3DD",
  "#0083C7",
  "#0000EA",
  "#CD6EEA",
  "#820080",
] as const;

export const colorNamesFr: Record<(typeof colors)[number], string> = {
  "#FFFFFF": "Blanc",
  "#E4E4E4": "Gris clair",
  "#888888": "Gris",
  "#222222": "Noir",
  "#FFA7D1": "Rose clair",
  "#E50000": "Rouge",
  "#E59500": "Orange",
  "#A06A42": "Marron",
  "#E5D900": "Jaune",
  "#94E044": "Vert clair",
  "#02BE01": "Vert",
  "#00D3DD": "Cyan",
  "#0083C7": "Bleu clair",
  "#0000EA": "Bleu",
  "#CD6EEA": "Violet clair",
  "#820080": "Violet",
};

export const isValidColor = (hex: string): hex is Color => {
  return colors.includes(hex as Color);
};

export type Color = (typeof colors)[number];

type ColorButtonProps = {
  color: Color;
  className?: string;
  onClick: (color: Color) => void;
  selected: boolean;
};

const ColorButton: React.FC<ColorButtonProps> = ({
  className,
  color,
  onClick,
  selected,
}) => {
  return (
    <button
      onClick={() => onClick(color)}
      style={{ backgroundColor: color }}
      className={`relative border-2 color-buttons hover:cursor-pointer ${className} ${
        selected ? "border-4 border-rose-700" : "border-neutral-400"
      }`}
      title={colorNamesFr[color] || "Couleur non définie"}
    ></button>
  );
};

export default ColorButton;
