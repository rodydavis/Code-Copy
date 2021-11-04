type PossibleNode = XmlNode | string;
export interface XmlNode {
  tag: string;
  attrs?: { [key: string]: string };
  children?: PossibleNode[];
}

export function xmlNode(
  node: XmlNode,
  autoClose: boolean = true,
  indent: number = 0
): string[] {
  const indentStr = " ".repeat(indent);
  const sb: string[] = [];
  sb.push(`${indentStr}<${node.tag}`);
  if (node.attrs) {
    for (const key in node.attrs) {
      sb.push(`${indentStr} ${key}="${node.attrs[key]}"`);
    }
  }
  if (node.children) {
    if (node.children.length === 1 && typeof node.children[0] === "string") {
      sb[sb.length - 1] += ">" + node.children[0];
    } else {
      sb.push(`${indentStr}>`);
      for (const child of node.children) {
        if (typeof child === "string") {
          sb.push(`${indentStr}  ${child}`);
        } else {
          const lines = xmlNode(child, autoClose, indent + 1);
          sb.push(...lines.map((line) => `${indentStr}  ${line}`));
        }
      }
    }
    if (autoClose) {
      if (node.children.length === 1 && typeof node.children[0] === "string") {
        sb[sb.length - 1] += `</${node.tag}>`;
      } else {
        sb.push(`${indentStr}</${node.tag}>`);
      }
    }
  } else {
    if (autoClose) {
      sb.push(`${indentStr}/>`);
    } else {
      sb.push(`${indentStr}>`);
    }
  }
  return sb;
}

export function figmaToHex(rgb: RGB) {
  const red = Math.round(rgb.r * 255);
  const green = Math.round(rgb.g * 255);
  const blue = Math.round(rgb.b * 255);
  return `#${red.toString(16)}${green.toString(16)}${blue.toString(16)}`;
}

export enum ExportTarget {
  SVG = "svg",
}
