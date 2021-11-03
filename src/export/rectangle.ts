import { ExportTarget } from ".";

export function exportRectangle(
  sb: string[],
  target: ExportTarget,
  node: RectangleNode
) {
  switch (target) {
    case ExportTarget.Canvas:
      sb.push(`ctx.rect(${node.x}, ${node.y}, ${node.width}, ${node.height});`);
      break;
    case ExportTarget.SVG:
      sb.push(
        `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" />`
      );
      break;
  }
}
