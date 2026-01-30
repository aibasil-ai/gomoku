# CLAUDE.md

本檔案為 Claude Code (claude.ai/code) 在此專案中工作時提供指引。

## 建置指令

```bash
# 編譯 TypeScript
tsc -p tsconfig.json
# 或透過 npx
npx tsc -p tsconfig.json
```

編譯輸出至 `dist/main.js`。

## 執行應用程式

直接在瀏覽器開啟 `index.html`，無需伺服器。

## 架構

這是一個使用 TypeScript 和 HTML5 Canvas 建構的雙人五子棋遊戲。

**單檔架構**：所有遊戲邏輯皆在 `src/main.ts`：
- **狀態**：全域變數（`board`、`currentPlayer`、`gameOver`、`lastMove`、`moveCount`）
- **繪製**：Canvas 繪圖，每次變更時 `drawBoard()` 重繪整個畫面
- **遊戲邏輯**：`handleMove()` 處理回合，`checkWin()` 檢測勝利（任意方向連成五子）
- **事件處理**：Canvas 點擊事件，自動對齊棋盤格點

**常數**：15x15 棋盤、560px 畫布、28px 邊距。星位於 [3, 7, 11] 位置。

**玩家表示**：0=空、1=黑子、2=白子。

**介面**：繁體中文介面。狀態面板顯示目前玩家或遊戲結果。重新開始按鈕清空棋盤。
