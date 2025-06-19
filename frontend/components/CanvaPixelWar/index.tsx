import { isValidColor, type Color } from "components/Button/Color";
import { useEffect, useRef, useState } from "react";
import updateCanva from "utils/updateCanva";
import {
  rgbToHex,
  drawPixel,
  fillWhitenedArea,
  isInsideCanvas,
} from "utils/canvaHelpers";

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
  pixelsData: string | null;
  admin?: boolean;
  setPixelStart?: (x: number, y: number) => void;
  setPixelEnd?: (x: number, y: number) => void;
  pixelStart?: {
    x: number | null;
    y: number | null;
  };
  readonly?: boolean; // Optional prop to indicate read-only mode
  className?: string;
}

const CanvaPixelWar: React.FC<CanvasPixelWarProps> = ({
  width,
  height,
  scale,
  currentColor,
  setPixelClicked,
  pixelsData,
  admin = false, // Default to false if not provided
  setPixelStart,
  pixelStart,
  setPixelEnd,
  className,
  readonly = false, // Default to false if not provided
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStarted, setDragStarted] = useState(false); // ← distinguishes click vs drag
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [refresh, setRefresh] = useState(false);
  const previousPixel = useRef<{
    x: number;
    y: number;
    color: Color;
  } | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const linewidth = 1;

  useEffect(() => {
    if (!canvasRef.current || !width || !height || !pixelsData) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    updateCanva({ ctx, width, height, state: pixelsData });
    previousPixel.current = null;
    setPixelClicked(null);
  }, [width, height, pixelsData, refresh]);

  useEffect(() => {
    if (admin && pixelStart?.x === null && pixelStart?.y === null)
      setRefresh(!refresh);
  }, [pixelStart]);

  useEffect(() => {
    if (admin || !previousPixel.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawPixel(
      ctx,
      previousPixel.current.x,
      previousPixel.current.y,
      currentColor
    );
  }, [currentColor]);

  if (!width || !height || !scale) return null;

  const canvasWidth = width * PIXEL_PER_UNIT;
  const canvasHeight = height * PIXEL_PER_UNIT;

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const ctx = canvasRef.current?.getContext("2d");
    if (!rect || !ctx || readonly) return;

    if (!admin) {
      setIsDragging(true);
      setDragStarted(false);
      dragStart.current = {
        x: e.clientX - translate.x,
        y: e.clientY - translate.y,
      };

      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      const pixelX = Math.floor(x / PIXEL_PER_UNIT);
      const pixelY = Math.floor(y / PIXEL_PER_UNIT);

      const imageData = ctx.getImageData(
        pixelX * PIXEL_PER_UNIT + linewidth,
        pixelY * PIXEL_PER_UNIT + linewidth,
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

      if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
        if (previousPixel.current) {
          drawPixel(
            ctx,
            previousPixel.current.x,
            previousPixel.current.y,
            previousPixel.current.color,
            false
          );
        }

        drawPixel(ctx, pixelX, pixelY, currentColor);

        if (isValidColor(hexColor)) {
          previousPixel.current = {
            x: pixelX,
            y: pixelY,
            color: hexColor,
          };
        }
        setPixelClicked({ x: pixelX, y: pixelY });
      }
    } else {
      if (!isInsideCanvas(e, rect)) return;
      if (!setPixelStart || readonly) return;

      setRefresh(!refresh);
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      const pixelX = Math.floor(x / PIXEL_PER_UNIT);
      const pixelY = Math.floor(y / PIXEL_PER_UNIT);

      setPixelStart(pixelX, pixelY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (admin || !isDragging || !dragStart.current || readonly) return;

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

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!admin) {
      setIsDragging(false);
      setDragStarted(false);
      dragStart.current = null;
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    const ctx = canvasRef.current?.getContext("2d");
    if (
      !rect ||
      !ctx ||
      !pixelStart ||
      !setPixelStart ||
      !setPixelEnd ||
      readonly
    )
      return;
    if (!isInsideCanvas(e, rect)) return;

    const x = Math.floor((e.clientX - rect.left) / (PIXEL_PER_UNIT * scale));
    const y = Math.floor((e.clientY - rect.top) / (PIXEL_PER_UNIT * scale));
    const xStart = Math.max(0, pixelStart.x || 0);
    const yStart = Math.max(0, pixelStart.y || 0);
    const xEnd = Math.max(0, x);
    const yEnd = Math.max(0, y);

    const xMin = Math.min(xStart, xEnd);
    const yMin = Math.min(yStart, yEnd);
    const xMax = Math.max(xStart, xEnd);
    const yMax = Math.max(yStart, yEnd);

    setPixelStart(xMin, yMin);
    setPixelEnd(xMax, yMax);

    fillWhitenedArea(ctx, xMin, yMin, xMax, yMax, currentColor);
  };

  return (
    <div
      className={`h-full overflow-hidden flex justify-center items-start ${
        className || ""
      }`}
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
