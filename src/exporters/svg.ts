import { BaseExporter, Offset, PaintDetails } from "./base";
import { PossibleNode, XmlNode, xmlNodeToString } from "./xml";

export class SVGExporter extends BaseExporter<XmlNode> {
  create(): XmlNode {
    return {
      tag: "svg",
      attrs: {
        xmlns: "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        version: "1.1",
        viewbox: `0 0 ${this.size.width} ${this.size.height}`,
        preserveAspectRatio: "xMidYMid meet",
        overflow: "visible",
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

  path(
    base: XmlNode,
    info: Rect & PaintDetails,
    node: SceneNode & LayoutMixin & MinimalStrokesMixin,
    points: Offset[]
  ): XmlNode {
    const rotation = node.rotation;
    const strokeWidth = node.strokeWeight;
    let path = "";
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (i === 0) {
        path += `M ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    }
    return nest(base, {
      tag: "path",
      attrs: {
        ...geometryAttrs(info),
        ...paintAttrs(info),
        d: path,
        transform: `rotate(${rotation * -1} ${info.x} ${info.y})`,
        "stroke-width": `${strokeWidth}`,
      },
      children: [title(node.name)],
    });
  }

  newLine(base: XmlNode): XmlNode {
    return nest(base, "");
  }

  comment(base: XmlNode, value: string) {
    return nest(base, `<!-- ${value} -->`);
  }

  rectangle(
    base: XmlNode,
    node: RectangleNode,
    info: Rect & PaintDetails
  ): XmlNode {
    const strokeWidth = node.strokeWeight;
    const borderRadius =
      typeof node.cornerRadius === "number" ? node.cornerRadius : 0;
    const rotation = node.rotation;
    return nest(base, {
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
  }

  ellipse(
    base: XmlNode,
    node: EllipseNode,
    info: Rect & PaintDetails
  ): XmlNode {
    const rotation = node.rotation;
    const cx = info.x + info.width / 2;
    const cy = info.y + info.height / 2;
    const rx = info.width / 2;
    const ry = info.height / 2;
    const strokeWidth = node.strokeWeight;
    return nest(base, {
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
  }

  text(base: XmlNode, node: TextNode, info: Rect & PaintDetails): XmlNode {
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

    return nest(base, {
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
  }

  line(base: XmlNode, node: LineNode, info: Rect & PaintDetails): XmlNode {
    const x1 = info.x;
    const y1 = info.y;
    const x2 = info.x + info.width;
    const y2 = info.y + info.height;
    return this.path(base, info, node, [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ]);
  }

  polygon(
    base: XmlNode,
    node: PolygonNode,
    info: Rect & PaintDetails
  ): XmlNode {
    base.children ??= [];
    const pointCount = node.pointCount;
    const vertices: Offset[] = [];
    for (let i = 1; i <= pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2;
      const x = info.x + info.width / 2 + (Math.cos(angle) * info.width) / 2;
      const y = info.y + info.height / 2 + (Math.sin(angle) * info.height) / 2;
      vertices.push({ x, y });
    }
    return this.path(base, info, node, vertices);
  }

  star(base: XmlNode, node: StarNode, info: Rect & PaintDetails): XmlNode {
    base.children ??= [];
    const pointCount = node.pointCount;
    const innerRadius = node.innerRadius;
    const vertices: Offset[] = [];
    for (let i = 1; i <= pointCount; i++) {
      const angle = (2 * Math.PI * i) / pointCount;
      const x = info.x + Math.sin(angle) * innerRadius;
      const y = info.y + Math.cos(angle) * innerRadius;
      vertices.push({ x, y });
    }
    return this.path(base, info, node, vertices);
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

function nest(base: XmlNode, child: PossibleNode): XmlNode {
  base.children ??= [];
  base.children.push(child);
  return base;
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
