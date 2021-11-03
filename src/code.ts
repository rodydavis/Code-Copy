import { exportCode, ExportTarget } from "./export";

figma.showUI(__html__, {
  width: 700,
  height: 500,
});

function setCode(value: string) {
  figma.ui.postMessage({
    type: "set-code",
    code: value,
  });
}

refresh();
figma.on("selectionchange", () => refresh());

function refresh() {
  const code = exportCode(ExportTarget.Canvas);
  setCode(code);
}
