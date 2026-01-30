# 儲存庫指南

## 專案結構與模組組織
- `index.html` 與 `styles.css` 提供遊戲 UI 外框與樣式。
- `src/main.ts` 集中所有遊戲邏輯、繪圖與 UI 事件（單檔架構）。
- `dist/main.js` 是 TypeScript 編譯輸出；修改 `src/main.ts` 後需更新。
- 專案目前沒有獨立的 assets 或 tests 目錄。

## 建置、測試與開發指令
- `tsc -p tsconfig.json` — 將 `src/` 編譯到 `dist/`。
- `npx tsc -p tsconfig.json` — 不需全域安裝的同等指令。
- 直接用瀏覽器開啟 `index.html` 即可執行（不需本機伺服器）。

## 程式碼風格與命名慣例
- TypeScript 使用 `strict`；需要時補足明確型別以提升可讀性。
- 縮排為 2 個空白；避免過深巢狀並保持行長易讀。
- 變數/函式用 `camelCase`，型別用 `PascalCase`，常數用 `UPPER_SNAKE_CASE`。
- 目前風格使用分號與雙引號；請維持一致。

## 測試指引
- 尚未設定自動化測試。
- 手動冒煙測試：開啟 `index.html`，落子、確認勝負判定、點 Reset、並在各難度下測試 PvE。

## 提交與 Pull Request 指引
- Commit 訊息短而明確，常見為命令式並帶前綴（如 `Build: ...`、`Initial commit: ...`）。
- PR 請包含精簡摘要，並列出手動測試步驟。
- UI/行為改動若可行請附截圖或簡短 GIF，並確保已重建 `dist/main.js`。

## Agent 專用指引
- 其他專案細節與架構說明請參考 `CLAUDE.md`。
