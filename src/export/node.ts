import { ExportTarget } from ".";
import { addComment } from "./comment";
import { exportLine } from "./line";
import { exportRectangle } from "./rectangle";

export function exportNode(
  sb: string[],
  target: ExportTarget,
  node: SceneNode,
  topX: number,
  topY: number
) {
  addComment(sb, target, `${node.name} - ${node.type}`, false);
  const relativeX = node.x - topX;
  const relativeY = node.y - topY;

  // "SLICE", "FRAME", "GROUP", "COMPONENT_SET",
  // "COMPONENT", "INSTANCE", "BOOLEAN_OPERATION",
  // "VECTOR", "STAR", "ELLIPSE", "POLYGON",
  // "TEXT", "STICKY", "CONNECTOR", "SHAPE_WITH_TEXT",
  // "STAMP", "WIDGET";
  switch (node.type) {
    case "RECTANGLE":
      exportRectangle(sb, target, {
        node,
        relativeX,
        relativeY,
      });
      break;
    case "LINE":
      exportLine(sb, target, {
        node,
        relativeX,
        relativeY,
      });
      break;
    default:
      break;
  }

  sb.push(``);
}
