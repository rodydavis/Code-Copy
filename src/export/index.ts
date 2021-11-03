import { addComment } from "./comment";
import { exportNode } from "./node";

export enum ExportTarget {
  Canvas = "canvas",
  SVG = "svg",
}

export function exportCode(target: ExportTarget) {
  const sb: string[] = [];
  addComment(
    sb,
    target,
    'This code is generated by the "Code Copy" Figma Plugin'
  );
  const nodes = figma.currentPage.selection || [];
  if (nodes.length === 0) return sb.join("\n");

  const selectionWidth = nodes.reduce((acc, node) => {
    return Math.max(acc, node.width);
  }, 0);
  const selectionHeight = nodes.reduce((acc, node) => {
    return Math.max(acc, node.height);
  }, 0);
  switch (target) {
    case ExportTarget.Canvas:
      sb.push(`const canvas = document.createElement('canvas');`);
      sb.push(`canvas.width = ${selectionWidth};`);
      sb.push(`canvas.height = ${selectionHeight};`);
      sb.push(`const ctx = canvas.getContext('2d');`);
      sb.push(``);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        exportNode(sb, target, node);
      }
      break;
    case ExportTarget.SVG:
      sb.push(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${selectionWidth}" height="${selectionHeight}">`
      );
      sb.push(``);
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        exportNode(sb, target, node);
      }
      sb.push(`</svg>`);
  }
  return sb.join("\n");
}
