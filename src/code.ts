import { exportCode, ExportTarget } from "./export";

figma.showUI(__html__, {
  width: 700,
  height: 500,
});

let exportType = ExportTarget.Canvas;

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
  const code = exportCode(exportType);
  setCode(code);
}
