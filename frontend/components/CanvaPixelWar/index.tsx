export const PIXEL_PER_UNIT = 10;

export interface CanvasSize {
  width: number;
  height: number;
}

interface CanvasPixelWarProps {
  width: number  | undefined;
  height: number | undefined;
  scale: number | null;
}

const CanvaPixelWar: React.FC<CanvasPixelWarProps> = ({width, height, scale}) => {

  return (
    width && height && scale? (
      <canvas 
        id="canvas"
        className="bg-neutral-600"
        width={width * PIXEL_PER_UNIT}
        height={height * PIXEL_PER_UNIT}
        style={{transform: `scale(${scale})`, transformOrigin: "center top 0px"}}
      >
      </canvas>
    ) : (
      <></>
    )
  );
};

export default CanvaPixelWar;
