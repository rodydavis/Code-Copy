import { ExportTarget, NodeMetaData } from ".";
import { getPaint, xmlNode } from "./utils";

export function exportLine(
  sb: string[],
  target: ExportTarget,
  meta: NodeMetaData<LineNode>
) {
  const node = meta.node;
  const x1 = meta.relativeX;
  const y1 = meta.relativeY;
  const x2 = x1 + node.width;
  const y2 = y1 + node.height;
  const rotation = node.rotation;

  const { strokeColor } = getPaint(node);
  switch (target) {
    case ExportTarget.Canvas:
      sb.push("ctx.save();");
      sb.push(`ctx.rotate(${rotation});`);
      sb.push("ctx.beginPath();");
      sb.push(`ctx.moveTo(${x1}, ${x2});`);
      sb.push(`ctx.lineTo(${x2}, ${y2});`);
      sb.push(`ctx.strokeStyle = "${strokeColor!}";`);
      sb.push("ctx.stroke();");
      sb.push(`ctx.restore();`);
      break;
    case ExportTarget.SVG:
      sb.push(
        xmlNode("line", {
          x1: `${x1}`,
          y1: `${y1}`,
          x2: `${x2}`,
          y2: `${y2}`,
          stroke: strokeColor!,
          transform: `rotate(${rotation * -1} 100 100)`,
        })
      );
      break;
  }
}
