//render.js

window.addEventListener("DOMContentLoaded", () => {
  window.onbeforeunload = null;

  (async () => {
    const isTransparent =
      localStorage.getItem("backgroundTransparent") === "true";
    const savedBg = window.electronAPI.loadBackgroundPath();
    function toFileUrl(path) {
      return `file://${encodeURI(path.replaceAll("\\", "/"))}`;
    }

    if (isTransparent) {
      // ✅ 투명 배경 적용
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = "transparent";
      console.log("🔲 투명 배경 복원됨");
    } else if (savedBg) {
      // ✅ 커스텀 배경 적용
      document.body.style.backgroundImage = `url("${toFileUrl(savedBg)}")`;
      document.body.style.backgroundColor = ""; // 혹시 이전에 투명 설정된 것 제거
      console.log("🔁 복원된 배경:", savedBg);
    } else {
      // ✅ 기본 배경 적용
      const userDataPath = await window.electronAPI.getUserDataPath?.();
      const fallbackBg = toFileUrl(
        `${userDataPath.replaceAll("\\", "/")}/background.png`
      );
      document.body.style.backgroundImage = `url("${fallbackBg}")`;
      document.body.style.backgroundColor = "";
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

  document.querySelector(".min-btn").addEventListener("click", () => {
    window.electronAPI.windowControl("minimize");
  });

  function toFileUrl(path) {
    return `file://${encodeURI(path.replaceAll("\\", "/"))}`;
  }

  function showLoading(message = "Saving...") {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingText = document.getElementById("loadingText");

    loadingText.textContent = message;
    loadingOverlay.classList.remove("hidden");
  }
  function hideLoading() {
    document.getElementById("loadingOverlay").classList.add("hidden");
  }
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
      return true; // ✅ 저장 성공
    } else {
      console.error("❌ 저장 실패");
      return false; // ✅ 저장 실패
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
    const isWriting =
      document.querySelector(".writing").style.display !== "none";
    const hasContent = memo.value.trim() !== "";
    const isNewNote = fileLabel.textContent === "new note";

    if (isWriting && (hasContent || !isNewNote)) {
      const { response } = await window.electronAPI.showConfirmDialog(
        "저장하지 않은 변경사항이 있습니다. 저장하고 열까요?"
      );
      if (response === 0) {
        // 저장하고 계속하기
        showLoading(); // 🔥 로딩 표시
        const result = await handleSave();
        if (response === 0) {
          // 0 = 저장하고 열기
          showLoading("Saving..."); // 🔥 저장 중 표시
          const result = await handleSave();
          if (result) {
            showLoading("열 파일을 선택해주세요!"); // 🔥 저장 끝나면 문구 변경
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 2초 기다림
            const fileResult = await window.electronAPI.load();
            if (fileResult) {
              const { content, filename, filepath } = fileResult;
              memo.value = content;
              fileLabel.textContent = filename;
              fileLabel.title = filename;
              currentFilePath = filepath;
              showWriting();
            }
            hideLoading(); // 레이어 끄기
          }
        }
        if (!result) {
          console.error("❌ 저장 실패. 파일을 열지 않습니다.");
          return; // 저장 실패 시 중단
        }
        // 저장 성공했으니 계속 진행
      } else if (response === 1) {
        // 그냥 계속하기
        // 아무것도 안 하고 파일 열기
      } else {
        // 취소
        return;
      }
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
      document.body.style.backgroundImage = `url("${finalPath}")`; // 바로 반영!
      window.electronAPI.saveBackgroundPath(newBgPath); // 경로 저장
      localStorage.removeItem("backgroundTransparent");
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
    localStorage.removeItem("backgroundTransparent");

    console.log("🆕 기본 배경 복원됨:", finalPath);
  });
  document.getElementById("transparentBtn").addEventListener("click", () => {
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "transparent";

    // ✅ transparent 상태 저장
    localStorage.setItem("backgroundTransparent", "true");
    localStorage.removeItem("backgroundImage"); // 이전 배경 경로 제거
  });
  window.electronAPI.onOpenFileFromArg((filePath) => {
    const content = window.electronAPI.readDroppedFile(filePath);
    document.querySelector("#memo").value = content;
    document.querySelector(".note-span2").textContent =
      window.electronAPI.getFileName(filePath);

    currentFilePath = filePath; // ✅ 꼭 필요함!
  });

  document.querySelector(".close-btn").addEventListener("click", async () => {
    const isWriting =
      document.querySelector(".writing").style.display !== "none";
    const hasContent = memo.value.trim() !== "";
    const isNewNote = fileLabel.textContent === "new note";

    if (isWriting && (hasContent || !isNewNote)) {
      const { response } = await window.electronAPI.showConfirmDialog();

      if (response === 0) {
        // 저장하고 닫기
        const result = await handleSave();
        if (result) {
          window.electronAPI.quitApp();
        }
      } else if (response === 1) {
        // 그냥 닫기
        window.electronAPI.quitApp();
      }
      // 취소(2번)는 아무것도 안 함
    } else {
      // 저장할 필요 없으면 바로 닫기
      window.electronAPI.quitApp();
    }
  });
});
