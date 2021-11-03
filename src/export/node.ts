import { ExportTarget } from ".";
import { addComment } from "./comment";

export function exportNode(
  sb: string[],
  target: ExportTarget,
  node: SceneNode
) {
  addComment(sb, target, `${node.name} - ${node.type}`);
}
