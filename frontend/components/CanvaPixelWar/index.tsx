import { useRef, useState } from "react";

export const PIXEL_PER_UNIT = 10;

export interface CanvasSize {
  width: number;
  height: number;
}

interface CanvasPixelWarProps {
  width: number | undefined;
  height: number | undefined;
  scale: number | null;
}

const CanvaPixelWar: React.FC<CanvasPixelWarProps> = ({
  width,
  height,
  scale,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStarted, setDragStarted] = useState(false); // ← distinguishes click vs drag
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  if (!width || !height || !scale) return null;

  const canvasWidth = width * PIXEL_PER_UNIT;
  const canvasHeight = height * PIXEL_PER_UNIT;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStarted(false); // reset on new press
    dragStart.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    };
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
      className="w-full h-full overflow-hidden flex justify-center items-start"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: dragStarted ? "grabbing" : "default", // 👈 Only show if dragging started
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: canvasWidth,
          height: canvasHeight,
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        <canvas
          ref={canvasRef}
          id="canvas"
          width={canvasWidth}
          height={canvasHeight}
          className="bg-neutral-600 block"
        />
      </div>
    </div>
  );
};

export default CanvaPixelWar;
