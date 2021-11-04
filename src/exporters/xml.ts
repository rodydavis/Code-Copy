/**
 * The child of an XML node can be raw text or another xml node.
 */
export type PossibleNode = XmlNode | string;

/**
 * Base XML Node type.
 */
export interface XmlNode {
  tag: string;
  attrs?: { [key: string]: string };
  children?: PossibleNode[];
}

/**
 * Exports the given XML node to a string array.
 * 
 * @param node XML Node
 * @param autoClose Auto close the tag
 * @param indent Indentation level
 * @returns String array
 */
export function xmlNodeToString(
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
          const lines = xmlNodeToString(child, autoClose, indent + 1);
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
