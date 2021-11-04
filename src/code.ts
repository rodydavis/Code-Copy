import { BaseExporter } from "./exporters/base";
import { SVGExporter } from "./exporters/svg";
import { ExportTarget } from "./exporters/utils";

figma.showUI(__html__, {
  width: 700,
  height: 500,
});

let exportType = ExportTarget.SVG;

figma.ui.onmessage = (msg) => {
  if (msg.type === "export-type") {
    exportType = msg.value;
    refresh();
  }
};

function setCode(value: string) {
  figma.ui.postMessage({
    type: "set-code",
    code: value,
  });
}

refresh();
figma.on("selectionchange", () => refresh());

function refresh() {
  let exporter: BaseExporter<any> = new SVGExporter();
  switch (exportType) {
    case ExportTarget.SVG:
      exporter = new SVGExporter();
      break;
  }
  const nodes = figma.currentPage.selection || [];
  const code = exporter.export([], nodes);
  setCode(code);
}
