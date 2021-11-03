import { ExportTarget, NodeMetaData } from ".";
import { getPaint, xmlNode } from "./utils";

export function exportRectangle(
  sb: string[],
  target: ExportTarget,
  meta: NodeMetaData<RectangleNode>
) {
  const node = meta.node;
  const x = meta.relativeX;
  const y = meta.relativeY;
  const { fillColor, strokeColor } = getPaint(node);
  switch (target) {
    case ExportTarget.Canvas:
      sb.push("ctx.save();");
      sb.push("ctx.beginPath();");
      sb.push(`ctx.rect(${x}, ${y}, ${node.width}, ${node.height});`);
      sb.push(`ctx.fillStyle = "${fillColor}";`);
      sb.push("ctx.fill();");
      if (strokeColor) {
        sb.push(`ctx.strokeStyle = "${strokeColor}";`);
        sb.push(`ctx.lineWidth = ${node.strokeWeight};`);
        sb.push("ctx.stroke();");
      }
      sb.push("ctx.restore();");
      break;
    case ExportTarget.SVG:
      sb.push(
        xmlNode("rect", {
          x: `${x}`,
          y: `${y}`,
          width: `${node.width}`,
          height: `${node.height}`,
          fill: fillColor,
          ...(strokeColor ? { stroke: strokeColor } : {}),
        })
      );
      break;
  }
}
