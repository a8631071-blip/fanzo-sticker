# 0820 ZIP 下載相容修正｜0820V23

## 基底版本
- 公開貼圖工具：`sticker/index.html` 0711V22。
- 共用語言層：`assets/i18n.js`，保留原有中英切換功能，僅在檔尾追加 `/sticker/` 專用相容層。
- 公開網站：GitHub Pages / `main`。

## 修改項目
- 修正「分割＋打包」頁的 `stickers.zip` 下載出口，針對 Threads／Instagram／Facebook 等 App 內建瀏覽器增加相容流程。
- 切割完成後背景預先建立 ZIP，避免等到按下載時才非同步生成，降低 WebView 因失去使用者手勢而阻擋分享／下載的機率。
- 內建瀏覽器若支援 Web Share 檔案分享，優先呼叫系統分享面板；不支援時保留 FileSaver，並再提供原生 `<a download>` fallback。
- 新增下載狀態與錯誤訊息；若內建瀏覽器仍禁止檔案輸出，明確提示使用右上角「在瀏覽器中開啟」。
- 起始編號、2／3 碼、Main、Tab 或切割結果改變時，舊 ZIP 快取會失效並重建，避免下載到舊內容。
- 公開版頁首更新日期由相容層顯示為 `2026/08/20`。
- 相容層只在 URL 路徑包含 `/sticker/` 且存在 `#btn-download` 時啟用；首頁、上架檢查、QR、素材拼板不執行此修正。

## 未修改項目
- 不修改 `sticker/index.html` 既有去 Gemini 浮水印核心。
- 不修改傳統去背、魔術棒去背、切割線、裁邊、母圖位置、成品排版與尺寸邏輯。
- 不修改 PNG 檔名規則、`main.png` 240×240、`tab.png` 96×74 與 ZIP 內檔案結構。
- 不修改「去 Gemini 浮水印」頁的批次 ZIP 流程；本次只針對使用者回報的第 4 步「分割＋打包」下載 ZIP。
- 不修改其他公開工具功能。
- 不修改 MIT License；專案原本已是開放原始碼，授權維持 MIT。

## 反方審查與風險
- 純前端無法強制突破 App WebView 的下載政策；若 WebView 同時不支援檔案分享與 Blob 下載，只能引導使用者改用系統瀏覽器。因此本次不是宣稱「所有 App 一定可直接下載」，而是增加成功路徑與明確 fallback。
- JSZip 與 FileSaver 仍沿用既有 CDN。FileSaver 載入失敗時已可回退原生下載；但 JSZip 若 CDN 本身載入失敗，仍無法建立 ZIP。本次不把第三方套件本地化，避免把單一下載相容修正擴成供應鏈／授權檔案重整。
- 相容層採後載入覆寫既有 `downloadZip` 的方式，不刪除原函式；若需緊急回復，只要移除 `assets/i18n.js` 尾端 0820V23 區塊即可。

## 驗收紀錄
- 0820V23 相容層已用 `node --check` 通過 JavaScript 語法檢查。
- 沙盒測試以模擬 Threads UA、Web Share files、JSZip 與單張 PNG 驗證：
  - 2 碼／起始 1 → `01.png`。
  - 3 碼 → `001.png`。
  - 起始 5＋3 碼 → `005.png`。
  - Threads UA 且支援 Web Share files → 走系統分享分支。
- 真實 Threads WebView 的下載政策仍需實機最終驗收；沙盒無法等同使用者手機上的 Threads WebView。
