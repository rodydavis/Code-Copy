import "@material/mwc-tab-bar";
import "@material/mwc-tab";

import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import { TabBar } from "@material/mwc-tab-bar";
import { ExportTarget } from "./exporters/utils";

const editorElem = document.getElementById("editor") as HTMLDivElement;
const exportTarget = document.getElementById("tabs") as TabBar;
exportTarget.addEventListener("MDCTabBar:activated", (e) => {
  const event = e as CustomEvent;
  const tab = event.detail.index as number;
  let value = ExportTarget.SVG;
  if (tab === 0) {
    value = ExportTarget.SVG;
    editor.setOption("mode", "xml");
  }
  parent.postMessage({ pluginMessage: { type: "export-type", value } }, "*");
});

const editor = CodeMirror.fromTextArea(editorElem, {
  theme: "material",
  lineNumbers: true,
  readonly: true,
  lineWrapping: true,
});

editor.setSize("100%", "100%");

onmessage = (event) => {
  const message = event.data.pluginMessage;
  if (message.type === "set-code") {
    editor.setValue(message.code);
    editor.setSize("100%", "100%");
  }
};
