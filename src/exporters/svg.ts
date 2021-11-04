import { BaseExporter, Offset } from "./base";
import { formatXml, xmlNode } from "./utils";

export class SVGExporter extends BaseExporter<string[]> {
  save(base: string[]): string {
    const raw = base.join("\n");
    const formatted = formatXml(raw);
    return formatted;
  }

  title(base: string[], value: string): string[] {
    base.push(xmlNode({ tag: "title", children: [value] }));
    return base;
  }

  before(base: string[]): string[] {
    base.push(
      xmlNode(
        {
          tag: "svg",
          attrs: {
            xmlns: "http://www.w3.org/2000/svg",
            viewbox: `0 0 ${this.size.width} ${this.size.height}`,
          },
        },
        false
      )
    );
    return base;
  }

  after(base: string[]): string[] {
    base.push("</svg>");
    this.newLine(base);
    return base;
  }

  newLine(base: string[]): string[] {
    base.push("");
    return base;
  }

  comment(base: string[], value: string) {
    base.push(`<!-- ${value} -->`);
    return base;
  }

  rectangle(base: string[], node: RectangleNode): string[] {
    const { x, y, width, height } = this.relativeRect(node);
    const { fillColor, strokeColor } = this.paintDetails(node);
    const strokeWidth = node.strokeWeight;
    const borderRadius =
      typeof node.cornerRadius === "number" ? node.cornerRadius : 0;
    const rotation = node.rotation;
    base.push(
      xmlNode({
        tag: "rect",
        attrs: {
          x: `${x}`,
          y: `${y}`,
          width: `${width}`,
          height: `${height}`,
          ...(fillColor ? { fill: fillColor } : {}),
          ...(strokeColor ? { stroke: strokeColor } : {}),
          "stroke-width": `${strokeWidth}`,
          rx: `${borderRadius}`,
          ry: `${borderRadius}`,
          transform: `rotate(${rotation} ${x} ${y})`,
        },
        children: [title(node.name)],
      })
    );
    return base;
  }

  ellipse(base: string[], node: EllipseNode): string[] {
    const { x, y, width, height } = this.relativeRect(node);
    const { fillColor, strokeColor } = this.paintDetails(node);
    const rotation = node.rotation;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rx = width / 2;
    const ry = height / 2;
    const strokeWidth = node.strokeWeight;
    base.push(
      xmlNode({
        tag: "ellipse",
        attrs: {
          cx: `${cx}`,
          cy: `${cy}`,
          rx: `${rx}`,
          ry: `${ry}`,
          ...(fillColor ? { fill: fillColor } : {}),
          ...(strokeColor ? { stroke: strokeColor } : {}),
          "stroke-width": `${strokeWidth}`,
          transform: `rotate(${rotation} ${cx} ${cy})`,
        },
        children: [title(node.name)],
      })
    );
    return base;
  }

  text(base: string[], node: TextNode): string[] {
    const { x, y, width, height } = this.relativeRect(node);
    const { fillColor, strokeColor } = this.paintDetails(node);
    const rotation = node.rotation;
    const textAlign = node.textAlignHorizontal;
    const textBaseline = node.textAlignVertical;
    const fontSize = typeof node.fontSize === "number" ? node.fontSize : 12;
    let fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
    let fontStyle = "normal";
    if (Object(node.fontName).hasOwnProperty("family")) {
      const family = node.fontName as FontName;
      fontFamily = family.family;
      fontStyle = family.style;
    }
    const strokeWidth = node.strokeWeight;
    let textData = node.characters;
    const textCase =
      typeof node.textCase === "string" ? node.textCase : "ORIGINAL";
    switch (textCase) {
      case "UPPER":
        textData = textData.toUpperCase();
        break;
      case "LOWER":
        textData = textData.toLowerCase();
        break;
      case "TITLE":
        textData = textData.replace(/\b\w/g, (l) => l.toUpperCase());
        break;
      default:
        break;
    }

    // const paragraphIndent: number = node.paragraphIndent;
    // const paragraphSpacing: number = node.paragraphSpacing;
    // const autoRename: boolean = node.autoRename;

    base.push(
      xmlNode({
        tag: "text",
        attrs: {
          x: `${x}`,
          y: `${y}`,
          width: `${width}`,
          height: `${height}`,
          ...(fillColor ? { fill: fillColor } : {}),
          ...(strokeColor ? { stroke: strokeColor } : {}),
          "stroke-width": `${strokeWidth}`,
          "text-anchor": `${textAlign}`,
          "dominant-baseline": `${textBaseline}`,
          "font-size": `${fontSize}`,
          "font-family": `${fontFamily}`,
          "font-style": `${fontStyle}`,
          transform: `rotate(${rotation} ${x} ${y})`,
        },
        children: [textData],
      })
    );

    return base;
  }

