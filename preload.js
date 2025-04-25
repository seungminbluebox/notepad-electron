//preload.js

const path = require("path");
const { contextBridge, ipcRenderer, webUtils } = require("electron");
const fs = require("fs"); // 반드시 여기서 정의해야 함

contextBridge.exposeInMainWorld("electronAPI", {
  save: (content) => ipcRenderer.invoke("save-dialog", content),
  load: () => ipcRenderer.invoke("load-dialog"),
  overwrite: (filePath, content) =>
    ipcRenderer.invoke("overwrite-file", filePath, content),
  //저장, 드래그앤 드롭에 사용
  getFileName: (filePath) => {
    const path = require("path");
    return path.basename(filePath);
  },
  //드래그앤드롭에 사용
  readDroppedFile: (filePath) => {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (e) {
      console.error("❌ 읽기 실패:", e);
      return "";
    }
  },
  //드래그앤드롭에 사용
  getPathForFile: (file) => webUtils.getPathForFile(file),
  //배경화면
  selectBackgroundImage: () => ipcRenderer.invoke("select-background"),
  saveBackgroundPath: (path) => localStorage.setItem("backgroundImage", path),
  loadBackgroundPath: () => localStorage.getItem("backgroundImage"),
  windowControl: (action) => ipcRenderer.send("window-control", action),
  getUserDataPath: () => ipcRenderer.invoke("get-user-data-path"),
  restoreDefaultBackground: () =>
    ipcRenderer.invoke("restore-default-background"),
  onOpenFileFromArg: (callback) =>
    ipcRenderer.on("open-file-from-arg", (event, filePath) => {
      callback(filePath);
    }),
});
