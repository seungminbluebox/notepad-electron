# ✍️ Notepad Advance

감성적인 디자인을 입힌 Electron 메모장  
배경 설정, 저장 상태 표시, 드래그 앤 드롭, 자동 업데이트까지 지원하는 고급 메모장입니다.

![스크린샷](./image/preview.png)

---

## ✨ 주요 기능

- 🎨 배경 설정
  - 투명 배경
  - 커스텀 이미지 배경
  - 기본 종이 질감 배경
- 📂 파일 기능
  - 새 파일 만들기 (`Ctrl+N`)
  - 파일 열기 (`Ctrl+O`)
  - 저장 및 덮어쓰기 (`Ctrl+S`)
  - .txt 파일만 허용
- 🔀 UX 반응형 상태
  - 작성 중: ✏️ Writing...
  - 저장 완료: 💾 Saved!
  - 긴 파일 이름은 `...` 처리 + 툴팁에 전체 경로 표시
- 📦 드래그 앤 드롭 지원
  - 텍스트 파일을 창으로 끌어다 놓으면 자동으로 불러오기
- 🔒 사용자 보호 기능
  - 저장하지 않고 종료 시 저장 여부 확인
  - 저장하지 않고 다른 파일 열 때도 저장 여부 확인
  - 탐색기 연속 팝업 UX 구성 + overlay 텍스트 표시
- 🪟 창 UI
  - Electron 기본 타이틀바 제거
  - 감성 스타일의 닫기/최소화 버튼 제공
- 🔄 자동 업데이트
  - GitHub Release 연동으로 새 버전 자동 알림 및 재시작 적용

---

## 🛠 기술 스택

- [Electron](https://www.electronjs.org/) ^35.x
- [electron-builder](https://www.electron.build/)
- [electron-updater](https://www.electron.build/auto-update)
- 디자인: [Figma](https://figma.com/)
- 언어: JavaScript (ES6+)

---

## 🚀 설치 및 실행

```bash
git clone https://github.com/your-username/notepad-advance.git
cd notepad-advance
npm install
```

### ▶️ 개발 모드 실행

```bash
npm start
```

### 📦 배포용 앱 빌드

```bash
npm run build
```

빌드 결과는 `dist/` 폴더에 `.exe` 형식으로 생성됩니다.

---

## 📁 프로젝트 구조 요약

```bash
📁 image/              # 배경 이미지, 버튼 아이콘 등 리소스
├── background.png     # 사용자 설정 배경 (userData로 복사됨)
├── defaultBG.jpg      # 기본 종이 질감 배경
📁 renderer/
├── index.html         # 메인 HTML
├── style.css          # 감성 UI 스타일
├── render.js          # 렌더러 기능 구현
main.js                # 앱 메인 프로세스
preload.js             # 안전한 API 전달
package.json           # 프로젝트 설정 및 빌드 스크립트
```

---


## 📄 라이선스

MIT License

---

## 🙋‍♀️ 개발자

- [승민](https://github.com/seungminbluebox) – 개발 / 디자인 / 기획

---
