import { ExportTarget } from ".";
import { addComment } from "./comment";
import { exportRectangle } from "./rectangle";

export function exportNode(
  sb: string[],
  target: ExportTarget,
  node: SceneNode
) {
  addComment(sb, target, `${node.name} - ${node.type}`, false);

  //    "SLICE" |
  //      "FRAME" |
  //      "GROUP" |
  //      "COMPONENT_SET" |
  //      "COMPONENT" |
  //      "INSTANCE" |
  //      "BOOLEAN_OPERATION" |
  //      "VECTOR" |
  //      "STAR" |
  //      "LINE" |
  //      "ELLIPSE" |
  //      "POLYGON" |
  //      "RECTANGLE" |
  //      "TEXT" |
  //      "STICKY" |
  //      "CONNECTOR" |
  //      "SHAPE_WITH_TEXT" |
  //      "STAMP" |
  //      "WIDGET";
  switch (node.type) {
    case "RECTANGLE":
      exportRectangle(sb, target, node);
      break;
    default:
      break;
  }

  sb.push(``);
}
