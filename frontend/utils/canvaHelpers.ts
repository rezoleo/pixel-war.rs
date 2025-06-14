// utils/canvasHelpers.ts
import { PIXEL_PER_UNIT } from "components/CanvaPixelWar";
import type { Color } from "components/Button/Color";

export const rgbToHex = (r: number, g: number, b: number): string =>
  "#" +
  [r, g, b]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: Color,
  border = true,
  lw: number = 1
) {
  ctx.fillStyle = color;
  ctx.fillRect(
    x * PIXEL_PER_UNIT,
    y * PIXEL_PER_UNIT,
    PIXEL_PER_UNIT,
    PIXEL_PER_UNIT
  );

  if (border) {
    ctx.fillStyle = "#555555";
    const px = x * PIXEL_PER_UNIT;
    const py = y * PIXEL_PER_UNIT;
    ctx.fillRect(px, py, PIXEL_PER_UNIT, lw); // Top
    ctx.fillRect(px, py + PIXEL_PER_UNIT - lw, PIXEL_PER_UNIT, lw); // Bottom
    ctx.fillRect(px, py, lw, PIXEL_PER_UNIT); // Left
    ctx.fillRect(px + PIXEL_PER_UNIT - lw, py, lw, PIXEL_PER_UNIT); // Right
    ctx.fillStyle = color; // Reset fill style
  }
}

export function fillWhitenedArea(
  ctx: CanvasRenderingContext2D,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
  color: string
) {
  ctx.fillStyle = color;

  if (xMin % 2 === 0 && xMax % 2 === 0) {
    ctx.fillRect(
      xMin * PIXEL_PER_UNIT,
      yMin * PIXEL_PER_UNIT,
      (xMax + 2 - xMin) * PIXEL_PER_UNIT,
      (yMax + 1 - yMin) * PIXEL_PER_UNIT
    );
  } else if (xMin % 2 === 1 && xMax % 2 === 1) {
    ctx.fillRect(
      (xMin - 1) * PIXEL_PER_UNIT,
      yMin * PIXEL_PER_UNIT,
      (xMax + 2 - xMin) * PIXEL_PER_UNIT,
      (yMax + 1 - yMin) * PIXEL_PER_UNIT
    );
  } else if (xMin % 2 === 1 && xMax % 2 === 0) {
    ctx.fillRect(
      (xMin - 1) * PIXEL_PER_UNIT,
      yMin * PIXEL_PER_UNIT,
      (xMax + 1 - xMin) * PIXEL_PER_UNIT,
      (yMax + 1 - yMin) * PIXEL_PER_UNIT
    );
  } else {
    ctx.fillRect(
      xMin * PIXEL_PER_UNIT,
      yMin * PIXEL_PER_UNIT,
      (xMax + 1 - xMin) * PIXEL_PER_UNIT,
      (yMax + 1 - yMin) * PIXEL_PER_UNIT
    );
  }
}

export function isInsideCanvas(e: React.MouseEvent, rect: DOMRect): boolean {
  return (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  );
}
