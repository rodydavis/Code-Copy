import { BaseExporter, Offset, PaintDetails } from "./base";
import { XmlNode, xmlNodeToString } from "./xml";

export class SVGExporter extends BaseExporter<XmlNode> {
  create(): XmlNode {
    return {
      tag: "svg",
      attrs: {
        xmlns: "http://www.w3.org/2000/svg",
        viewbox: `0 0 ${this.size.width} ${this.size.height}`,
      },
      children: [],
    };
  }

  save(base: XmlNode): string {
    const raw = xmlNodeToString(base);
    return raw.join("\n");
  }

  title(base: XmlNode, value: string): XmlNode {
    base.children ??= [];
    base.children.push(title(value));
    return base;
  }

  newLine(base: XmlNode): XmlNode {
    base.children ??= [];
    base.children.push("");
    return base;
  }

  comment(base: XmlNode, value: string) {
    base.children ??= [];
    base.children.push(`<!-- ${value} -->`);
    return base;
  }

  rectangle(
    base: XmlNode,
    node: RectangleNode,
    info: Rect & PaintDetails
  ): XmlNode {
    base.children ??= [];
    const strokeWidth = node.strokeWeight;
    const borderRadius =
      typeof node.cornerRadius === "number" ? node.cornerRadius : 0;
    const rotation = node.rotation;
    base.children.push({
      tag: "rect",
      attrs: {
        ...geometryAttrs(info),
        ...paintAttrs(info),
        "stroke-width": `${strokeWidth}`,
        rx: `${borderRadius}`,
        ry: `${borderRadius}`,
        transform: `rotate(${rotation * -1} ${info.x} ${info.y})`,
      },
      children: [title(node.name)],
    });
    return base;
  }

  ellipse(
    base: XmlNode,
    node: EllipseNode,
    info: Rect & PaintDetails
  ): XmlNode {
    base.children ??= [];
    const rotation = node.rotation;
    const cx = info.x + info.width / 2;
    const cy = info.y + info.height / 2;
    const rx = info.width / 2;
    const ry = info.height / 2;
    const strokeWidth = node.strokeWeight;
    base.children.push({
      tag: "ellipse",
      attrs: {
        ...paintAttrs(info),
        cx: `${cx}`,
        cy: `${cy}`,
        rx: `${rx}`,
        ry: `${ry}`,
        "stroke-width": `${strokeWidth}`,
        transform: `rotate(${rotation * -1} ${cx} ${cy})`,
      },
      children: [title(node.name)],
    });
    return base;
  }

  text(base: XmlNode, node: TextNode, info: Rect & PaintDetails): XmlNode {
    base.children ??= [];
    const rotation = node.rotation;
    const textAlign = node.textAlignHorizontal.toLowerCase();
    const textBaseline = node.textAlignVertical.toLowerCase();
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

    base.children.push({
      tag: "text",
      attrs: {
        ...geometryAttrs(info),
        ...paintAttrs(info),
        y: `${info.y + info.height}`,
        "stroke-width": `${strokeWidth}`,
        "text-anchor": `${textAlign}`,
        "dominant-baseline": `${textBaseline}`,
        "font-size": `${fontSize}`,
        "font-family": `${fontFamily}`,
        "font-style": `${fontStyle}`,
        transform: `rotate(${rotation * -1} ${info.x} ${info.y})`,
      },
      children: [textData],
    });

    return base;
  }

  line(base: XmlNode, node: LineNode, info: Rect & PaintDetails): XmlNode {
    base.children ??= [];
    const strokeWidth = node.strokeWeight;
    const rotation = node.rotation;
    const x1 = info.x;
    const y1 = info.y;
    const x2 = info.x + info.width;
    const y2 = info.y + info.height;
    base.children.push({
      tag: "line",
      attrs: {
        ...paintAttrs(info),
        x1: `${x1}`,
        y1: `${y1}`,
        x2: `${x2}`,
        y2: `${y2}`,
        "stroke-width": `${strokeWidth}`,
        transform: `rotate(${rotation * -1}, ${x1}, ${y1})`,
      },
      children: [title(node.name)],
    });
    return base;
  }

  polygon(
    base: XmlNode,
    node: PolygonNode,
    info: Rect & PaintDetails
  ): XmlNode {
    base.children ??= [];
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
          const x = (vertex.x * info.width) / 2 + info.width / 2;
          const y = (vertex.y * info.height) / 2 + info.height / 2;
          return `${x} ${y}`;
        })
        .join(",") +
      ",0";
    base.children.push({
      tag: "polygon",
      attrs: {
        ...geometryAttrs(info),
        ...paintAttrs(info),
        points: points,
        "stroke-width": `${strokeWidth}`,

        rx: `${borderRadius}`,
        ry: `${borderRadius}`,
        transform: `rotate(${rotation * -1}, ${info.x}, ${info.y})`,
      },
      children: [title(node.name)],
    });
    return base;
  }

  star(base: XmlNode, node: StarNode, info: Rect & PaintDetails): XmlNode {
    base.children ??= [];
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
    base.children.push({
      tag: "polygon",
      attrs: {
        ...geometryAttrs(info),
        ...paintAttrs(info),
        points: points,
        "stroke-width": `${strokeWidth}`,
        transform: `rotate(${rotation * -1}, ${info.x}, ${info.y})`,
      },
      children: [title(node.name)],
    });
    return base;
  }

  vector(base: XmlNode, node: VectorNode, info: Rect): XmlNode {
    return base;
  }

  booleanOperation(
    base: XmlNode,
    node: BooleanOperationNode,
    info: Rect
  ): XmlNode {
    return base;
  }

  component(base: XmlNode, node: ComponentNode, info: Rect): XmlNode {
    return base;
  }

  instance(base: XmlNode, node: InstanceNode, info: Rect): XmlNode {
    return base;
  }

  group(base: XmlNode, node: GroupNode, info: Rect): XmlNode {
    return base;
  }

  frame(base: XmlNode, node: FrameNode, info: Rect): XmlNode {
    return base;
  }

  slice(base: XmlNode, node: SliceNode, info: Rect): XmlNode {
    return base;
  }

  componentSet(base: XmlNode, node: ComponentSetNode, info: Rect): XmlNode {
    return base;
  }

  connector(base: XmlNode, node: ConnectorNode, info: Rect): XmlNode {
    return base;
  }

  shapeWithText(base: XmlNode, node: ShapeWithTextNode, info: Rect): XmlNode {
    return base;
  }

  stamp(base: XmlNode, node: StampNode, info: Rect): XmlNode {
    return base;
  }

  widget(base: XmlNode, node: WidgetNode, info: Rect): XmlNode {
    return base;
  }

  sticky(base: XmlNode, node: StickyNode, info: Rect): XmlNode {
    return base;
  }
}

function title(value: string) {
  return { tag: "title", children: [value] };
}

function geometryAttrs(info: Rect): { [key: string]: string } {
  return {
    x: `${info.x}`,
    y: `${info.y}`,
    width: `${info.width}`,
    height: `${info.height}`,
  };
}

function paintAttrs(info: PaintDetails): { [key: string]: string } {
  return {
    ...(info.fillColor ? { fill: info.fillColor } : {}),
    ...(info.strokeColor ? { stroke: info.strokeColor } : {}),
  };
}
