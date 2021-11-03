// import * as monaco from "monaco-editor";

const createBtn = document.getElementById("create")! as HTMLButtonElement;
const textBox = document.getElementById("count")! as HTMLInputElement;
createBtn.onclick = () => {
  const count = parseInt(textBox.value, 10);
  parent.postMessage(
    { pluginMessage: { type: "create-rectangles", count } },
    "*"
  );
};

const cancelBtn = document.getElementById("cancel")! as HTMLButtonElement;
cancelBtn.onclick = () => {
  parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
};
