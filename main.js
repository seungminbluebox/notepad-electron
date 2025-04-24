//main.js

const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1700, //800
    height: 1000,
    frame: false, // 👈 기본 윈도우 타이틀 바 제거

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      icon: path.join(__dirname, "image", "icon.ico"), // 👈 여기에 아이콘 경로 지정
      nodeIntegration: false, // ✅ 반드시 false!
      enableRemoteModule: false, // ✅ 보안상 필요 없음
      sandbox: false, // ⚠️ 한글 경로 대응 가능, 단 보안상 위험 요소 있음
    },
  });
  win.setMenu(null);
  win.loadFile("index.html");
  win.webContents.openDevTools(); //개발자도구 열기
}
app.whenReady().then(() => {
  const userDataPath = app.getPath("userData");
  console.log("userDataPath", userDataPath);
  const bgImagePath = path.join(userDataPath, "background.png");
  console.log("bgImagePath", bgImagePath);

  // 만약 아직 배경 이미지가 없다면, 기본 이미지 복사
  if (!fs.existsSync(bgImagePath)) {
    const defaultBg = path.join(__dirname, "image", "defaultBG.jpg");
    console.log("defaultBg", defaultBg);
    if (fs.existsSync(defaultBg)) {
      fs.copyFileSync(defaultBg, bgImagePath);
      console.log("✅ completed to copy default background img");
      console.log("defaultBg", defaultBg);
    } else {
      console.warn("⚠️ there's no default background IMG:", defaultBg);
    }
  }

  createWindow();
});

ipcMain.handle("select-background", async () => {
  const result = await dialog.showOpenDialog({
    title: "배경 이미지 선택",
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["jpg", "png", "jpeg", "webp", "gif"] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const srcPath = result.filePaths[0];
    const destDir = app.getPath("userData");
    const destPath = path.join(destDir, "background.png");
    console.log(destPath);
    fs.copyFileSync(srcPath, destPath);
    return destPath;
  }

  return null;
});
//저장 처리
ipcMain.handle("save-dialog", async (event, content) => {
  const { filePath } = await dialog.showSaveDialog({
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });

  if (filePath) {
    fs.writeFileSync(filePath, content, "utf-8");
    return filePath;
  }

  return null;
});

//불러오기 처리
ipcMain.handle("load-dialog", async () => {
  const { filePaths } = await dialog.showOpenDialog({
    filters: [{ name: "Text Files", extensions: ["txt"] }],
    properties: ["openFile"],
  });

  if (filePaths.length > 0) {
    const fs = require("fs");
    const content = fs.readFileSync(filePaths[0], "utf-8");

    return {
      content,
      filename: path.basename(filePaths[0]),
      filepath: filePaths[0],
    };
  }

  return null;
});
//덮어쓰기
ipcMain.handle("overwrite-file", async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, "utf-8");
    return filePath;
  } catch (err) {
    console.error("❌ 덮어쓰기 실패:", err);
    return null;
  }
});
//파일 읽고 내용전달
ipcMain.on("full-file-read", (event, filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error("❌ 존재하지 않는 경로:", filePath);
    return;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  event.sender.send("full-file-ready", {
    content,
    filepath: filePath,
  });
});
ipcMain.on("window-control", (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  switch (action) {
    case "minimize":
      win.minimize();
      break;
    case "maximize":
      win.isMaximized() ? win.unmaximize() : win.maximize();
      break;
    case "close":
      win.close();
      break;
  }
});
