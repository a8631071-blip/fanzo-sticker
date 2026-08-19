# 煩躁胖子・LINE 創作者免費開源工具
# Fanzo Sticker — Free Open-Source Tools for LINE Creators

一套為 LINE 貼圖／表情貼創作者整理的免費瀏覽器工具組，將常見的圖片前處理、上架前檢查、QR Code 產生，以及素材拼板與自由排列集中在同一個公開網站中。

A free browser-based toolkit for LINE sticker and emoji creators. It brings common image preparation, pre-publish checking, QR-code generation, and collage/free-layout workflows together in one public website.

**免費使用｜Free to use**  
**開放原始碼｜Open source**  
**MIT License**

> **素材拼板 2.0**：保留制式格快速拼板，新增自由排列、圖片拖曳／縮放／旋轉與基礎文字功能。

## 線上使用｜Live Demo

**https://a8631071-blip.github.io/fanzo-sticker/**

不需要安裝桌面軟體，直接開啟網頁即可使用各項工具。

No desktop installation is required. Open the website and use the tools directly in your browser.

如果不想透過公開網站使用，也可以把整套專案下載回電腦，直接在本機瀏覽器執行。核心圖片處理在本機完成，不需要把貼圖素材上傳到本專案的伺服器。

If you prefer not to use the public website, you can download the full project and run it locally in your browser. Core image processing is performed on your device, and sticker assets do not need to be uploaded to this project's server.

---

## 專案目的｜Why This Project Exists

這個專案不是為了做一套大型影像編輯器，而是把 LINE 創作者工作流程中經常重複的步驟拆成簡單、直接的工具。

實際製作貼圖時，常需要在不同軟體之間切換：去背、切格、整理檔名、檢查尺寸與數量、製作 QR Code、重新排列素材與製作簡單宣傳圖。這個專案的目標，就是把這些高頻工作集中到一個容易使用的瀏覽器工作站。

This project is not intended to become a full-scale image editor. Its purpose is to turn repetitive steps in a LINE creator workflow into small, direct tools.

Sticker production often requires switching between multiple applications for background removal, slicing, file naming, size/count checks, QR-code creation, asset rearrangement, and simple promotional layouts. This project brings those high-frequency tasks into one lightweight browser workspace.

---

## 目前包含的工具｜Included Tools

### 01. 去背・切割一站搞定｜Background Removal & Sticker Slicing

路徑 / Path: `/sticker/`

**用途：** 處理貼圖素材前置作業，包含去背、切格、LINE 上架檔名整理與 ZIP 打包等流程。

**Use case:** Prepare sticker artwork with background removal, grid slicing, LINE-ready filename organization, and ZIP packaging workflows.

適合需要一次處理多張素材、降低重複手工作業的創作者。

Designed for creators who need to process multiple assets and reduce repetitive manual work.

**行動瀏覽器相容性：** Threads／Instagram／Facebook 等 App 內建瀏覽器可能限制 Blob ZIP 下載。第 4 步「分割＋打包」會預先建立 ZIP，支援檔案分享時優先開啟系統分享；若內建瀏覽器仍禁止檔案輸出，頁面會提示改用 App 選單的「在瀏覽器中開啟」後下載。

**Mobile browser compatibility:** In-app browsers such as Threads, Instagram, and Facebook may restrict Blob ZIP downloads. Step 4 pre-builds the ZIP and prefers the system file-share sheet when supported. If the in-app browser still blocks file output, the page prompts the user to open it in the device browser and download there.

### 02. LINE 上架檔案檢查｜LINE Pre-Publish File Check

路徑 / Path: `/line-check/`

**用途：** 在送交 LINE Creators Market 前，快速檢查圖片或 ZIP 中的尺寸、數量與視覺內容。

**Use case:** Review images or ZIP packages before submitting them to LINE Creators Market, including quick checks for dimensions, counts, and visual content.

此工具以「上架前最後確認」為核心，不取代官方審核規則。

This tool is intended as a final pre-publish review step and does not replace LINE's official review requirements.

### 03. 自製 QR Code 神器｜QR Code Generator

路徑 / Path: `/qr/`

**用途：** 將網址轉成 QR Code，並支援製作可直接用於宣傳素材的 QR 圖像。

**Use case:** Convert URLs into QR codes and create QR graphics that can be used in promotional materials.

### 04. 素材拼板 2.0｜Asset Collage 2.0

路徑 / Path: `/collage/`

**用途：** 可選擇制式格排列或自由排列。制式格適合快速批次拼板；自由排列可拖曳、等比縮放、旋轉圖片，加入基礎文字，並調整畫布比例與背景後匯出 PNG。

**Use case:** Choose between fixed-grid and free-layout workflows. Fixed grids are suited to fast batch boards, while free layout supports image dragging, proportional scaling, rotation, basic text, canvas ratio/background adjustments, and PNG export.

---

## 專案特色｜Key Features

