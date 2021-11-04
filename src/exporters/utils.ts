

export function figmaToHex(rgb: RGB) {
  const red = Math.round(rgb.r * 255);
  const green = Math.round(rgb.g * 255);
  const blue = Math.round(rgb.b * 255);
  return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
}

export enum ExportTarget {
  SVG = "svg",
  Canvas = "canvas",
}
