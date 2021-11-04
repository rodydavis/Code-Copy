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
    const base = this.create();
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
        return this.star(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "POLYGON":
        return this.polygon(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "LINE":
        return this.line(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
        });
      case "TEXT":
        return this.text(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
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
        return this.ellipse(base, node, {
          ...this.relativeRect(node),
          ...this.paintDetails(node),
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
  abstract ellipse(base: T, node: EllipseNode, info: Rect & PaintDetails): T;
  abstract line(base: T, node: LineNode, info: Rect & PaintDetails): T;
  abstract polygon(base: T, node: PolygonNode, info: Rect & PaintDetails): T;
  abstract star(
    base: T,
    node: StarNode,
    info: Rect & PaintDetails & PaintDetails
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
  abstract text(base: T, node: TextNode, info: Rect & PaintDetails): T;
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
