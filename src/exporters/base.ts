import { figmaToHex } from "./utils";

export abstract class BaseExporter<T> {
  size: Size = {
    width: 0,
    height: 0,
  };
  offset: Offset = {
    x: 0,
    y: 0,
  };

  abstract save(base: T): string;

  abstract create(): T;

  export(nodes: readonly SceneNode[]): string {
    let selectionWidth = 0;
    let selectionHeight = 0;
    let topX = 0;
    let topY = 0;
    if (nodes.length > 0) {
      if (nodes.length === 1) {
        const first = nodes[0];
        selectionWidth = first.width;
        selectionHeight = first.height;
        topX = first.x;
        topY = first.y;
      } else {
        topX = nodes.reduce((acc, node) => {
          return Math.min(acc, node.x);
        }, nodes[0].x || 0);
        topY = nodes.reduce((acc, node) => {
          return Math.min(acc, node.y);
        }, nodes[0].y || 0);
        for (const node of nodes) {
          const relativeX = node.x - this.offset.x;
          const relativeY = node.y - this.offset.y;
          selectionWidth = Math.max(selectionWidth, relativeX + node.width);
          selectionHeight = Math.max(selectionHeight, relativeY + node.height);
        }
      }
    }
    this.offset = {
      x: topX,
      y: topY,
    };
    this.size = {
      width: selectionWidth,
      height: selectionHeight,
    };
    const base = this.create();
    const result = this.selection(base, nodes);
    return this.save(result);
  }

  selection(base: T, nodes: readonly SceneNode[]): T {
    base = this.before(base);
    for (const node of nodes) {
      base = this.sceneNode(base, node);
    }
    base = this.after(base);
    return base;
  }

  before(base: T) {
    return base;
  }

  after(base: T) {
    return base;
  }