- **免費使用｜Free to use** — 公開網站可直接使用，不需要安裝專用程式。
- **本機使用｜Run locally** — 可下載整套專案後直接用本機瀏覽器執行，核心圖片處理不需要把素材上傳到本專案的伺服器。
- **開放原始碼｜Open source** — 專案原始碼公開於 GitHub。
- **MIT License** — 允許使用、修改、再散布與商業使用，但須保留原授權聲明。
- **瀏覽器工作流程｜Browser workflow** — 核心工具以 HTML / CSS / JavaScript 為主，可直接透過 GitHub Pages 使用。
- **針對 LINE Creator 工作流程｜Built for LINE creator workflows** — 功能源自實際貼圖製作流程，而不是一般用途的影像編輯器。
- **單一入口｜One workspace** — 四套工具集中在同一個首頁，減少在不同服務之間切換。
- **持續維護｜Actively maintained** — 專案依實際使用需求持續調整與擴充。

---

## 隱私與資料處理｜Privacy & Data Processing

核心圖片處理流程主要在使用者瀏覽器中執行，因此多數圖片操作不需要先上傳到自建後端伺服器。若將專案下載到電腦後以本機瀏覽器執行，核心圖片素材同樣在本機處理，不需要上傳到本專案的伺服器。

Core image-processing workflows are primarily executed in the user's browser, so most image operations do not require uploading files to a custom backend server first. When the project is downloaded and run locally in a browser, core image assets are likewise processed on the user's device and do not need to be uploaded to this project's server.

但本網站仍可能載入第三方資源，例如 JavaScript 函式庫、字型、訪客統計服務或 LINE 圖片資源。這些第三方服務各自適用其服務與隱私條款。

The site may still load third-party resources such as JavaScript libraries, fonts, visitor-count services, or LINE-hosted images. Those external services are subject to their own terms and privacy policies.

---

## 專案結構｜Project Structure

```text
/
├─ index.html          # 工具首頁 / Main tool portal
├─ sticker/            # 去背與切割 / Background removal & slicing
├─ line-check/         # LINE 上架前檢查 / Pre-publish checking
├─ qr/                 # QR Code 產生器 / QR Code generator
├─ collage/            # 素材拼板 2.0 / Asset Collage 2.0
├─ assets/             # 首頁與共用素材 / Shared homepage assets
├─ LICENSE             # MIT License
└─ README.md
```

GitHub Pages 直接以 repository 根目錄部署，不需要額外後端服務。

The GitHub Pages site is deployed directly from the repository structure and does not require a separate application backend for the main tool pages.

---

## 維護狀態｜Maintenance Status

**Status: Active maintenance / 持續維護中**

此專案持續依 LINE 創作者實際工作流程更新，包括工具操作、版面、檔案處理流程與上架前檢查需求。

This project is actively maintained based on real LINE creator workflows, including tool behavior, UI improvements, file-processing flows, and pre-publish checking needs.

GitHub commit history 保留了專案從單一工具逐步發展為四合一工作站的維護紀錄。

The GitHub commit history documents the project's continued development from individual utilities into a four-tool creator workspace.

---

## 使用與貢獻｜Usage & Contributing

你可以直接使用線上版本，也可以 Fork / Clone repository 後自行修改。

You can use the live website directly, or fork/clone the repository and modify it for your own workflow.

如果發現問題或有功能建議，可透過 GitHub Issues 提出。Pull Requests 也歡迎，但建議清楚描述：

If you find a bug or have a feature suggestion, please use GitHub Issues. Pull Requests are also welcome; when submitting a PR, please describe:

- 修改目的 / Purpose of the change
- 影響的工具或頁面 / Affected tool or page
- 是否改變現有輸出或操作流程 / Whether existing output or workflow changes
- 測試方式 / How the change was tested

---

## 如果這個專案有幫助｜If This Project Helps You

如果這些工具對你的 LINE 創作流程有幫助，可以在 GitHub 點一顆 **Star**，讓更多創作者找到這個專案。

If these tools help your LINE creator workflow, you can give the repository a **Star** on GitHub so more creators can discover the project.

---

## 授權｜License

本專案採用 **MIT License**。完整條款請見 [`LICENSE`](LICENSE)。

This project is licensed under the **MIT License**. See [`LICENSE`](LICENSE) for the full license text.

第三方函式庫、字型與其他外部資源仍依其各自原始授權條款使用；本專案的 MIT License 不會取代第三方元件原本的授權。

Third-party libraries, fonts, and external assets remain subject to their original licenses. This project's MIT License does not replace the licenses of third-party components.

---

## 維護者｜Maintainer

GitHub: **[@a8631071-blip](https://github.com/a8631071-blip)**

Repository: **https://github.com/a8631071-blip/fanzo-sticker**

本專案為獨立維護的創作者工具，並非 LINE 官方產品。

This is an independently maintained creator tool project and is not an official LINE product.
