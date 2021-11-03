export function getPaint(node: SceneNode & GeometryMixin) {
  let fillColor: string | undefined = undefined;
  let strokeColor: string | undefined = undefined;

  if (
    node.fills != null &&
    Array.isArray(node.fills) &&
    node.fills.length > 0
  ) {
    const fill = node.fills[0] as Paint;
    if (fill.type === "SOLID") {
      fillColor = figmaToHex(fill.color);
    }
  }

  if (
    node.strokes != null &&
    Array.isArray(node.strokes) &&
    node.strokes.length > 0
  ) {
    const stroke = node.strokes[0] as Paint;
    if (stroke.type === "SOLID") {
      strokeColor = figmaToHex(stroke.color);
    }
  }

  return {
    fillColor,
    strokeColor,
  };
}

export function figmaToHex(rgb: RGB) {
  const red = Math.round(rgb.r * 255);
  const green = Math.round(rgb.g * 255);
  const blue = Math.round(rgb.b * 255);
  return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
}

export function xmlNode(tag: string, attributes: { [key: string]: string }) {
  const attrs = Object.keys(attributes)
    .map((key) => `${key}="${attributes[key]}"`)
    .join(" ");
  return `<${tag} ${attrs}/>`;
}
