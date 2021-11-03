import { addComment } from "./comment";
import { exportNode } from "./node";

export enum ExportTarget {
  Canvas,
  SVG,
}

export function exportCode(target: ExportTarget) {
  const sb: string[] = [];
  addComment(
    sb,
    target,
    'This code is generated by the "Code Copy" Figma Plugin'
  );
  const nodes = figma.currentPage.selection || [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    exportNode(sb, target, node);
  }
  return sb.join("\n");
}