  line(base: string[], node: LineNode): string[] {
    const { x, y, width, height } = this.relativeRect(node);
    const { fillColor, strokeColor } = this.paintDetails(node);
    const strokeWidth = node.strokeWeight;
    const rotation = node.rotation;
    const x1 = x;
    const y1 = y;
    const x2 = x + width;
    const y2 = y + height;
    base.push(
      xmlNode({
        tag: "line",
        attrs: {
          x1: `${x1}`,
          y1: `${y1}`,
          x2: `${x2}`,
          y2: `${y2}`,
          ...(fillColor ? { fill: fillColor } : {}),
          ...(strokeColor ? { stroke: strokeColor } : {}),
          "stroke-width": `${strokeWidth}`,
          transform: `rotate(${rotation}, ${x1}, ${y1})`,
        },
        children: [title(node.name)],
      })
    );
    return base;
  }

  polygon(base: string[], node: PolygonNode): string[] {
    const { x, y, width, height } = this.relativeRect(node);
    const { fillColor, strokeColor } = this.paintDetails(node);
    const strokeWidth = node.strokeWeight;
    const rotation = node.rotation;
    const borderRadius =
      typeof node.cornerRadius === "number" ? node.cornerRadius : 0;
    const pointCount = node.pointCount;
    const vertices: Offset[] = [];
    for (let i = 1; i <= pointCount; i++) {
      vertices.push({
        x: Math.sin((2 * Math.PI * i) / i),
        y: Math.cos((2 * Math.PI * i) / i),
      });
    }
    const points =
      "0," +
      vertices
        .map((vertex) => {
          const x = (vertex.x * width) / 2 + width / 2;
          const y = (vertex.y * height) / 2 + height / 2;
          return `${x} ${y}`;
        })
        .join(",") +
      ",0";
    base.push(
      xmlNode({
        tag: "polygon",
        attrs: {
          points: points,
          ...(fillColor ? { fill: fillColor } : {}),
          ...(strokeColor ? { stroke: strokeColor } : {}),
          "stroke-width": `${strokeWidth}`,
          x: `${x}`,
          y: `${y}`,
          rx: `${borderRadius}`,
          ry: `${borderRadius}`,
          transform: `rotate(${rotation}, ${x}, ${y})`,
        },
        children: [title(node.name)],
      })
    );
    return base;
  }

  star(base: string[], node: StarNode): string[] {
    const { x, y } = this.relativeRect(node);
    const { fillColor, strokeColor } = this.paintDetails(node);
    const pointCount = node.pointCount;
    const innerRadius = node.innerRadius;
    const strokeWidth = node.strokeWeight;
    const rotation = node.rotation;
    const points =
      "0," +
      Array.from({ length: pointCount }, (_, i) => {
        const angle = (2 * Math.PI * i) / pointCount;
        const x = Math.sin(angle) * innerRadius;
        const y = Math.cos(angle) * innerRadius;
        return `${x} ${y}`;
      }).join(",") +
      ",0";
    base.push(
      xmlNode({
        tag: "polygon",
        attrs: {
          points: points,
          ...(fillColor ? { fill: fillColor } : {}),
          ...(strokeColor ? { stroke: strokeColor } : {}),
          "stroke-width": `${strokeWidth}`,
          transform: `rotate(${rotation}, ${x}, ${y})`,
          x: `${x}`,
          y: `${y}`,
        },
        children: [title(node.name)],
      })
    );
    return base;
  }

  vector(base: string[], node: VectorNode): string[] {
    return base;
  }

  booleanOperation(base: string[], node: BooleanOperationNode): string[] {
    return base;
  }

  component(base: string[], node: ComponentNode): string[] {
    return base;
  }

  instance(base: string[], node: InstanceNode): string[] {
    return base;
  }

  group(base: string[], node: GroupNode): string[] {
    return base;
  }

  frame(base: string[], node: FrameNode): string[] {
    return base;
  }

  slice(base: string[], node: SliceNode): string[] {
    return base;
  }

  componentSet(base: string[], node: ComponentSetNode): string[] {
    return base;
  }

  connector(base: string[], node: ConnectorNode): string[] {
    return base;
  }

  shapeWithText(base: string[], node: ShapeWithTextNode): string[] {
    return base;
  }

  stamp(base: string[], node: StampNode): string[] {
    return base;
  }

  widget(base: string[], node: WidgetNode): string[] {
    return base;
  }

  sticky(base: string[], node: StickyNode): string[] {
    return base;
  }
}

function title(value: string) {
  return xmlNode({ tag: "title", children: [value] });
}
