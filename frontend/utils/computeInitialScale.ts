export default function updateBaseScale(
  width_pixel_war: number,
  height_pixel_war: number,
  screenWidth: number,
  screenHeight: number
): number {
  // Calculate the initial scale based on the pixel war dimensions and screen size

  if (
    (0.9 * screenWidth) / width_pixel_war >
    (0.7 * screenHeight) / height_pixel_war
  ) {
    //estimated free space occupied by the pixel war after transform
    return (0.7 * screenHeight) / height_pixel_war;
  } else {
    return (0.9 * screenWidth) / width_pixel_war;
  }
}
