//render.js

window.addEventListener("DOMContentLoaded", () => {
  (async () => {
    const savedBg = window.electronAPI.loadBackgroundPath();

    function toFileUrl(path) {
      return `file://${encodeURI(path.replaceAll("\\", "/"))}`;
    }

    if (savedBg) {
      document.body.style.backgroundImage = `url("${toFileUrl(savedBg)}")`;
      console.log("🔁 복원된 배경:", savedBg);
    } else {
      const userDataPath = await window.electronAPI.getUserDataPath?.(); // 추가 필요
      const fallbackBg = toFileUrl(
        `${userDataPath.replaceAll("\\", "/")}/background.png`
      );
      document.body.style.backgroundImage = `url("${fallbackBg}")`;
      console.log("🆕 기본 배경 적용:", fallbackBg);
    }
  })();
  const saveBtn = document.querySelector(".save-1");
  const memo = document.querySelector("#memo");
  const openBtn = document.querySelector(".open-1");
  const fileLabel = document.querySelector(".note-span2");
  const newNoteBtn = document.querySelector(".new-1");
  const dropOverlay = document.querySelector(".drop-overlay");
  const settingsBtn = document.querySelector(".setting-1");
  const settingsModal = document.querySelector(".settings-modal");
  const closeBtn = document.querySelector("#closeSettings");
  // const savedBg = window.electronAPI.loadBackgroundPath();

  document.querySelector(".min-btn").addEventListener("click", () => {
    window.electronAPI.windowControl("minimize");
  });
  // document.querySelector(".max-btn").addEventListener("click", () => {
  //   window.electronAPI.windowControl("maximize");
  // });
  document.querySelector(".close-btn").addEventListener("click", () => {
    window.electronAPI.windowControl("close");
  });
  function toFileUrl(path) {
    return `file://${encodeURI(path.replaceAll("\\", "/"))}`;
  }
  // if (savedBg) {
  //   document.body.style.backgroundImage = `url("${toFileUrl(savedBg)}")`;
  //   console.log("🔁 복원된 배경:", savedBg);
  // }

  let currentFilePath = null;
  let isWritingShown = false;

  // writing! ux
  function showWriting() {
    const writing = document.querySelector(".writing");
    const saved = document.querySelector(".saved");

    saved.style.display = "none";
    writing.style.display = "block";

    // ✅ 최초 1회에만 애니메이션

    if (!isWritingShown) {
      writing.classList.add("animate");

      writing.addEventListener(
        "animationend",
        () => {
          writing.classList.remove("animate");
        },
        { once: true }
      );

      isWritingShown = true;
    }
  }
  // saved! ux
  function showSaved() {
    const writing = document.querySelector(".writing");
    const saved = document.querySelector(".saved");

    writing.style.display = "none";
    saved.style.display = "block";

    saved.classList.add("animate");

    saved.addEventListener(
      "animationend",
      () => {
        saved.classList.remove("animate");
      },
      { once: true }
    );

    // ✅ writing 애니메이션을 다시 작동할 수 있도록 초기화
    isWritingShown = false;
  }
  // 저장 기능 함수
  async function handleSave() {
    const content = memo.value;

    let filePath;
    if (currentFilePath) {
      filePath = await window.electronAPI.overwrite(currentFilePath, content);
    } else {
      filePath = await window.electronAPI.save(content);
    }

    if (filePath) {
      currentFilePath = filePath;
      const filename = window.electronAPI.getFileName(filePath); // 파일 이름 가져오기

      fileLabel.textContent = window.electronAPI.getFileName(filePath);
      fileLabel.title = filename;

      showSaved();
      console.log("save success:", filePath);
    } else {
      console.log("❌ 저장 취소됨 또는 실패함");
    }
  }
  //newNote버튼 기능 구현
  newNoteBtn.addEventListener("click", () => {
    memo.value = ""; // 텍스트 초기화
    currentFilePath = null; // 저장 파일 경로 초기화

    fileLabel.textContent = "new note"; // 상단 파일명 초기화
    fileLabel.title = "new note";

    showWriting(); // 상태 전환: Writing...
  });
  //open버튼 기능 구현
  openBtn.addEventListener("click", async () => {
    const result = await window.electronAPI.load();
    if (result) {
      const { content, filename, filepath } = result;

      memo.value = content;
      fileLabel.textContent = filename;
      fileLabel.title = filename;

      currentFilePath = filepath; // 🔥 현재 경로 저장
      showWriting(); // 📌 새 파일 불러왔으니 수정 상태

      console.log("open success:", filename);
    }
  });
  //save 버튼 기능 구현
  saveBtn.addEventListener("click", handleSave);

  // save, open, newNote 단축기 구현
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      // handleSave();
      saveBtn.click();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "o") {
      event.preventDefault();
      openBtn.click(); // 👉 open 버튼과 동일하게 동작
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "n") {
      event.preventDefault();
      newNoteBtn.click(); // 👉 new note 버튼과 동일하게 동작
    }
  });
  //글자가 적히기 시작하면 writing! 보이게
  memo.addEventListener("input", showWriting);

  //드래그앤 드롭 기능 구현
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  document.addEventListener("drop", async (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith(".txt")) {
      alert("⚠️ .txt 파일만 불러올 수 있어요!");
      return;
    }

    const filePath = window.electronAPI.getPathForFile(file);
    if (!filePath) {
      alert("❌ 이 파일은 지원되지 않습니다.");
      return;
    }

    const content = window.electronAPI.readDroppedFile(filePath);
    if (content === "") return;

    memo.value = content;
    const filename = window.electronAPI.getFileName(filePath); // 파일 이름 가져오기

    fileLabel.textContent = window.electronAPI.getFileName(filePath);
    fileLabel.title = filename;

    currentFilePath = filePath;
    showWriting();

    console.log("📥 드래그로 불러오기 완료:", file.name);
  });

  //드래그앤드롭 애니메이션 ux
  document.addEventListener("dragenter", () => {
    dropOverlay.classList.add("active");
  });
  document.addEventListener("dragleave", (e) => {
    if (e.relatedTarget === null || e.clientY <= 0) {
      dropOverlay.classList.remove("active");
    }
  });
  document.addEventListener("drop", () => {
    dropOverlay.classList.remove("active");
  });

  //setting버튼 누르면 나타나기
  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });
  //setting의 close버튼 누르면 나타나기
  closeBtn.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  //배경화면설정
  document.getElementById("bgSelectBtn").addEventListener("click", async () => {
    const newBgPath = await window.electronAPI.selectBackgroundImage(); // 복사 후 경로 반환
    if (newBgPath) {
      const finalPath = toFileUrl(newBgPath) + `?v=${Date.now()}`; // 🔥 캐시 무효화
      console.log(finalPath);
      document.body.style.backgroundImage = `url("${finalPath}")`; // 바로 반영!
      console.log("바뀐 배경화면", document.body.style.backgroundImage);
      window.electronAPI.saveBackgroundPath(newBgPath); // 경로 저장
    }
  });
  document.getElementById("defaultBg").addEventListener("click", async () => {
    // main → preload에서 getUserDataPath 노출 필요
    const userDataPath = await window.electronAPI.getUserDataPath?.();

    // fallback 경로 (복사될 위치)
    const fallbackBg = `${userDataPath.replaceAll("\\", "/")}/background.png`;

    // 👉 기본 이미지를 다시 복사해달라고 요청
    await window.electronAPI.restoreDefaultBackground?.(); // 이 함수도 preload/main에 추가 필요

    const toFileUrl = (path) => `file://${encodeURI(path)}`;
    const finalPath = toFileUrl(fallbackBg) + `?v=${Date.now()}`; // 캐시 무효화

    document.body.style.backgroundImage = `url("${finalPath}")`;
    window.electronAPI.saveBackgroundPath(fallbackBg);

    console.log("🆕 기본 배경 복원됨:", finalPath);
  });
});
