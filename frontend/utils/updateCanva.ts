import { colors } from "components/Button/Color";
import { PIXEL_PER_UNIT } from "components/CanvaPixelWar";

interface UpdateCanvaArgs {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  state: string;
}

export default function updateCanva({
  ctx,
  width,
  height,
  state,
}: UpdateCanvaArgs) {
  const chosenColor = ctx.fillStyle;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const stateIndex = y * width + x;
      const index = parseInt(state[stateIndex], 16);
      if (index >= 16) {
        console.error(
          "Value error for pixel (" +
            x.toString() +
            "," +
            y.toString() +
            "), received state : " +
            state[stateIndex]
        );
        continue;
      }
      ctx.fillStyle = colors[index];
      ctx.fillRect(
        x * PIXEL_PER_UNIT,
        y * PIXEL_PER_UNIT,
        PIXEL_PER_UNIT,
        PIXEL_PER_UNIT
      );
    }
  }
  ctx.fillStyle = chosenColor;
}
