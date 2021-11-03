import "@material/mwc-tab-bar";
import "@material/mwc-tab";

import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import { TabBar } from "@material/mwc-tab-bar";
import { ExportTarget } from "./export";

const editorElem = document.getElementById("editor") as HTMLDivElement;
const exportTarget = document.getElementById("tabs") as TabBar;
exportTarget.addEventListener("MDCTabBar:activated", (e) => {
  const event = e as CustomEvent;
  const tab = event.detail.index as number;
  let value = ExportTarget.Canvas;
  if (tab === 1) {
    value = ExportTarget.SVG;
  } else {
    value = ExportTarget.Canvas;
  }
  if (value === "svg") {
    editor.setOption("mode", "xml");
  } else if (value === "canvas") {
    editor.setOption("mode", "javascript");
  }
  parent.postMessage({ pluginMessage: { type: "export-type", value } }, "*");
});

const editor = CodeMirror.fromTextArea(editorElem, {
  theme: "material",
  lineNumbers: true,
  readonly: true,
});

editor.setSize("100%", "100%");

onmessage = (event) => {
  const message = event.data.pluginMessage;
  if (message.type === "set-code") {
    editor.setValue(message.code);
    editor.setSize("100%", "100%");
  }
};
