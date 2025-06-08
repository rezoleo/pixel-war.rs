import { isValidColor, type Color } from "components/Button/Color";
import { useEffect, useRef, useState } from "react";

export const PIXEL_PER_UNIT = 10;

export interface CanvasSize {
  width: number;
  height: number;
}

interface CanvasPixelWarProps {
  width: number | undefined;
  height: number | undefined;
  scale: number | null;
  currentColor: Color;
  setPixelClicked: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    } | null>
  >;
}

const rgbToHex = (r: number, g: number, b: number): string =>
  "#" +
  [r, g, b]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

const CanvaPixelWar: React.FC<CanvasPixelWarProps> = ({
  width,
  height,
  scale,
  currentColor,
  setPixelClicked,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStarted, setDragStarted] = useState(false); // ← distinguishes click vs drag
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const previousPixel = useRef<{
    x: number;
    y: number;
    color: Color;
  } | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const linewidth = 1;

  useEffect(() => {
    if (!canvasRef.current || !width || !height) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Fill canvas with white grid
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width * PIXEL_PER_UNIT, height * PIXEL_PER_UNIT);
  }, [width, height]);

  if (!width || !height || !scale) return null;

  const canvasWidth = width * PIXEL_PER_UNIT;
  const canvasHeight = height * PIXEL_PER_UNIT;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStarted(false);
    dragStart.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    };

    const rect = canvasRef.current?.getBoundingClientRect();
    const ctx = canvasRef.current?.getContext("2d");
    if (!rect || !ctx) return;

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const pixelX = Math.floor(x / PIXEL_PER_UNIT);
    const pixelY = Math.floor(y / PIXEL_PER_UNIT);

    const imageData = ctx.getImageData(
      pixelX * PIXEL_PER_UNIT,
      pixelY * PIXEL_PER_UNIT,
      1,
      1
    ).data;

    const hexColor = rgbToHex(imageData[0], imageData[1], imageData[2]);

    // Only update pixel if it's different from the previous one
    if (
      pixelX === previousPixel.current?.x &&
      pixelY === previousPixel.current?.y
    ) {
      return;
    }

    // Check if pixel is within bounds
    if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
      // Restore previous pixel (full square, no border)
      if (previousPixel.current) {
        const { x, y, color } = previousPixel.current;
        ctx.fillStyle = color;
        ctx.fillRect(
          x * PIXEL_PER_UNIT,
          y * PIXEL_PER_UNIT,
          PIXEL_PER_UNIT,
          PIXEL_PER_UNIT
        );
      }

      // Draw new pixel (color fill + border)
      ctx.fillStyle = currentColor;
      ctx.fillRect(
        pixelX * PIXEL_PER_UNIT,
        pixelY * PIXEL_PER_UNIT,
        PIXEL_PER_UNIT,
        PIXEL_PER_UNIT
      );

      const px = pixelX * PIXEL_PER_UNIT;
      const py = pixelY * PIXEL_PER_UNIT;

      ctx.fillStyle = "#555555";
      // Top border
      ctx.fillRect(px, py, PIXEL_PER_UNIT, linewidth);
      // Bottom border
      ctx.fillRect(
        px,
        py + PIXEL_PER_UNIT - linewidth,
        PIXEL_PER_UNIT,
        linewidth
      );
      // Left border
      ctx.fillRect(px, py, linewidth, PIXEL_PER_UNIT);
      // Right border
      ctx.fillRect(
        px + PIXEL_PER_UNIT - linewidth,
        py,
        linewidth,
        PIXEL_PER_UNIT
      );

      if (isValidColor(hexColor)) {
        previousPixel.current = {
          x: pixelX,
          y: pixelY,
          color: hexColor,
        };
      }
      setPixelClicked({ x: pixelX, y: pixelY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    // Only enable the grabbing cursor if user actually moved the mouse
    if (!dragStarted) {
      const dx = newX - translate.x;
      const dy = newY - translate.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 2) {
        setDragStarted(true);
      }
    }

    setTranslate({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStarted(false);
    dragStart.current = null;
  };

  return (
    <div
      className="w-full h-full overflow-hidden flex justify-center items-start mt-3"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: dragStarted ? "grabbing" : "default",
        userSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        width={canvasWidth}
        height={canvasHeight}
        className="block"
        style={{
          width: canvasWidth * scale,
          height: canvasHeight * scale,
          transform: `translate(${translate.x}px, ${translate.y}px)`,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};

export default CanvaPixelWar;
