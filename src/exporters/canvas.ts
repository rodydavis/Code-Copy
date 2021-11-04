import { BaseExporter, Offset, PaintDetails, Rect, Size } from "./base";

export class CanvasExport extends BaseExporter<string[]> {
  save(base: string[]): string {
    return base.join("\n");
  }
  create(): string[] {
    return [
      "const canvas = document.getElementsByTagName('canvas')[0];",
      `canvas.width = ${this.size.width};`,
      `canvas.height = ${this.size.height};`,
      "const ctx = canvas.getContext('2d');",
      "",
    ];
  }

  comment(base: string[], value: string): string[] {
    base.push("// " + value);
    return base;
  }

  rectangle(
    base: string[],
    node: RectangleNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    base.push("ctx.save();");
    paintStyles(base, info);
    base.push(
      `ctx.fillRect(${info.x}, ${info.y}, ${info.width}, ${info.height});`
    );
    base.push(
      `ctx.strokeRect(${info.x}, ${info.y}, ${info.width}, ${info.height});`
    );
    base.push("ctx.restore();");
    return base;
  }

  ellipse(
    base: string[],
    node: EllipseNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    base.push("ctx.save();");
    paintStyles(base, info);
    base.push(`ctx.beginPath();`);
    base.push(
      `ctx.ellipse(${info.x + info.width / 2}, ${info.y + info.height / 2}, ${
        info.width / 2
      }, ${info.height / 2}, 0, 0, 2 * Math.PI);`
    );
    base.push("ctx.fill();");
    base.push("ctx.restore();");
    return base;
  }

  line(
    base: string[],
    node: LineNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    base.push("ctx.save();");
    paintStyles(base, info);
    base.push(`ctx.beginPath();`);
    base.push(`ctx.moveTo(${info.x}, ${info.y});`);
    base.push(`ctx.lineTo(${info.x + info.width}, ${info.y + info.height});`);
    base.push("ctx.stroke();");
    base.push("ctx.restore();");
    return base;
  }

  polygon(
    base: string[],
    node: PolygonNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    base.push("ctx.save();");
    paintStyles(base, info);
    base.push(`ctx.beginPath();`);
    base.push(`ctx.moveTo(${info.x}, ${info.y});`);
    const points = node.pointCount;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const x = info.x + info.width / 2 + (info.width / 2) * Math.cos(angle);
      const y = info.y + info.height / 2 + (info.height / 2) * Math.sin(angle);
      base.push(`ctx.lineTo(${x}, ${y});`);
    }
    base.push("ctx.fill();");
    base.push("ctx.restore();");
    return base;
  }

  star(
    base: string[],
    node: StarNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    base.push("ctx.save();");
    paintStyles(base, info);
    base.push(`ctx.beginPath();`);
    base.push(`ctx.moveTo(${info.x}, ${info.y});`);
    const points = node.pointCount;
    const innerRadius = node.innerRadius;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const x = info.x + Math.sin(angle) * innerRadius;
      const y = info.y + Math.cos(angle) * innerRadius;
      base.push(`ctx.lineTo(${x}, ${y});`);
    }
    return base;
  }

  vector(
    base: string[],
    node: VectorNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    return base;
  }

  booleanOperation(
    base: string[],
    node: BooleanOperationNode,
    info: Rect
  ): string[] {
    return base;
  }

  component(
    base: string[],
    node: ComponentNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    return base;
  }

  instance(
    base: string[],
    node: InstanceNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    return base;
  }
  group(base: string[], node: GroupNode, info: Rect): string[] {
    return base;
  }

  frame(
    base: string[],
    node: FrameNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    return base;
  }
  slice(base: string[], node: SliceNode, info: Rect): string[] {
    return base;
  }

  componentSet(
    base: string[],
    node: ComponentSetNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    return base;
  }
  connector(base: string[], node: ConnectorNode, info: Rect): string[] {
    return base;
  }
  shapeWithText(base: string[], node: ShapeWithTextNode, info: Rect): string[] {
    return base;
  }
  stamp(base: string[], node: StampNode, info: Rect): string[] {
    return base;
  }
  widget(base: string[], node: WidgetNode, info: Rect): string[] {
    return base;
  }

  text(
    base: string[],
    node: TextNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    return base;
  }

  sticky(
    base: string[],
    node: StickyNode,
    info: Offset & Size & PaintDetails
  ): string[] {
    return base;
  }
}

function paintStyles(base: string[], paint: PaintDetails) {
  if (paint.fillColor) {
    base.push(`ctx.fillStyle = '${paint.fillColor}';`);
  }
  if (paint.strokeColor) {
    base.push(`ctx.strokeStyle = '${paint.strokeColor}';`);
  }
  return base;
}
