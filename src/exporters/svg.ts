import { BaseExporter } from "./base";
import { formatXml, xmlNode } from "./utils";

export class SVGExporter extends BaseExporter<string[]> {
  get name(): string {
    return "SVG";
  }

  get mode(): string {
    return "xml";
  }

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
        },
        children: [xmlNode({ tag: "title", children: [node.name] })],
      })
    );
    return base;
  }

  ellipse(base: string[], node: EllipseNode): string[] {
    const { x, y, width, height } = this.relativeRect(node);
    const { fillColor, strokeColor } = this.paintDetails(node);
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
        },
        children: [xmlNode({ tag: "title", children: [node.name] })],
      })
    );
    return base;
  }

  text(base: string[], node: TextNode): string[] {
    const { x, y, width, height } = this.relativeRect(node);
    const { fillColor, strokeColor } = this.paintDetails(node);
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
        },
        children: [textData],
      })
    );

    return base;
  }

  line(base: string[], node: LineNode): string[] {
    return base;
  }

  polygon(base: string[], node: PolygonNode): string[] {
    return base;
  }

  star(base: string[], node: StarNode): string[] {
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
