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

  export(base: T, nodes: readonly SceneNode[]): string {
    return this.save(this.selection(base, nodes));
  }

  selection(base: T, nodes: readonly SceneNode[]): T {
    if (nodes.length > 0) {
      this.offset.x = nodes.reduce((acc, node) => {
        return Math.min(acc, node.x);
      }, nodes[0].x);
      this.offset.y = nodes.reduce((acc, node) => {
        return Math.min(acc, node.y);
      }, nodes[0].y);

      for (const node of nodes) {
        const relativeX = node.x - this.offset.x;
        const relativeY = node.y - this.offset.y;
        this.size.width = Math.max(this.size.width, relativeX + node.width);
        this.size.height = Math.max(this.size.height, relativeY + node.height);
      }
    }

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
    const info = this.relativeRect(node);
    switch (node.type) {
      case "SLICE":
        return this.slice(base, node, info);
      case "FRAME":
        return this.frame(base, node, info);
      case "GROUP":
        return this.group(base, node, info);
      case "COMPONENT_SET":
        return this.componentSet(base, node, info);
      case "COMPONENT":
        return this.component(base, node, info);
      case "INSTANCE":
        return this.instance(base, node, info);
      case "BOOLEAN_OPERATION":
        return this.booleanOperation(base, node, info);
      case "VECTOR":
        return this.vector(base, node, info);
      case "STAR":
        return this.star(base, node, info);
      case "POLYGON":
        return this.polygon(base, node, info);
      case "LINE":
        return this.line(base, node, info);
      case "TEXT":
        return this.text(base, node, info);
      case "STICKY":
        return this.sticky(base, node, info);
      case "CONNECTOR":
        return this.connector(base, node, info);
      case "SHAPE_WITH_TEXT":
        return this.shapeWithText(base, node, info);
      case "STAMP":
        return this.stamp(base, node, info);
      case "WIDGET":
        return this.widget(base, node, info);
      case "ELLIPSE":
        return this.ellipse(base, node, info);
      case "RECTANGLE":
        return this.rectangle(base, node, info);
      default:
        throw new Error(`Unknown node type ${node}`);
    }
  }

  abstract comment(base: T, value: string): T;
  abstract rectangle(base: T, node: RectangleNode, info: Rect): T;
  abstract ellipse(base: T, node: EllipseNode, info: Rect): T;
  abstract line(base: T, node: LineNode, info: Rect): T;
  abstract polygon(base: T, node: PolygonNode, info: Rect): T;
  abstract star(base: T, node: StarNode, info: Rect): T;
  abstract vector(base: T, node: VectorNode, info: Rect): T;
  abstract booleanOperation(base: T, node: BooleanOperationNode, info: Rect): T;
  abstract component(base: T, node: ComponentNode, info: Rect): T;
  abstract instance(base: T, node: InstanceNode, info: Rect): T;
  abstract group(base: T, node: GroupNode, info: Rect): T;
  abstract frame(base: T, node: FrameNode, info: Rect): T;
  abstract slice(base: T, node: SliceNode, info: Rect): T;
  abstract componentSet(base: T, node: ComponentSetNode, info: Rect): T;
  abstract connector(base: T, node: ConnectorNode, info: Rect): T;
  abstract shapeWithText(base: T, node: ShapeWithTextNode, info: Rect): T;
  abstract stamp(base: T, node: StampNode, info: Rect): T;
  abstract widget(base: T, node: WidgetNode, info: Rect): T;
  abstract text(base: T, node: TextNode, info: Rect): T;
  abstract sticky(base: T, node: StickyNode, info: Rect): T;

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

interface PaintDetails {
  fillColor?: string;
  strokeColor?: string;
}
