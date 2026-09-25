# 0926｜首頁圖像配置、英文介面與破圖修復

## 基底
- 本機工作分支：`main`。
- 基底 commit：`d97c2ca97db988b19120029712ce97b2e26d4117`（Fix homepage sticker placement and loading）。
- `origin`：`https://github.com/a8631071-blip/fanzo-sticker.git`。
- GitHub API 回報的 `main` HEAD 與本機基底相同。本次已在本機建立 commit；HTTPS push 未完成，GitHub `main` 仍停在基底 commit，沒有遠端變更。

## 修改
- 首頁 Hero 置中呈現文字與標籤，左右使用 `assets/hero/27.png`、`assets/hero/13.png`。
- 七張產品卡各自引用指定產品圖，存放於 `assets/products/`，圖文分欄以保留文字閱讀空間。
- 開源兩卡使用 `bobeia.png`（fanzo-sticker）與 `youyingmou.png`（stride-route），圖片留在卡片內並為手機版調整欄位。
- 其餘八張貼圖以旋轉裝飾放在產品標題、最近作品標題及頁尾文字區，不放外圍、不進產品卡；小螢幕依版面隱藏。
- 移除舊 V16／V17 貼圖動態插入與相關定位樣式，改用 V18 靜態配置。
- 補齊首頁英文字串；保留 PNG 圖片裡原有的中文字，依使用者決定不改圖。
- 修正 `assets/decor/chaojitaila.png` 的 PLTE 區塊 CRC 欄位；只改 4 個 CRC 位元組，調色盤與像素資料未變。

## 驗收
- `node --check assets/i18n.js`：通過。
- `git diff --check`：通過；僅有 Git 換行格式提醒。
- 首頁英文 i18n audit：通過；瀏覽器畫面中的中文字只剩語言選單內隱藏的繁中選項與使用者同意保留的圖片內文字。
- Codex 內建瀏覽器桌機及約 391 CSS px 手機視窗檢視：產品卡順序與圖片正常、頁面無橫向溢出；手機開源卡文字、圖片、MIT 標示各自留有空間。
- Codex 內建瀏覽器確認開源左卡為博杯阿 `bobeia.png`、右卡為有影某 `youyingmou.png`，圖片已成功載入，MIT 與箭頭未被覆蓋。
- 修正後 `chaojitaila.png` 可被 Pillow 解碼，Chromium `naturalWidth` 為 120；原本 HTTP 200 但 Chromium 因 PLTE CRC 錯誤拒絕顯示。
- 本機 `main` 基底與 GitHub `main` SHA 相同。GitHub Pages 實際部署狀態未能透過本次可用的唯讀連線確認；不可據此宣稱公開網站已使用本次本機修改。

## 未修改／交付狀態
- 原始 `圖卡/` 資料夾保留未動。
- 本機 commit 已建立，但尚未 push；GitHub 遠端沒有收到本次檔案。原始 `圖卡/` 未納入 commit。
- 預覽頁留在 Codex 內建瀏覽器的 Open Source 區，沒有操作外部瀏覽器。