  sceneNode(base: T, node: SceneNode) {
    console.log(node.type);
    this.comment(base, node.name);
    switch (node.type) {
      case "SLICE":
        return this.slice(base, node, {
          ...this.relativeRect(node),
        });
      case "FRAME":
        return this.frame(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "GROUP":
        return this.group(base, node, {
          ...this.relativeRect(node),
        });
      case "COMPONENT_SET":
        return this.componentSet(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "COMPONENT":
        return this.component(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "INSTANCE":
        return this.instance(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "BOOLEAN_OPERATION":
        return this.booleanOperation(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "VECTOR":
        return this.vector(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "STAR":
        const startInfo = this.relativeRect(node);
        const starPointCount = node.pointCount;
        const innerRadius = node.innerRadius;
        const starVertices: Offset[] = [];
        for (let i = 1; i <= starPointCount; i++) {
          const angle = (2 * Math.PI * i) / starPointCount;
          const x = startInfo.x + Math.sin(angle) * innerRadius;
          const y = startInfo.y + Math.cos(angle) * innerRadius;
          starVertices.push({ x, y });
        }
        return this.star(base, node, {
          ...startInfo,
          ...this.paintDetails(node),
          points: starVertices,
        });
      case "POLYGON":
        const polygonInfo = this.relativeRect(node);
        const polygonPointCount = node.pointCount;
        const polygonVertices: Offset[] = [];
        for (let i = 1; i <= polygonPointCount; i++) {
          const angle = (i / polygonPointCount) * Math.PI * 2;
          const x =
            polygonInfo.x +
            polygonInfo.width / 2 +
            (Math.cos(angle) * polygonInfo.width) / 2;
          const y =
            polygonInfo.y +
            polygonInfo.height / 2 +
            (Math.sin(angle) * polygonInfo.height) / 2;
          polygonVertices.push({ x, y });
        }
        return this.polygon(base, node, {
          ...polygonInfo,
          ...this.paintDetails(node),
          points: polygonVertices,
        });
      case "LINE":
        return this.line(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "TEXT":
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
        const paragraphIndent: number = node.paragraphIndent;
        const paragraphSpacing: number = node.paragraphSpacing;
        return this.text(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
          textAlign,
          textBaseline,
          fontSize,
          fontFamily,
          fontStyle,
          textData,
          paragraphIndent,
          paragraphSpacing,
        });
      case "STICKY":
        return this.sticky(base, node, {
          ...this.relativeRect(node),
        });
      case "CONNECTOR":
        return this.connector(base, node, {
          ...this.relativeRect(node),
        });
      case "SHAPE_WITH_TEXT":
        return this.shapeWithText(base, node, {
          ...this.relativeRect(node),
        });
      case "STAMP":
        return this.stamp(base, node, {
          ...this.relativeRect(node),
        });
      case "WIDGET":
        return this.widget(base, node, {
          ...this.relativeRect(node),
        });
      case "ELLIPSE":
        const ellipseInfo = this.relativeRect(node);
        const cx = ellipseInfo.x + ellipseInfo.width / 2;
        const cy = ellipseInfo.y + ellipseInfo.height / 2;
        const rx = ellipseInfo.width / 2;
        const ry = ellipseInfo.height / 2;
        return this.ellipse(base, node, {
          ...ellipseInfo,
          ...this.paintDetails(node),
          cx,
          cy,
          rx,
          ry,
        });
      case "RECTANGLE":
        return this.rectangle(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      default:
        throw new Error(`Unknown node type ${node}`);
    }
  }

  abstract comment(base: T, value: string): T;
  abstract rectangle(
    base: T,
    node: RectangleNode,
    info: Rect & PaintDetails
  ): T;
  abstract ellipse(
    base: T,
    node: EllipseNode,
    info: Rect & PaintDetails & EllipseDetails
  ): T;
  abstract line(base: T, node: LineNode, info: Rect & PaintDetails): T;
  abstract polygon(
    base: T,
    node: PolygonNode,
    info: Rect & PaintDetails & PathDetails
  ): T;
  abstract star(
    base: T,
    node: StarNode,
    info: Rect & PaintDetails & PaintDetails & PathDetails
  ): T;
  abstract vector(base: T, node: VectorNode, info: Rect & PaintDetails): T;
  abstract booleanOperation(base: T, node: BooleanOperationNode, info: Rect): T;
  abstract component(
    base: T,
    node: ComponentNode,
    info: Rect & PaintDetails
  ): T;
  abstract instance(base: T, node: InstanceNode, info: Rect & PaintDetails): T;
  abstract group(base: T, node: GroupNode, info: Rect): T;
  abstract frame(base: T, node: FrameNode, info: Rect & PaintDetails): T;
  abstract slice(base: T, node: SliceNode, info: Rect): T;
  abstract componentSet(
    base: T,
    node: ComponentSetNode,
    info: Rect & PaintDetails
  ): T;
  abstract connector(base: T, node: ConnectorNode, info: Rect): T;
  abstract shapeWithText(base: T, node: ShapeWithTextNode, info: Rect): T;
  abstract stamp(base: T, node: StampNode, info: Rect): T;
  abstract widget(base: T, node: WidgetNode, info: Rect): T;
  abstract text(
    base: T,
    node: TextNode,
    info: Rect & PaintDetails & TextDetails
  ): T;
  abstract sticky(base: T, node: StickyNode, info: Rect & PaintDetails): T;

  rect(node: SceneNode): Rect {
    return {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
    };
  }

  relativeRect(node: SceneNode): Rect {
    const relativeX = node.x - this.offset.x;
    const relativeY = node.y - this.offset.y;
    return {
      x: relativeX,
      y: relativeY,
      width: node.width,
      height: node.height,
    };
  }

  pathData(points: Offset[]): string {
    let path = "";
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (i === 0) {
        path += `M ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    }
    return path;
  }

  paintDetails(node: SceneNode & GeometryMixin): PaintDetails {
    let fillColor: string | undefined = undefined;
    let strokeColor: string | undefined = undefined;

    if (
      node.fills != null &&
      Array.isArray(node.fills) &&
      node.fills.length > 0
    ) {
      const fill = node.fills[0] as Paint;
      if (fill.type === "SOLID") {
        fillColor = figmaToHex(fill.color);
      }
    }

    if (
      node.strokes != null &&
      Array.isArray(node.strokes) &&
      node.strokes.length > 0
    ) {
      const stroke = node.strokes[0] as Paint;
      if (stroke.type === "SOLID") {
        strokeColor = figmaToHex(stroke.color);
      }
    }

    return {
      fillColor,
      strokeColor,
    };
  }
}

export interface Offset {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Rect = Offset & Size;

export interface Rotation {
  angle: number;
}

export interface PaintDetails {
  fillColor?: string;
  strokeColor?: string;
}

export interface TextDetails {
  textAlign: string;
  textBaseline: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  textData: string;
  paragraphIndent: number;
  paragraphSpacing: number;
}

export interface EllipseDetails {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface PathDetails {
  points: Offset[];
}
