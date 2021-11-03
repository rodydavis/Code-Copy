import { ExportTarget, NodeMetaData } from ".";
import { getPaint, xmlNode } from "./utils";

export function exportEllipse(
  sb: string[],
  target: ExportTarget,
  meta: NodeMetaData<EllipseNode>
) {
  const node = meta.node;
  const x = meta.relativeX;
  const y = meta.relativeY;
  const { fillColor, strokeColor } = getPaint(node);
  switch (target) {
    case ExportTarget.Canvas:
      sb.push("ctx.save();");
      sb.push("ctx.beginPath();");
      sb.push(
        `ctx.ellipse(${x}, ${y}, ${node.width / 2}, ${
          node.height / 2
        }, 0, 0, 2 * Math.PI);`
      );
      if (fillColor) {
        sb.push(`ctx.fillStyle = "${fillColor}";`);
        sb.push("ctx.fill();");
      }
      if (strokeColor) {
        sb.push(`ctx.strokeStyle = "${strokeColor}";`);
        sb.push(`ctx.lineWidth = ${node.strokeWeight};`);
        sb.push("ctx.stroke();");
      }
      sb.push("ctx.restore();");
      break;
    case ExportTarget.SVG:
      sb.push(
        xmlNode("ellipse", {
          cx: `${x + node.width / 2}`,
          cy: `${y + node.height / 2}`,
          rx: `${node.width / 2}`,
          ry: `${node.height / 2}`,
          ...(strokeColor ? { stroke: strokeColor } : {}),
          ...(fillColor ? { fill: fillColor } : {}),
        })
      );
      break;
  }
}
