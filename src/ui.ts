import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";

const editorElem = document.getElementById("editor") as HTMLDivElement;
var editor = CodeMirror.fromTextArea(editorElem, {
  theme: "material",
  lineNumbers: true,
  readonly: true,
});

editor.setValue(`console.log("Hello, world");`);
editor.setSize("100%", "100%");
