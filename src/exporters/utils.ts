type PossibleNode = XmlNode | string;
export interface XmlNode {
  tag: string;
  attrs?: { [key: string]: string };
  children?: PossibleNode[];
}

export function xmlNode(node: XmlNode, autoClose: boolean = true) {
  let result = `<${node.tag}`;
  if (node.attrs) {
    if (Object.keys(node.attrs).length > 0) {
      const attrs = Object.keys(node.attrs)
        .map((key) => `${key}="${node.attrs![key]}"`)
        .join(" ");
      result += ` ${attrs}`;
    }
  }
  result += `>`;
  if (node.children) {
    for (const child of node.children) {
      if (typeof child === "string") {
        result += child;
      } else {
        result += xmlNode(child);
      }
    }
  }
  if (autoClose) {
    result += `</${node.tag}>`;
  }
  return result;
}

export function formatXml(xml: string, tab?: string): string {
  let formatted = "",
    indent = "";
  tab = tab || "\t";
  xml.split(/>\s*</).forEach(function (node) {
    if (node.match(/^\/\w/)) indent = indent.substring(tab!.length); // decrease indent by one 'tab'
    formatted += indent + "<" + node + ">\r\n";
    if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab; // increase indent
  });
  return formatted.substring(1, formatted.length - 3);
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
