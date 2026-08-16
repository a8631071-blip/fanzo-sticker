(function () {
  'use strict';

  const STORAGE_KEY = 'fanzo-language';
  const SUPPORTED = ['zh-TW', 'en'];
  const DEFAULT_LANGUAGE = 'zh-TW';
  const nodeSources = new WeakMap();
  const attrSources = new WeakMap();
  let currentLanguage = resolveInitialLanguage();
  let translating = false;

  const MESSAGES = {
    'common.language': ['語言', 'Language'],
    'common.start': ['開始使用', 'Open tool'],
    'common.previous': ['上一頁', 'Previous'],
    'common.next': ['下一頁', 'Next'],
    'common.clear': ['清空', 'Clear'],
    'common.custom': ['自訂', 'Custom'],
    'common.none': ['未選取', 'None selected'],
    'common.image': ['圖片', 'Image'],
    'common.text': ['文字', 'Text'],
    'common.source': ['來源', 'Source'],
    'common.filename': ['檔名', 'Filename'],
    'common.size': ['尺寸', 'Size'],
    'common.format': ['格式', 'Format'],
    'common.fileSize': ['檔案大小', 'File size'],
    'common.yes': ['有', 'Yes'],
    'common.no': ['無', 'No'],
    'common.frame': ['幀', 'frames'],
    'common.seconds': ['秒', 'sec'],
    'common.transparent': ['透明', 'Transparent'],
    'common.background': ['背景', 'Background'],
    'common.download': ['下載', 'Download'],
    'common.loading': ['載入中', 'Loading'],
    'common.failed': ['失敗', 'Failed'],
    'common.current': ['目前', 'Current'],

    'home.title': ['煩躁胖子｜貼圖工作站', 'Fanzo Sticker Workshop'],
    'home.description': ['貼圖去背切割、LINE 上架檔案檢查、自製 QR Code、素材拼板 2.0 與自由排列，四套工具免費使用。', 'Free tools for sticker background removal and slicing, LINE upload checks, custom QR codes, and Collage Board 2.0 with free layout.'],
    'home.hero': ['有需要，就拿去用。', 'Use what you need.'],
    'home.externalAria': ['煩躁胖子外部連結', 'Fanzo external links'],
    'home.works': ['煩躁胖子作品專區', 'Fanzo Works'],
    'home.lineWorks': ['LINE 貼圖・表情貼・主題', 'LINE stickers, emoji & themes'],
    'home.facebook': ['Facebook 粉專', 'Facebook Page'],
    'home.news': ['最新作品與消息', 'Latest works and updates'],
    'home.mp4': ['MP4 圖文影片合成器', 'MP4 Image & Text Video Composer'],
    'home.googlePlay': ['Google Play 免費下載', 'Free on Google Play'],
    'home.openSource': ['免費・開放原始碼', 'Free & Open Source'],
    'home.github': ['GitHub｜MIT License', 'GitHub | MIT License'],
    'home.tools': ['四個免費工具', 'Four Free Tools'],
    'home.toolsNote': ['需要哪個就直接點，會在新分頁開啟。', 'Choose any tool below. It opens in a new tab.'],
    'home.toolSticker': ['去背・切割一站搞定', 'Background Removal & Slicing'],
    'home.toolStickerDesc': ['去浮水印、去背、切格、上架檔名整理、ZIP 打包，一站完成。', 'Remove watermarks and backgrounds, slice images, organize upload filenames, and export a ZIP in one workflow.'],
    'home.toolCheck': ['LINE 上架檔案檢查', 'LINE Upload File Check'],
    'home.toolCheckDesc': ['上傳圖片或 ZIP，上架前快速檢查尺寸、數量與檔案。', 'Upload images or a ZIP to quickly verify dimensions, counts, and files before submission.'],
    'home.toolQr': ['自製 QR Code 神器', 'Custom QR Code Maker'],
    'home.toolQrDesc': ['網址轉 QR Code，還能自製專屬 QR 背板，完成後直接下載。', 'Turn a URL into a QR code, customize the design, and download the result.'],
    'home.toolCollage': ['素材拼板 2.0', 'Collage Board 2.0'],
    'home.toolCollageDesc': ['制式格快速拼板，也可自由拖曳、縮放、旋轉圖片與加入文字。', 'Build fast grid collages or freely drag, scale, rotate images, and add text.'],
    'home.recent': ['最近作品', 'Recent Works'],
    'home.recentNote': ['動態、靜態都有，看到喜歡的就點進去看看。', 'Animated and static releases are both included. Open any item to view it.'],
    'home.allStickers': ['看全部 LINE 貼圖', 'View all LINE stickers'],
    'home.allEmoji': ['看 LINE 表情貼', 'View LINE emoji'],
    'home.allThemes': ['看 LINE 主題', 'View LINE themes'],
    'home.viewsTitle': ['首頁累積瀏覽次數', 'Total homepage views'],
    'home.viewsAlt': ['累積瀏覽次數', 'Total views'],
    'home.footer': ['本工具免費提供使用，原始碼同步公開於 GitHub，採 MIT License 授權。', 'These tools are free to use. The source code is available on GitHub under the MIT License.'],
    'home.dynamicSticker': ['動態貼圖', 'Animated sticker'],
    'home.staticSticker': ['靜態貼圖', 'Static sticker'],
    'home.viewSticker': ['看看這組貼圖', 'View this sticker set'],
    'home.lineStore': ['前往 LINE STORE →', 'Open LINE STORE →'],

    'check.title': ['LINE 上架前自主檢查 0723V2', 'LINE Pre-Submission Check 0723V2'],
    'check.dropOverlay': ['放開即可匯入 PNG / APNG / ZIP / 資料夾', 'Drop to import PNG / APNG / ZIP / folder'],
    'check.heading': ['LINE 上架前視覺終檢台', 'LINE Final Visual Check'],
    'check.intro': ['只做上架前看圖檢查：黑／白／灰／自訂背景、40 格總覽、APNG 真播放、左欄單格放大與手動重播。不修圖、不去背、不重新輸出。', 'Visual inspection only before submission: black/white/gray/custom backgrounds, 40-item overview, real APNG playback, single-item zoom, and manual replay. No editing, background removal, or re-export.'],
    'check.importTitle': ['匯入與規格', 'Import & Specs'],
    'check.fileLabel': ['選 PNG / APNG / ZIP', 'Choose PNG / APNG / ZIP'],
    'check.folderLabel': ['選資料夾（需先解壓縮時使用）', 'Choose folder (for already-extracted files)'],
    'check.dropHint': ['整個視窗都可拖放 PNG / APNG / ZIP / 資料夾；這裡只是提示，不是唯一投放區。', 'Drop PNG / APNG / ZIP / folders anywhere in the window. This area is only a hint, not the only drop target.'],
    'check.notImported': ['尚未匯入。', 'Nothing imported yet.'],
    'check.sizeType': ['尺寸類型', 'Size preset'],
    'check.emojiPreset': ['表情貼 180×180', 'Emoji 180×180'],
    'check.staticPreset': ['靜態貼圖 370×320', 'Static sticker 370×320'],
    'check.animatedPreset': ['動態貼圖 320×270', 'Animated sticker 320×270'],
    'check.bigPreset': ['大貼圖 396×660', 'Big sticker 396×660'],
    'check.noSizeHint': ['不套尺寸提示', 'No size preset'],
    'check.sizeNote': ['尺寸只做提示；核心檢查仍是用背景切換肉眼看髒邊、殘點、白邊、黑邊、霧框。', 'The size preset is only a hint. The core check is still visual inspection against different backgrounds for dirty edges, stray pixels, white/black fringes, and haze.'],
    'check.bgTitle': ['檢查背景', 'Inspection background'],
    'check.black': ['黑底', 'Black'],
    'check.white': ['白底', 'White'],
    'check.gray': ['灰底', 'Gray'],
    'check.customColor': ['自訂色', 'Custom color'],
    'check.applyCustom': ['套用自訂色', 'Apply custom color'],
    'check.bgNote': ['背景只改檢查台顯示，不修改檔案。', 'The background only changes the checker display. It does not modify files.'],
    'check.overviewScale': ['右欄總覽比例', 'Overview scale'],
    'check.scaleNote': ['比例只改畫面顯示大小，不改原始 PNG/APNG。', 'Scale changes display size only and does not alter the original PNG/APNG.'],
    'check.singleZoom': ['單格放大', 'Single-item zoom'],
    'check.zoomMode': ['放大模式', 'Zoom mode'],
    'check.fitLeft': ['適合左欄', 'Fit left panel'],
    'check.replayItem': ['重播此張', 'Replay item'],
    'check.selectItem': ['點右欄任一格看單格放大', 'Select an item on the right to zoom in'],
    'check.footer': ['0723V2。檢查背景只鋪在圖片完整畫布內；APNG 直接用瀏覽器原生播放，可用重播按鈕重新播放；請用 Chrome / Edge 開啟本機 HTML。', '0723V2. Inspection backgrounds are applied only within the image canvas. APNG plays natively in the browser and can be restarted with the replay button. Use Chrome / Edge for local HTML.'],
    'check.overview': ['40 格總覽', '40-item overview'],
    'check.notLoaded': ['尚未載入', 'Not loaded'],
    'check.replayPage': ['本頁全部重播', 'Replay all on page'],
    'check.emptyGrid': ['載入 PNG / APNG / ZIP 後，這裡會以每頁 40 格顯示。', 'After loading PNG / APNG / ZIP files, up to 40 items per page will appear here.'],
    'check.emoji': ['表情貼', 'Emoji'],
    'check.staticSticker': ['靜態貼圖', 'Static sticker'],
    'check.animatedSticker': ['動態貼圖', 'Animated sticker'],
    'check.bigSticker': ['大貼圖', 'Big sticker'],
    'check.sizeMismatch': ['尺寸不同', 'Size mismatch'],
    'check.noAlpha': ['無透明資訊', 'No alpha info'],
    'check.alphaInfo': ['透明資訊', 'Alpha info'],
    'check.canvasTitle': ['此色塊等於圖片完整畫布，不是整個左欄預覽框。', 'This color block represents the full image canvas, not the entire left preview panel.'],
    'check.realBgWarning': ['（黑/白底檢查時要特別注意是否為實底圖）', '(Check carefully on black/white backgrounds to confirm this is not a solid-background image.)'],

    'qr.title': ['網址 QRcode 產生器 0724V3', 'URL QR Code Generator 0724V3'],
    'qr.eyebrow': ['0724V3 大膽背景圖版', '0724V3 Full-Image Bold Mode'],
    'qr.heading': ['網址 QRcode 產生器', 'URL QR Code Generator'],
    'qr.hero': ['輸入網址後立即產生透明背景 QR 圖碼。這版新增最大膽的整面背景圖模式，讓整個碼區都帶浣熊圖效果，同時保留保底版與中心圖案版。', 'Enter a URL to instantly generate a transparent QR code. This version adds a bold full-image mode across the QR area while keeping the safe plain mode and center-image mode.'],
    'qr.positioning': ['本版定位', 'Purpose'],
    'qr.positioningDesc': ['純網址、透明 PNG、單頁本機開啟，新增整面背景圖大膽模式，不含模板框架與海報合成。', 'URL-only, transparent PNG, single-page local tool with a bold full-image mode. No template frames or poster compositing.'],
    'qr.future': ['後續可擴充', 'Possible extensions'],
    'qr.futureDesc': ['框架模板、SVG 輸出、Wi-Fi / vCard 類型、批次生成、海報互動式模板、角色承載 QR。', 'Frame templates, SVG export, Wi-Fi / vCard types, batch generation, interactive poster templates, and character-based QR designs.'],
    'qr.controls': ['控制區', 'Controls'],
    'qr.controlNote': ['背景固定透明。這版多了整面背景圖模式，但仍建議保留純 QR 版本作為保底，再視情況用大膽版上稿。', 'The background stays transparent. Full-image mode is available, but keep a plain QR as a safe fallback and use the bold version only when appropriate.'],
    'qr.url': ['連結網址', 'URL'],
    'qr.urlHelp': ['若未輸入 `http://` 或 `https://`，工具會自動補上 `https://`。', 'If `http://` or `https://` is omitted, the tool automatically adds `https://`.'],
    'qr.outputSize': ['輸出尺寸', 'Output size'],
    'qr.color': ['QR 顏色', 'QR color'],
    'qr.colorAria': ['QR 顏色十六進位值', 'QR color hex value'],
    'qr.margin': ['邊界留白', 'Quiet-zone margin'],
    'qr.marginHelp': ['保留掃描安靜區。若之後要貼上海報，建議不要低於 4 格。', 'Keep a quiet zone for scanning. If the QR will be placed on a poster, use at least 4 modules.'],
    'qr.ec': ['容錯等級', 'Error correction'],
    'qr.ecHelp': ['預設 `Q`，兼顧穩定與資料量。若後續要加中心小圖，再考慮 `H`。', 'Default `Q` balances reliability and data capacity. Consider `H` when adding a center image.'],
    'qr.mode': ['輸出模式', 'Render mode'],
    'qr.plain': ['純 QR 保底版', 'Plain QR (safe)'],
    'qr.center': ['中心小浣熊版', 'Center image'],
    'qr.bold': ['整面背景圖大膽版', 'Full-image bold'],
    'qr.modeHelp': ['大膽版會把整個碼區鋪上圖，再重畫定位角與深色模組。視覺最強，但掃碼風險也最高。', 'Full-image bold mode places the image across the QR area, then redraws finder patterns and dark modules. It is the most visual but also carries the highest scanning risk.'],
    'qr.logoSize': ['中心圖案大小', 'Center image size'],
    'qr.logoHelp': ['建議先落在 12% 到 18%。太大會明顯增加掃碼風險。', 'Start around 12%–18%. Larger images noticeably increase scanning risk.'],
    'qr.strength': ['背景圖濃度', 'Background image strength'],
    'qr.strengthHelp': ['只影響整面背景圖大膽版。濃度越高，圖越明顯，但也越容易壓低辨識度。', 'Only affects full-image bold mode. Higher strength makes the image more visible but can reduce scan reliability.'],
    'qr.logo': ['中心圖案', 'Center image'],
    'qr.resetLogo': ['還原小浣熊示範圖', 'Restore sample raccoon'],
    'qr.logoNote': ['預設使用你提供的 `01.png`。建議用主體明確、留白乾淨的小圖，避免中心細節太碎。', 'The default uses `01.png`. Use a clear subject with clean negative space and avoid excessive detail in the center.'],
    'qr.generate': ['重新產生 QR', 'Regenerate QR'],
    'qr.sample': ['帶入範例網址', 'Use sample URL'],
    'qr.preview': ['預覽區', 'Preview'],
    'qr.previewNote': ['棋盤格只用來顯示透明背景，不會輸出到 PNG 檔案裡。', 'The checkerboard only indicates transparency and is not included in the PNG.'],
    'qr.previewAria': ['QR 預覽', 'QR preview'],
    'qr.filenamePreview': ['檔名預覽', 'Filename preview'],
    'qr.downloadPreview': ['下載目前預覽 PNG', 'Download current PNG'],
    'qr.hint1': ['整面背景圖版是視覺展示型模式，請優先用 `H` 容錯等級並保留純 QR 作為保底稿。', 'Full-image mode is presentation-oriented. Prefer `H` error correction and keep a plain QR as a fallback.'],
    'qr.hint2': ['若要放到淺色海報上，建議保持深色 QR 與足夠留白。', 'For light posters, keep the QR dark and preserve enough clear space.'],
    'qr.hint3': ['若內容網址很長或圖案偏大，請先做手機掃描實測再正式使用。', 'If the URL is long or the image is large, test scanning on a phone before final use.'],

    'collage.title': ['素材拼板 2.0', 'Collage Board 2.0'],
    'collage.sidebarAria': ['工作欄', 'Workspace controls'],
    'collage.brandDesc': ['制式格快速拼板，也可切換自由排列；匯出一張 PNG。', 'Build a grid quickly or switch to free layout, then export one PNG.'],
    'collage.importLayout': ['1. 匯入與排列', '1. Import & Layout'],
    'collage.importImages': ['批次匯入圖片', 'Import images'],
    'collage.openAssets': ['展開素材區', 'Open assets'],
    'collage.layoutMode': ['排列方式', 'Layout mode'],
    'collage.grid': ['制式格排列', 'Grid layout'],
    'collage.free': ['自由排列', 'Free layout'],
    'collage.fillEmpty': ['依序填入空格', 'Fill empty cells in order'],
    'collage.preset': ['版型', 'Grid preset'],
    'collage.cols': ['欄數', 'Columns'],
    'collage.rows': ['列數', 'Rows'],
    'collage.emptyMode': ['空格處理', 'Empty-cell handling'],
    'collage.keepBg': ['保留背景色', 'Keep background color'],
    'collage.cloneLast': ['匯出前複製最後一格補滿', 'Fill remaining cells with the last item on export'],
    'collage.clearBoard': ['清空版面', 'Clear board'],
    'collage.clearAssets': ['清空素材', 'Clear assets'],
    'collage.addText': ['新增文字', 'Add text'],
    'collage.freeHelp': ['點素材會加入畫布；素材與文字可直接拖曳，控制點可縮放與旋轉。', 'Click an asset to add it to the canvas. Drag images and text directly; use handles to resize and rotate.'],
    'collage.canvasBg': ['2. 畫布與背景', '2. Canvas & Background'],
    'collage.ratio': ['畫布比例', 'Canvas ratio'],
    'collage.ratioW': ['比例寬', 'Ratio width'],
    'collage.ratioH': ['比例高', 'Ratio height'],
    'collage.outputScale': ['輸出倍率', 'Output scale'],
    'collage.customScale': ['自訂倍率', 'Custom scale'],
    'collage.bgColor': ['背景色', 'Background color'],
    'collage.hex': ['色碼', 'Hex'],
    'collage.outputDimensions': ['輸出尺寸', 'Output dimensions'],
    'collage.actions': ['3. 操作與匯出', '3. Edit & Export'],
    'collage.replaceCell': ['更換目前格', 'Replace selected cell'],
    'collage.clearCell': ['清空目前格', 'Clear selected cell'],
    'collage.cloneFill': ['複製補滿', 'Clone to fill'],
    'collage.cellScaleBlock': ['格內圖片比例', 'Image scale in cells'],
    'collage.cellScale': ['單格比例（%）', 'Selected cell (%)'],
    'collage.allScale': ['共同比例（%）', 'All cells (%)'],
    'collage.currentCell': ['目前格：', 'Selected cell:'],
    'collage.filled': ['已放入：', 'Filled:'],
    'collage.gridHelp': ['點主圖板格子，再點素材即可單點更換；未選格時會填入下一個空格。', 'Select a board cell, then click an asset to replace it. With no cell selected, the next empty cell is filled.'],
    'collage.currentObject': ['目前物件：', 'Selected object:'],
    'collage.freeBoard': ['自由版面：', 'Free canvas:'],
    'collage.textContent': ['文字內容', 'Text content'],
    'collage.font': ['字型', 'Font'],
    'collage.sans': ['黑體', 'Sans-serif'],
    'collage.serif': ['明體', 'Serif'],
    'collage.mono': ['等寬', 'Monospace'],
    'collage.textSize': ['大小（%）', 'Size (%)'],
    'collage.textColor': ['文字顏色', 'Text color'],
    'collage.bold': ['粗體', 'Bold'],
    'collage.rotation': ['旋轉角度', 'Rotation'],
    'collage.front': ['置頂', 'Bring to front'],
    'collage.back': ['置底', 'Send to back'],
    'collage.delete': ['刪除選取', 'Delete selected'],
    'collage.export': ['匯出 PNG', 'Export PNG'],
    'collage.mainBoard': ['主圖板', 'Main board'],
    'collage.gridHint': ['點格子指定更換位置', 'Select a cell to choose the replacement position'],
    'collage.assets': ['素材區', 'Assets'],
    'collage.collapse': ['收合', 'Collapse'],
    'collage.assetNoteGrid': ['點素材填入目前格；未選格時依序填入空格。拖曳標題列可移動面板。', 'Click an asset to fill the selected cell; with no selection, empty cells are filled in order. Drag the title bar to move the panel.'],
    'collage.assetThumb': ['素材縮圖', 'Asset thumbnail'],
    'collage.freeCanvas': ['自由畫布', 'Free canvas'],
    'collage.freeHint': ['拖曳素材；控制點可縮放與旋轉', 'Drag assets; use handles to resize and rotate'],
    'collage.filledState': ['已放入', 'Filled'],
    'collage.emptyState': ['空白', 'Empty'],
    'collage.resizeTitle': ['拖曳縮放', 'Drag to resize'],
    'collage.rotateTitle': ['拖曳旋轉', 'Drag to rotate'],
    'collage.assetNoteFree': ['點素材加入自由畫布；可重複加入同一素材。拖曳標題列可移動面板。', 'Click an asset to add it to the free canvas; the same asset can be added multiple times. Drag the title bar to move the panel.'],
    'collage.defaultText': ['輸入文字', 'Enter text'],

    'sticker.pageTitle': ['LINE 免費工具｜煩躁胖子', 'Free LINE Tools | Fanzo'],
    'sticker.metaDesc': ['免費公開版工具，支援去 Gemini 浮水印、圖片去背、切成 LINE 貼圖尺寸，並打包成 ZIP。', 'Free public tool for removing Gemini watermarks, removing image backgrounds, slicing to LINE sticker sizes, and exporting ZIP files.'],
    'sticker.logo': ['煩躁胖子・免費公開版工具', 'Fanzo · Free Public Tools'],
    'sticker.hero': ['一鍵去 Gemini 浮水印、去背、切格、打包，可每頁獨立上傳、獨立打包', 'Remove Gemini Watermarks, Backgrounds, Slice & Package'],
    'sticker.heroLine1': ['免費公開版工具，可完整流程使用，也可單獨使用某一功能：', 'Use the full workflow or open any function independently:'],
    'sticker.heroLine2': ['支援 LINE 貼圖 / 表情貼 / 動態貼圖尺寸整理，可自由調整欄列、手拉切割線、裁邊、母圖位置與成品排版，並輸出 PNG ZIP、Main、Tab。', 'Supports LINE stickers, emoji, and animated-sticker sizing. Adjust rows/columns, drag cut lines, crop, reposition the source sheet, control final layout, and export PNG ZIP, Main, and Tab files.'],
    'sticker.heroLine3': ['切割預覽與 ZIP 輸出會依照目前切線及成品排版設定處理；工具免費使用，也歡迎查看我的 LINE 作品。', 'Slice previews and ZIP export follow the current cut lines and output-layout settings. The tool is free; you can also browse my LINE creations.'],
    'sticker.openTool': ['開始使用工具', 'Start tool'],
    'sticker.viewStickers': ['看 LINE 貼圖', 'LINE stickers'],
    'sticker.viewEmoji': ['看 LINE 表情貼', 'LINE emoji'],
    'sticker.viewThemes': ['看 LINE 主題', 'LINE themes'],
    'sticker.tabUpload': ['上傳', 'Upload'],
    'sticker.tabWatermark': ['去 Gemini 浮水印', 'Remove Gemini watermark'],
    'sticker.tabBg': ['去背', 'Background removal'],
    'sticker.tabSlice': ['分割＋打包', 'Slice & package'],
    'sticker.featuredStickers': ['LINE 貼圖精選', 'Featured LINE stickers'],
    'sticker.featuredEmoji': ['LINE 表情貼精選', 'Featured LINE emoji'],
    'sticker.featuredThemes': ['LINE 主題精選', 'Featured LINE themes'],
    'sticker.prevGroup': ['上一組', 'Previous set'],
    'sticker.nextGroup': ['下一組', 'Next set'],
    'sticker.uploadSheet': ['📂 上傳母圖', '📂 Upload source sheet'],
    'sticker.uploadHint': ['點擊或拖曳圖片上傳', 'Click or drag an image to upload'],
    'sticker.uploadSpec': ['支援 JPG / PNG，建議 2560×1664 px', 'Supports JPG / PNG; 2560×1664 px recommended'],
    'sticker.chooseFile': ['選擇檔案', 'Choose file'],
    'sticker.nextWatermark': ['下一步：去 Gemini 浮水印處理 →', 'Next: Remove Gemini watermark →'],
    'sticker.watermarkPrep': ['✨ 去 Gemini 浮水印前處理', '✨ Gemini watermark removal'],
    'sticker.fixedRules': ['規則固定：', 'Fixed rules:'],
    'sticker.ruleSingle': ['單張目前預覽圖：可直接下載，也可匯入去背流程。', 'Current single preview: download it directly or send it to the background-removal workflow.'],
    'sticker.ruleBatch': ['批次處理：只支援下載 ZIP，不匯入去背頁。', 'Batch processing: ZIP download only; batch results are not imported into the background-removal page.'],
    'sticker.skipWatermark': ['略過去 Gemini 浮水印，直接進入去背 →', 'Skip watermark removal and go to background removal →'],
    'sticker.imageSource': ['📂 圖片來源', '📂 Image source'],
    'sticker.imageSourceNote': ['Step 1 上傳的母圖會自動帶進來；你也可以在這裡追加更多圖片做批次去 Gemini 浮水印。', 'The source sheet from Step 1 is added automatically. You can also add more images here for batch Gemini watermark removal.'],
    'sticker.addImages': ['追加 PNG / JPG / WEBP', 'Add PNG / JPG / WEBP'],
    'sticker.batchPreviewNote': ['可多張批次；目前預覽圖可匯入去背', 'Batch supported; the current preview can be imported into background removal'],
    'sticker.addImageBtn': ['追加圖片', 'Add images'],
    'sticker.clearWatermarkList': ['清空去 Gemini 浮水印列表', 'Clear watermark-removal list'],
    'sticker.resetPosition': ['重置位置', 'Reset position'],
    'sticker.watermarkSettings': ['🎛️ 去 Gemini 浮水印設定', '🎛️ Watermark-removal settings'],
    'sticker.maskMode': ['遮罩模式', 'Mask mode'],
    'sticker.autoMask': ['自動 48 / 96', 'Auto 48 / 96'],
    'sticker.fixed48': ['固定 48', 'Fixed 48'],
    'sticker.fixed96': ['固定 96', 'Fixed 96'],
    'sticker.outputFormat': ['輸出格式', 'Output format'],
    'sticker.rightMargin': ['右邊距', 'Right margin'],
    'sticker.bottomMargin': ['下邊距', 'Bottom margin'],
    'sticker.watermarkStrength': ['去浮水印強度', 'Removal strength'],
    'sticker.maskStatus': ['遮罩狀態：', 'Mask status:'],
    'sticker.outputActions': ['🚀 輸出動作', '🚀 Output actions'],
    'sticker.processPreview': ['處理目前預覽圖', 'Process current preview'],
    'sticker.downloadResult': ['下載目前結果', 'Download current result'],
    'sticker.importBg': ['匯入去背流程', 'Send to background removal'],
    'sticker.batchZip': ['批次處理＋下載 ZIP', 'Batch process + ZIP'],
    'sticker.prevImage': ['上一張', 'Previous image'],
    'sticker.nextImage': ['下一張', 'Next image'],
    'sticker.noWatermarkImage': ['尚未載入去 Gemini 浮水印圖片', 'No watermark-removal image loaded'],
    'sticker.fileList': ['🗂️ 檔案清單', '🗂️ File list'],
    'sticker.noImage': ['尚未載入圖片。', 'No images loaded.'],
    'sticker.original': ['原圖', 'Original'],
    'sticker.afterWatermark': ['去浮水印後', 'After removal'],
    'sticker.help': ['📌 使用說明', '📌 Instructions'],
    'sticker.help1': ['1. 這裡沿用 Gemini 去 Gemini 浮水印工具的遮罩邏輯。', '1. This section uses the Gemini watermark-removal mask logic.'],
    'sticker.help2': ['2. 若只是目前這張圖要接續去背，直接按「匯入去背流程」。', '2. To continue with the current image, click “Send to background removal”.'],
    'sticker.help3': ['3. 若是多張一起處理，請用「批次處理＋下載 ZIP」，批次結果不會自動帶入去背頁。', '3. For multiple images, use “Batch process + ZIP”. Batch results are not sent to the background-removal page.'],
    'sticker.bgIndependent': ['📂 去背頁獨立上傳', '📂 Background-removal upload'],
    'sticker.bgIndependentHint': ['只想去背時，可在這裡直接上傳', 'Upload here if you only need background removal'],
    'sticker.bgIndependentNote': ['上傳後會更新雙預覽，可直接下載目前去背圖', 'Uploading updates both previews; you can directly download the current background-removed image'],
    'sticker.bgMode': ['🎨 去背模式（三選一）', '🎨 Background mode (choose one)'],
    'sticker.noBg': ['A 不去背', 'A No removal'],
    'sticker.originalOutput': ['原圖輸出', 'Original output'],
    'sticker.traditionalBg': ['B 傳統去背', 'B Traditional'],
    'sticker.traditionalOnly': ['只跑傳統', 'Traditional only'],
    'sticker.wandBg': ['C 魔術棒去背', 'C Magic wand'],
    'sticker.wandOnly': ['只跑魔術棒', 'Magic wand only'],
    'sticker.exclusiveMode': ['模式互斥：選 A 就關 B/C；選 B 只套傳統；選 C 只套魔術棒。預覽與匯出使用同一個模式。', 'Modes are mutually exclusive: A disables B/C; B runs only traditional removal; C runs only magic wand. Preview and export use the same mode.'],
    'sticker.noBgPanel': ['A｜不去背', 'A | No removal'],
    'sticker.noBgDesc': ['不套任何去背效果，分割打包時直接輸出原圖。', 'No background-removal effect is applied. Slicing and packaging use the original image.'],
    'sticker.tradParams': ['B｜傳統去背參數', 'B | Traditional parameters'],
    'sticker.green': ['🟩 綠幕', '🟩 Green screen'],
    'sticker.black': ['⬛ 黑底', '⬛ Black'],
    'sticker.white': ['⬜ 白幕', '⬜ White'],
    'sticker.completeRemoval': ['完全去背', 'Full removal'],
    'sticker.keepText': ['保留文字', 'Preserve text'],
    'sticker.targetColor': ['傳統目標顏色', 'Target color'],
    'sticker.tolerance': ['傳統容許度', 'Traditional tolerance'],
    'sticker.smoothing': ['傳統邊緣柔化', 'Traditional edge smoothing'],
    'sticker.despill': ['傳統溢色去除 Despill', 'Traditional despill'],
    'sticker.wandParams': ['C｜魔術棒去背參數', 'C | Magic-wand parameters'],
    'sticker.wandTolerance': ['魔術棒容許度', 'Magic-wand tolerance'],
    'sticker.wandSmoothing': ['魔術棒邊緣柔化', 'Magic-wand edge smoothing'],
    'sticker.wandErode': ['魔術棒清邊吃入', 'Magic-wand edge cleanup'],
    'sticker.wandDespillStrength': ['魔術棒 Despill 強度', 'Magic-wand despill strength'],
    'sticker.wandDespill': ['魔術棒溢色去除 Despill', 'Magic-wand despill'],
    'sticker.wandPicker': ['🪄 魔術棒連續選取：點整張母圖', '🪄 Magic-wand multi-select: click the full sheet'],
    'sticker.undoPoint': ['復原上一點', 'Undo last point'],
    'sticker.clearWand': ['清除魔術棒選區', 'Clear magic-wand selection'],
    'sticker.wandInitial': ['尚未選取。啟用後可在右側整張母圖連續點選多個背景區。', 'Nothing selected. Enable the tool, then click multiple background regions on the full source sheet at right.'],
    'sticker.cropZoom': ['裁切縮放（去黑邊）', 'Crop zoom (remove black edges)'],
    'sticker.refreshPreview': ['重新整理雙預覽', 'Refresh both previews'],
    'sticker.toSlice': ['匯入切割 →', 'Send to slicing →'],
    'sticker.downloadBg': ['下載目前去背圖', 'Download current background-removed image'],
    'sticker.dualPreview': ['🔍 去背雙預覽（整張母圖）', '🔍 Background-removal dual preview (full sheet)'],
    'sticker.dualPreviewStatus': ['左邊是整張傳統去背，右邊是整張魔術棒去背。魔術棒可多次點選，分割打包會吃同一張去背後工作圖。', 'Left: traditional removal for the full sheet. Right: magic-wand removal for the full sheet. The wand supports multiple clicks, and slicing/package export uses the same processed working image.'],
    'sticker.tradPreview': ['A｜傳統去背', 'A | Traditional removal'],
    'sticker.originalSheet': ['原始整張母圖', 'Original full sheet'],
    'sticker.tradResult': ['傳統結果', 'Traditional result'],
    'sticker.wandPreview': ['B｜魔術棒去背', 'B | Magic-wand removal'],
    'sticker.pickFullSheet': ['點這張整張母圖選背景', 'Click this full sheet to select the background'],
    'sticker.wandResult': ['魔術棒結果', 'Magic-wand result'],
    'sticker.sliceIndependent': ['📂 切割頁獨立上傳', '📂 Slicing-only upload'],
    'sticker.sliceIndependentHint': ['只想切格打包時，可在這裡直接上傳', 'Upload here if you only need slicing and packaging'],
    'sticker.sliceIndependentNote': ['上傳後可調整欄列、裁邊、縮放，再輸出 ZIP / Main / Tab', 'After upload, adjust rows/columns, crop, and scale, then export ZIP / Main / Tab'],
    'sticker.gridCount': ['📐 分割格數', '📐 Grid count'],
    'sticker.columns': ['欄數 (Columns)', 'Columns'],
    'sticker.rows': ['列數 (Rows)', 'Rows'],
    'sticker.sourceAdjust': ['📋 母圖調整', '📋 Source-sheet adjustment'],
    'sticker.offsetX': ['水平偏移', 'Horizontal offset'],
    'sticker.offsetY': ['垂直偏移', 'Vertical offset'],
    'sticker.scale': ['縮放', 'Scale'],
    'sticker.outputLayout': ['🧭 成品排版', '🧭 Output layout'],
    'sticker.position': ['位置', 'Position'],
    'sticker.centered': ['置中', 'Center'],
    'sticker.originalPosition': ['原位', 'Original position'],
    'sticker.ratio': ['比例', 'Scale'],
    'sticker.full': ['滿版', 'Fill'],
    'sticker.originalSize': ['原尺寸', 'Original size'],
    'sticker.outputLayoutNote': ['置中可搭配滿版、90% 或原尺寸；滿版依可見內容等比例放大，不變形、不裁切。', 'Center can be combined with Fill, 90%, or Original size. Fill scales visible content proportionally without distortion or cropping.'],
    'sticker.crop': ['✂️ 裁邊（去空白）', '✂️ Crop edges (remove blank space)'],
    'sticker.cropLeft': ['裁左', 'Left'],
    'sticker.cropRight': ['裁右', 'Right'],
    'sticker.cropTop': ['裁上', 'Top'],
    'sticker.cropBottom': ['裁下', 'Bottom'],
    'sticker.package': ['📦 打包設定', '📦 Package settings'],
    'sticker.finalSize': ['完成尺寸：', 'Final size:'],
    'sticker.sticker': ['貼圖', 'Sticker'],
    'sticker.emoji': ['表情貼', 'Emoji'],
    'sticker.filenameDigits': ['檔名碼數：', 'Filename digits:'],
    'sticker.twoDigits': ['2碼', '2 digits'],
    'sticker.threeDigits': ['3碼', '3 digits'],
    'sticker.startNumber': ['起始編號：', 'Start number:'],
    'sticker.startProcess': ['✂️ 開始切割＋打包', '✂️ Slice + package'],
    'sticker.downloadZip': ['⬇️ 下載 ZIP', '⬇️ Download ZIP'],
    'sticker.backBg': ['← 回去背預覽', '← Back to background preview'],
    'sticker.reupload': ['🔄 重新上傳', '🔄 Upload again'],
    'sticker.gridPreview': ['🗺️ 格線預覽', '🗺️ Grid preview'],
    'sticker.dragCutLine': ['可直接拖拉橘色切線', 'Drag orange cut lines directly'],
    'sticker.resetCutLine': ['重置切線', 'Reset cut lines'],
    'sticker.slicePreview': ['✂️ 切割預覽（目前去背結果）', '✂️ Slice preview (current background-removal result)'],
    'sticker.autoUpdate': ['調整設定後自動更新', 'Updates automatically after settings change'],
    'sticker.bgResult': ['✅ 去背結果', '✅ Result'],
    'sticker.processing': ['處理中...', 'Processing...'],
  };

  const exactMap = new Map();
  Object.entries(MESSAGES).forEach(([key, pair]) => {
    exactMap.set(normalize(pair[0]), { key, en: pair[1] });
  });

  const PATTERNS = [
    [/^第 (\d+) \/ (\d+) 頁$/, (_, a, b) => `Page ${a} / ${b}`],
    [/^第 (\d+) 頁$/, (_, a) => `Page ${a}`],
    [/^第 (\d+) 組$/, (_, a) => `Set ${a}`],
    [/^第 (\d+) 格$/, (_, a) => `Cell ${a}`],
    [/^(\d+) 張$/, (_, a) => `${a} item${a === '1' ? '' : 's'}`],
    [/^(\d+) 個物件$/, (_, a) => `${a} object${a === '1' ? '' : 's'}`],
    [/^共 (\d+) 張｜每頁 40 格｜總覽 (\d+)%$/, (_, a, b) => `${a} items | 40 per page | Overview ${b}%`],
    [/^收到 (\d+) 個項目，正在篩選 PNG \/ APNG \/ ZIP\.\.\.$/, (_, a) => `Received ${a} items. Filtering PNG / APNG / ZIP...`],
    [/^收到 (\d+) 個項目，但可匯入數量為 0。$/, (_, a) => `Received ${a} items, but 0 can be imported.`],
    [/^準備匯入：PNG\/APNG (\d+) 個，ZIP (\d+) 個。$/, (_, a, b) => `Ready to import: ${a} PNG/APNG, ${b} ZIP.`],
    [/^匯入完成：新增 (\d+) 張，目前共 (\d+) 張。( 有警告，請看右欄上方。)?$/, (_, a, b, warn) => `Import complete: ${a} added, ${b} total.${warn ? ' Warnings are shown above the right panel.' : ''}`],
    [/^正在解壓 (.+)：找到 (\d+) 張 PNG\/APNG\.\.\.$/, (_, name, count) => `Extracting ${name}: found ${count} PNG/APNG...`],
    [/^(.+) 載入失敗：(.+)$/, (_, name, err) => `${name} failed to load: ${err}`],
    [/^(.+) ZIP 載入失敗：(.+)$/, (_, name, err) => `${name} ZIP failed to load: ${err}`],
    [/^(.+) 內沒有 PNG \/ APNG。$/, (_, name) => `${name} contains no PNG / APNG files.`],
    [/^(.+) ZIP local header 異常，已跳過。$/, (_, name) => `${name} has an invalid ZIP local header and was skipped.`],
    [/^(.+) 使用 ZIP 壓縮方式 (\d+)，瀏覽器版暫不解。$/, (_, name, method) => `${name} uses ZIP compression method ${method}, which is not supported in this browser version.`],
    [/^(\d+) 格$/, (_, n) => `${n} modules`],
    [/^目前選 (.+)$/, (_, x) => `Current preset: ${x}`],
    [/^（目前選 (.+)）$/, (_, x) => `(Current preset: ${x})`],
    [/^約 ([\d.]+) 秒$/, (_, n) => `about ${n} sec`],
    [/^(\d+) 幀$/, (_, n) => `${n} frames`],
    [/^已載入 (\d+) 張去 Gemini 浮水印圖片$/, (_, n) => `Loaded ${n} images for Gemini watermark removal`],
    [/^批次處理中 (\d+)\/(\d+)$/, (_, a, b) => `Batch processing ${a}/${b}`],
    [/^新增魔術棒點：x=(\d+), y=(\d+)。目前共 (\d+) 點，可繼續點選。$/, (_, x, y, n) => `Added magic-wand point: x=${x}, y=${y}. ${n} points total; you can keep selecting.`],
    [/^已復原上一點，剩 (\d+) 個魔術棒點。$/, (_, n) => `Last point undone. ${n} magic-wand points remain.`],
    [/^已累積 (\d+) 個魔術棒點，選取約 (\d+) px。清邊 (\d+)px，Despill (.+)。$/, (_, n, px, edge, despill) => `${n} magic-wand points accumulated; about ${px} px selected. Edge cleanup ${edge}px, Despill ${despill}.`],
    [/^格(\d+)｜(.+)｜自訂切線$/, (_, n, layout) => `Cell ${n} | ${layout} | Custom cuts`],
    [/^格(\d+)｜(.+)｜平均切線$/, (_, n, layout) => `Cell ${n} | ${layout} | Even cuts`],
    [/^處理中 (\d+) \/ (\d+)$/, (_, a, b) => `Processing ${a} / ${b}`],
    [/^拖拉第 (\d+) 條直切線中\.\.\.$/, (_, n) => `Dragging vertical cut line ${n}...`],
    [/^拖拉第 (\d+) 條橫切線中\.\.\.$/, (_, n) => `Dragging horizontal cut line ${n}...`],
    [/^已取樣 (#[0-9A-F]{6})（x=(\d+), y=(\d+)），並已更新目標顏色 \/ 容許度。$/, (_, hex, x, y) => `Sampled ${hex} (x=${x}, y=${y}) and updated target color / tolerance.`],
  ];

  const EXACT_DYNAMIC = new Map([
    ['已清空。', 'Cleared.'],
    ['沒有收到檔案。', 'No files received.'],
    ['沒有找到 PNG / APNG / ZIP。若你拖的是資料夾，請確認裡面有 .png；若你選的是壓縮檔，副檔名必須是 .zip。', 'No PNG / APNG / ZIP found. If you dropped a folder, make sure it contains .png files. If you selected an archive, its extension must be .zip.'],
    ['不是有效 PNG', 'Not a valid PNG'],
    ['找不到 ZIP 目錄', 'ZIP directory not found'],
    ['這個瀏覽器不支援 ZIP deflate 解壓，請用 Chrome / Edge 新版。', 'This browser does not support ZIP deflate decompression. Use a recent Chrome / Edge version.'],
    ['請先輸入網址。', 'Enter a URL first.'],
    ['網址格式無效，請檢查後再產生。', 'The URL is invalid. Check it and try again.'],
    ['圖案素材載入失敗，已先輸出純 QR。', 'Image asset failed to load. A plain QR was generated instead.'],
    ['圖案素材尚未載入完成，已先輸出純 QR。', 'Image asset is still loading. A plain QR was generated for now.'],
    ['已輸出整面背景圖大膽版。這版以視覺展示優先，請務必再做手機掃碼實測。', 'Full-image bold QR generated. This mode prioritizes appearance; test it with a phone before use.'],
    ['QR 產生完成，可直接下載透明 PNG。', 'QR generated. You can download the transparent PNG now.'],
    ['產生失敗，可能是網址過長或設定組合不適合。', 'Generation failed. The URL may be too long or the settings may be incompatible.'],
    ['顏色格式需為 #RRGGBB。', 'Color format must be #RRGGBB.'],
    ['請選擇 PNG、WebP 或 JPEG 圖檔。', 'Choose a PNG, WebP, or JPEG image.'],
    ['目前預覽圖已處理，可下載或匯入去背流程', 'Current preview processed. Download it or send it to background removal.'],
    ['處理失敗：遮罩可能未載入或圖片尚未準備好', 'Processing failed: the mask may not be loaded or the image may not be ready.'],
    ['目前沒有可匯入的單張結果', 'No single-image result is available to import.'],
    ['已將目前結果匯入去背流程', 'Current result sent to the background-removal workflow.'],
    ['正在打包 ZIP...', 'Packaging ZIP...'],
    ['批次完成，ZIP 已下載（批次結果不會自動匯入去背頁）', 'Batch complete. ZIP downloaded (batch results are not automatically imported into background removal).'],
    ['已清空去 Gemini 浮水印列表', 'Gemini watermark-removal list cleared.'],
    ['原位模式僅保留切割格內原始位置與原始尺寸，不重新放大、不置中；超過輸出尺寸時只會等比例縮小以避免裁切。', 'Original-position mode keeps the original position and size inside each slice. It does not enlarge or center; oversized content is only scaled down proportionally to avoid cropping.'],
    ['提示：進入第4步後，可拖拉橘色切線微調每格範圍。', 'Tip: In Step 4, drag the orange cut lines to fine-tune each cell.'],
    ['提示：可拖拉橘色切線微調每格範圍。', 'Tip: Drag the orange cut lines to fine-tune each cell.'],
    ['已套用自訂切線；切割預覽與 ZIP 會依照目前切線輸出。', 'Custom cut lines applied. Slice preview and ZIP export follow the current lines.'],
    ['目前使用自訂切線；切割預覽與 ZIP 會依照目前切線輸出。', 'Custom cut lines are active. Slice preview and ZIP export follow the current lines.'],
    ['尚未選取魔術棒位置。', 'No magic-wand point selected.'],
    ['魔術棒已啟用：可在右側整張母圖連續點選多個背景區。', 'Magic wand enabled: click multiple background regions on the full source sheet at right.'],
    ['魔術棒已關閉。', 'Magic wand disabled.'],
    ['已清除全部魔術棒選區。', 'All magic-wand selections cleared.'],
    ['目前沒有可復原的魔術棒點。', 'There is no magic-wand point to undo.'],
    ['請先上傳或匯入圖片，再使用魔術棒。', 'Upload or import an image before using the magic wand.'],
    ['請先在魔術棒整張母圖預覽上點選至少一個背景區，再開始分割打包。', 'Select at least one background region on the full-sheet magic-wand preview before slicing and packaging.'],
    ['目前模式：不去背', 'Current mode: No removal'],
    ['目前模式：傳統去背', 'Current mode: Traditional removal'],
    ['目前模式：魔術棒去背', 'Current mode: Magic-wand removal'],
    ['不去背', 'No removal'],
    ['傳統去背', 'Traditional removal'],
    ['魔術棒去背', 'Magic-wand removal'],
    ['自訂切線', 'Custom cuts'],
    ['平均切線', 'Even cuts'],
    ['置中＋滿版', 'Center + Fill'],
    ['置中＋原尺寸', 'Center + Original size'],
    ['原位＋原尺寸', 'Original position + Original size'],
    ['置中＋90%', 'Center + 90%'],
  ]);

  function resolveInitialLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (_) {}
    const browser = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    return browser.startsWith('zh') ? 'zh-TW' : 'en';
  }

  function normalize(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function hasCjk(value) {
    return /[\u3400-\u9fff]/.test(String(value || ''));
  }

  function translateSource(value) {
    const raw = String(value == null ? '' : value);
    const normalized = normalize(raw);
    if (!normalized) return raw;
    const exact = exactMap.get(normalized);
    let translated = exact ? exact.en : EXACT_DYNAMIC.get(normalized);
    if (!translated) {
      for (const [re, fn] of PATTERNS) {
        const match = normalized.match(re);
        if (match) {
          translated = fn(...match);
          break;
        }
      }
    }
    if (!translated) return raw;
    const lead = raw.match(/^\s*/)?.[0] || '';
    const tail = raw.match(/\s*$/)?.[0] || '';
    return `${lead}${translated}${tail}`;
  }

  function isIgnoredElement(el) {
    if (!el || el.nodeType !== 1) return false;
    return !!el.closest('script,style,pre,code,textarea,#devlog-v91,.devlog-panel,[data-i18n-ignore],.featured-title,.featured-desc,.asset-name');
  }

  function translateTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || !node.parentElement || isIgnoredElement(node.parentElement)) return;
    const current = node.nodeValue || '';
    if (currentLanguage === 'zh-TW') {
      if (nodeSources.has(node)) {
        const source = nodeSources.get(node);
        if (node.nodeValue !== source) node.nodeValue = source;
      }
      return;
    }
    if (!normalize(current)) return;
    if (!nodeSources.has(node) || hasCjk(current)) nodeSources.set(node, current);
    const source = nodeSources.get(node) || current;
    const translated = translateSource(source);
    if (translated !== current) node.nodeValue = translated;
  }

  function translateAttributes(el) {
    if (!el || el.nodeType !== 1 || isIgnoredElement(el)) return;
    const attrs = ['title', 'aria-label', 'placeholder', 'alt', 'content'];
    let saved = attrSources.get(el);
    if (!saved) {
      saved = {};
      attrSources.set(el, saved);
    }
    attrs.forEach((attr) => {
      if (!el.hasAttribute(attr)) return;
      const current = el.getAttribute(attr) || '';
      if (currentLanguage === 'zh-TW') {
        if (Object.prototype.hasOwnProperty.call(saved, attr) && current !== saved[attr]) el.setAttribute(attr, saved[attr]);
        return;
      }
      if (!Object.prototype.hasOwnProperty.call(saved, attr) || hasCjk(current)) saved[attr] = current;
      const source = saved[attr] || current;
      const translated = translateSource(source);
      if (translated !== current) el.setAttribute(attr, translated);
    });
  }

  function applyTo(root) {
    if (!root) return;
    translating = true;
    try {
      if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root);
        return;
      }
      if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let node = walker.currentNode;
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
        else if (node.nodeType === Node.ELEMENT_NODE) translateAttributes(node);
        node = walker.nextNode();
      }
    } finally {
      translating = false;
    }
  }

  function updateDocumentMetadata() {
    document.documentElement.lang = currentLanguage === 'en' ? 'en' : 'zh-Hant-TW';
    if (currentLanguage === 'en') {
      const source = document.title;
      if (!document.documentElement.dataset.i18nTitleSource || hasCjk(source)) {
        document.documentElement.dataset.i18nTitleSource = source;
      }
      document.title = translateSource(document.documentElement.dataset.i18nTitleSource || source);
    } else if (document.documentElement.dataset.i18nTitleSource) {
      document.title = document.documentElement.dataset.i18nTitleSource;
    }

    document.querySelectorAll('head meta[content], head [title], head [aria-label]').forEach(translateAttributes);

    const counter = document.querySelector('img[src*="hits.sh"]');
    if (counter) {
      if (!counter.dataset.i18nSrc) counter.dataset.i18nSrc = counter.getAttribute('src') || '';
      const original = counter.dataset.i18nSrc;
      if (currentLanguage === 'en') {
        counter.setAttribute('src', original.replace(/label=%E7%B4%AF%E7%A9%8D%E7%80%8F%E8%A6%BD/, 'label=Views'));
      } else {
        counter.setAttribute('src', original);
      }
    }
  }

  function mountSwitcher() {
    if (document.getElementById('fanzo-i18n-switcher')) return;
    const box = document.createElement('div');
    box.id = 'fanzo-i18n-switcher';
    box.setAttribute('data-i18n-ignore', '');
    box.innerHTML = '<span aria-hidden="true">🌐</span><select id="fanzo-language-select" aria-label="Language"><option value="zh-TW">繁中</option><option value="en">English</option></select>';
    const style = document.createElement('style');
    style.id = 'fanzo-i18n-style';
    style.textContent = `
      #fanzo-i18n-switcher{display:inline-flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(127,127,127,.35);border-radius:10px;background:rgba(20,24,32,.88);color:#fff;font:600 12px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.16);backdrop-filter:blur(8px);}
      #fanzo-i18n-switcher select{min-height:30px;padding:4px 24px 4px 8px;border:1px solid rgba(255,255,255,.18);border-radius:7px;background:#151a23;color:#fff;font:600 12px system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer;}
      #fanzo-i18n-switcher.fanzo-home{margin-left:auto;}
      #fanzo-i18n-switcher.fanzo-sticker{margin-left:auto;margin-right:120px;}
      #fanzo-i18n-switcher.fanzo-block{margin-top:10px;}
      @media(max-width:700px){#fanzo-i18n-switcher.fanzo-sticker{margin-right:0;}.fanzo-sticker-page header .version{display:none!important;}}
    `;
    document.head.appendChild(style);

    const pagePath = location.pathname;
    let target = null;
    if (pagePath.includes('/sticker/')) {
      target = document.querySelector('header') || document.body;
      box.classList.add('fanzo-sticker');
      document.documentElement.classList.add('fanzo-sticker-page');
    } else if (pagePath.includes('/line-check/')) {
      target = document.querySelector('.left .box') || document.body;
      box.classList.add('fanzo-block');
    } else if (pagePath.includes('/qr/')) {
      target = document.querySelector('.hero-copy') || document.body;
      box.classList.add('fanzo-block');
    } else if (pagePath.includes('/collage/')) {
      target = document.querySelector('.tool-brand') || document.body;
      box.classList.add('fanzo-block');
    } else {
      target = document.querySelector('.topbar') || document.body;
      box.classList.add('fanzo-home');
    }
    (target || document.body).appendChild(box);
    const select = box.querySelector('select');
    select.value = currentLanguage;
    select.addEventListener('change', () => setLanguage(select.value));
  }

  function setLanguage(lang) {
    const next = SUPPORTED.includes(lang) ? lang : DEFAULT_LANGUAGE;
    currentLanguage = next;
    try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
    const select = document.getElementById('fanzo-language-select');
    if (select && select.value !== next) select.value = next;
    updateDocumentMetadata();
    applyTo(document.body);
    document.dispatchEvent(new CustomEvent('fanzo:languagechange', { detail: { language: next } }));
  }

  function auditUntranslated() {
    if (currentLanguage !== 'en') return [];
    const found = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.parentElement || isIgnoredElement(node.parentElement)) continue;
      const text = normalize(node.nodeValue || '');
      if (text && hasCjk(text)) found.add(text);
    }
    return Array.from(found);
  }

  const originalAlert = window.alert?.bind(window);
  const originalConfirm = window.confirm?.bind(window);
  const originalPrompt = window.prompt?.bind(window);
  if (originalAlert) window.alert = (message) => originalAlert(currentLanguage === 'en' ? translateMultiline(message) : message);
  if (originalConfirm) window.confirm = (message) => originalConfirm(currentLanguage === 'en' ? translateMultiline(message) : message);
  if (originalPrompt) window.prompt = (message, value) => originalPrompt(currentLanguage === 'en' ? translateMultiline(message) : message, value);

  function translateMultiline(message) {
    return String(message == null ? '' : message).split('\n').map(line => {
      const direct = translateSource(line);
      if (direct !== line) return direct;
      const replacements = [
        ['輸出前檢查：', 'Pre-export check:'],
        ['尺寸：', 'Size: '],
        ['格數：', 'Grid: '],
        ['檔名：', 'Filenames: '],
        ['去背模式：', 'Background mode: '],
        ['成品排版：', 'Output layout: '],
        ['請確認格數、起始編號、檔名碼數與 LINE 上傳需求一致。', 'Confirm that the grid count, start number, filename digits, and LINE upload requirements match.'],
        ['若是表情貼或特殊編號素材，也請確認圖片內容與指定編號一致。', 'For emoji or specially numbered assets, also confirm that image content matches the assigned numbers.'],
        ['是否繼續切割＋打包？', 'Continue slicing and packaging?'],
      ];
      let out = line;
      replacements.forEach(([zh, en]) => { if (out.includes(zh)) out = out.replace(zh, en); });
      return out;
    }).join('\n');
  }

  const observer = new MutationObserver((mutations) => {
    if (translating) return;
    if (currentLanguage !== 'en') return;
    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') translateTextNode(mutation.target);
      mutation.addedNodes.forEach(node => applyTo(node));
      if (mutation.type === 'attributes') translateAttributes(mutation.target);
    });
  });

  window.FanzoI18n = {
    getLanguage: () => currentLanguage,
    setLanguage,
    translateSource,
    t(key) {
      const pair = MESSAGES[key];
      return pair ? (currentLanguage === 'en' ? pair[1] : pair[0]) : key;
    },
    refresh: () => { updateDocumentMetadata(); applyTo(document.body); },
    audit: auditUntranslated,
  };

  mountSwitcher();
  updateDocumentMetadata();
  applyTo(document.body);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'placeholder', 'alt', 'content'] });

  if (new URLSearchParams(location.search).get('i18nAudit') === '1' && currentLanguage === 'en') {
    setTimeout(() => {
      const missing = auditUntranslated();
      if (missing.length) console.warn('[Fanzo i18n] Untranslated UI:', missing);
      else console.info('[Fanzo i18n] UI audit passed.');
    }, 400);
  }
})();
