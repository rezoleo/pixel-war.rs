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
  if (!width || !height || !scale) return null;

  const canvasWidth = width * PIXEL_PER_UNIT;
  const canvasHeight = height * PIXEL_PER_UNIT;

  return (
    <div
      style={{
        width: canvasWidth,
        height: canvasHeight,
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      <canvas
        id="canvas"
        className="bg-neutral-600 block"
        width={canvasWidth}
        height={canvasHeight}
      />
    </div>
  );
};

export default CanvaPixelWar;
