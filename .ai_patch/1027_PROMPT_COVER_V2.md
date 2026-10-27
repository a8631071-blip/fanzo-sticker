# 1027V2｜公開 Prompt 代表圖與版本標示修正

## 基底
- GitHub 儲存庫：`a8631071-blip/fanzo-sticker`
- 正式基底：`main` commit `c3b2476d7577765f2fb110d5a128a89113419f75`
- 修正分支：`fix/prompt-cover-1027V2`

## 修改項目
- 新增 `assets/products/prompt-generator-1027V2.jpg`，512 × 512，源自使用者在本次對話選定的新代表圖：PROMPT 指令文字卡片 → AI → 貼圖母圖。
- 首頁 `index.html` 只更改 Prompt 工具卡片的 `product-art` 圖片引用，不變更首頁 3＋3＋2 卡片順序。
- `prompt/index.html` 移除右上角「公開測試版 1027V1」版本標示，頁面標題改為「靜態貼圖 Prompt 生成器｜煩躁胖子」。

## 未修改項目
- 所有 Prompt 生成、文字主題、1,200 句字庫、20 種字體風格和操作流程未修改。
- V135、V344 私人工具未修改。
- 其他七張首頁卡片、既有工具網址與功能未修改。
- 舊版 `assets/products/prompt-generator.svg` 保留作為歷史回復參考，但首頁不再引用。

## 驗收
- 圖像 `JPEG 512×512`，52,188 bytes，Git blob SHA `3405b6cab87d2676516ac81d7dc2d007ade66456`；實際檔案 Git hash 比對一致。
- GitHub 部署分支可讀取圖片，首頁圖片路徑正確。
- 首頁卡片數仍為 8 張，`prompt/index.html` 無 `1027V1` 或 `class="version"`。
- 正式 GitHub Pages 視覺驗收需在合併後進行。
