import { ExportTarget } from "./index";

export function addComment(
  sb: string[],
  target: ExportTarget,
  comment: string,
  addBlankLine = true
) {
  const lines = comment.split("\n");
  const addCommentLine = (line: string) => {
    switch (target) {
      case ExportTarget.Canvas:
        sb.push(`// ${line}`);
        break;
      case ExportTarget.SVG:
        sb.push(`<!-- ${line} -->`);
        break;
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i > 0) {
      sb.push("");
    }
    let lineLength = 0;
    for (let j = 0; j < line.length; j++) {
      const char = line.charAt(j);
      if (char === " ") {
        lineLength++;
      } else {
        break;
      }
    }
    if (lineLength > 0) {
      addCommentLine(line.substr(lineLength));
    } else {
      addCommentLine(line);
    }
  }
  if (addBlankLine) sb.push("");
}
