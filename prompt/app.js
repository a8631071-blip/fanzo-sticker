/* 公開版獨立實作：不依賴私人版程式或資料庫。 */
(() => {
  'use strict';
  const DATA = window.PUBLIC_PROMPT_DATA;
  const $ = (id) => document.getElementById(id);
  if (!DATA || DATA.themes.length !== 20 || DATA.fonts.length !== 20 || DATA.themes.some(t => t.lines.length !== 60)) {
    document.body.textContent = '公開資料載入失敗：請確認 public-data.js 存在且內容完整。';
    return;
  }

  const themeMap = Object.fromEntries(DATA.themes.map(t => [t.id, t]));
  const fontMap = Object.fromEntries(DATA.fonts.map(f => [f.id, f]));
  const draftCache = new Map();   // 單純記憶體，重新整理後自然清除
  let themeId = DATA.themes[0].id;
  let batch = 1;
  let updateNeeded = false;

  const topicSelect = $('topicSelect');
  const fontSelect = $('fontSelect');
  const grid = $('lineGrid');
  const output = $('promptOutput');
  const status = $('promptStatus');

  DATA.themes.forEach(t => topicSelect.add(new Option(t.label, t.id)));
  DATA.fonts.forEach(f => fontSelect.add(new Option(f.label, f.id)));
  topicSelect.value = themeId;
  fontSelect.value = DATA.fonts[0].id;

  const keyFor = (t = themeId, b = batch) => `${t}::${b}`;
  const initialBatch = (t = themeId, b = batch) => themeMap[t].lines.slice((b-1)*20, b*20);
  const getBatchDraft = () => draftCache.get(keyFor()) || initialBatch();

  function saveDraft() {
    const fields = Array.from(grid.querySelectorAll('textarea[data-index]'));
    if (fields.length === 20) draftCache.set(keyFor(), fields.map(el => el.value));
  }
  function updateCount() {
    const lines = Array.from(grid.querySelectorAll('textarea[data-index]')).map(x => x.value.trim());
    $('lineCount').textContent = `目前 ${lines.filter(Boolean).length} / 20 句`;
  }
  function markNeeded() {
    updateNeeded = true;
    status.textContent = '設定已變更，按「重新生成」可更新指令；「複製」也會使用最新設定。';
    updateCount();
  }
  function renderLines() {
    const lines = getBatchDraft();
    grid.replaceChildren();
    lines.forEach((line,i) => {
      const cell = document.createElement('div');
      cell.className = 'line-item';
      const cap = document.createElement('div');
      cap.className = 'line-item-top';
      const num = document.createElement('span');
      num.className = 'line-number';
      num.textContent = String(i+1).padStart(2,'0');
      const hint = document.createElement('span');
      hint.className = 'empty-note';
      hint.textContent = '可修改';
      const box = document.createElement('textarea');
      box.rows = 2;
      box.dataset.index = String(i);
      box.setAttribute('aria-label',`第 ${i+1} 格文字`);
      box.value = line;
      box.maxLength = 120;
      box.spellcheck = false;
      box.addEventListener('input', () => {saveDraft();markNeeded();});
      cap.append(num, hint); cell.append(cap,box); grid.appendChild(cell);
    });
    const name = themeMap[themeId].label;
    const a = (batch-1)*20+1;
    $('batchSummary').textContent = `${name}・第 ${batch} 批・${String(a).padStart(2,'0')}–${a+19} 句`;
    $('topicMeta').textContent = `「${name}」包含 60 句；三批各 20 格。`;
    document.querySelectorAll('.batch-btn').forEach(btn => {
      const selected = Number(btn.dataset.batch) === batch;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-pressed',String(selected));
    });
    updateCount();
    markNeeded();
  }

  function updateFontDescription() {
    $('fontDescription').textContent = fontMap[fontSelect.value].description;
    markNeeded();
  }
  function updateRefMode() {
    const mode = $('refMode').value;
    const full = mode === 'full';
    $('artStyle').disabled = full;
    $('refHint').textContent = mode === 'none'
      ? '沒有母圖時，依角色描述生成；一組 20 格保持同一個角色。'
      : mode === 'identity'
        ? '請在 AI 生圖平台另外上傳母圖；保留角色特徵，但畫風依本頁選擇。'
        : '請在 AI 生圖平台另外上傳母圖；角色與畫風都沿用參考圖。';
    markNeeded();
  }

  function getEditedLines() {
    return Array.from(grid.querySelectorAll('textarea[data-index]')).map(el => el.value.trim().replace(/[\r\n]+/g,' '));
  }
  function positionPrompt() {
    const p = $('textPosition').value;
    return {
      bottom:'每格文字置於下方約 25–30% 的空間，角色占上方約 70–75%；文字不得遮擋角色臉部。',
      top:'每格文字置於上方約 25–30% 的空間，角色在下方約 70–75%；文字不得遮擋角色臉部。',
      side:'角色為主要視覺，占每格約 70–75% 的視覺比重；文字在側邊留白處占約 25–30%，避免遮擋角色臉部。',
      adaptive:'每格角色視覺比重約 70–75%，文字約 25–30%；依姿勢自動移到空白處，但絕不可遮住臉部或跨格。'
    }[p];
  }
  function buildPrompt() {
    const title = themeMap[themeId].label;
    const font = fontMap[fontSelect.value];
    const lines = getEditedLines();
    const empty = lines.filter(line => !line).length;
    const mode = $('refMode').value;
    const character = $('characterDesc').value.trim() || '使用者未指定角色外觀，請生成同一個原創角色，並於 20 格保持一致。';
    const refRules = mode === 'none'
      ? `本次沒有母圖。角色設定：${character}\n請從上述描述建立同一個原創角色，20 格維持物種、臉型、配色與識別特徵一致。角色畫風：${$('artStyle').value}。`
      : mode === 'identity'
        ? `使用者會在生圖平台附上角色母圖。請只參照角色身分、臉型、配色與識別特徵，維持同一個角色；動作與表情可以改變。\n角色補充描述：${character}\n角色畫風依本次選擇：${$('artStyle').value}，不要被母圖的其他裝飾限制。`
        : `使用者會在生圖平台附上角色母圖。請忠實沿用母圖的人物身分、物種、臉型、主要配色、識別特徵與原畫風；僅變化表情、動作及必要構圖。\n角色補充描述（不得推翻母圖特徵）：${character}`;
    const bg = $('background').value === 'transparent'
      ? '使用真正透明 Alpha 背景；背景透明必須是實際 Alpha 通道，不是白底、棋盤格、灰底或模擬透明。'
      : '使用整張純色 #00FF00 綠幕背景，顏色均一、不可加背景紋理；文字與角色外緣不可使用接近綠幕的綠色，以便後製去背。';
    const outline = {dark:'深灰黑色清晰描邊', white:'白色清晰描邊', black:'黑色清晰描邊', none:'不使用額外描邊'}[$('outlineColor').value];
    const wordLines = lines.map((line,i)=>{
      const n=String(i+1).padStart(2,'0');
      return `${n}. ${line ? `只使用指定文字「${line}」` : '本格文字留白（只畫角色，禁止自行補字）'}`;
    });
    return [
      '請生成一張 LINE 靜態貼圖母圖，嚴格遵守下列要求。',
      '',
      '【畫布與格數】',
      '總畫布：2000 × 1600 px；排列：5 欄 × 4 列，共 20 格；每格 400 × 400 px。',
      '這 20 格只是不可見的切圖定位區，成品不得畫出任何格線、格框、分隔線、導引線、面板邊框或編號。',
      '每格上、下、左、右各至少留 20px 無主體安全區；角色、文字、描邊、外光、陰影、裝飾均不得侵入；相鄰格可見主體之間至少保留 40px。',
      '',
      '【角色與畫風】',
      refRules,
      '20 格為同一角色，不新增其他角色；每格表情、姿態與動作應配合該格句子變化，避免只是同一張臉重複排列。',
      '',
      '【文字設計】',
      `文字字體風格：${font.label}。${font.description}`,
      `文字填色：${$('fillColor').value.toUpperCase()}；文字外緣：${outline}。保持字形正確、筆畫完整，繁體中文字不能變形、錯字、缺筆或被裝飾遮蓋。`,
      positionPrompt(),
      '20 格文字須與下方逐格內容完全相同，禁止自動加字、增刪字、改字、補上標點或加入 emoji。',
      '',
      `【逐格文字｜${title}｜第 ${batch} 批】`,
      ...wordLines,
      '',
      '【背景與成品安全】',
      bg,
      '角色、文字及任何效果不得超出各自 400 × 400 的不可見格位。',
      '不要顯示 01–20 編號。不要水印、商標、額外對話框或背景場景。文字不能壓住角色臉部。',
      '必須一次輸出完整 5×4 母圖，而不是單張貼圖、九宮格、教學表或帶外框的展示稿。',
      '',
      '【最終輸出】',
      '一張 2000 × 1600 px、完整 20 格、無可見格線的 LINE 靜態貼圖母圖。',
      ...(empty ? [`注意：本批有 ${empty} 格文字留白，留白格不能自行補文字。`] : [])
    ].join('\n');
  }
  function generate() {
    output.value = buildPrompt();
    $('charCount').textContent = `${output.value.length.toLocaleString('zh-TW')} 字元`;
    updateNeeded = false;
    status.textContent = '指令已更新，可複製使用。';
    return output.value;
  }
  async function copyText() {
    // 複製時一定重建：避免把上次批次、舊字體或改字前的版本複製出去。
    const str = generate();
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(str);
        ok = true;
      }
    } catch (e) { /* 例如 file:// 或非安全環境，改走下方回退路徑 */ }
    if (!ok) {
      output.focus(); output.select();
      try { ok = document.execCommand('copy'); } catch(e) { ok = false; }
      output.setSelectionRange(0,0);
    }
    status.textContent = ok ? '已複製完整 Prompt。' : '無法自動複製，請點選輸出框後按 Ctrl+C（手機可長按複製）。';
    $('copyBtn').textContent = ok ? '已複製' : '手動複製';
    window.setTimeout(() => { $('copyBtn').textContent = '複製 Prompt'; },1500);
  }

  topicSelect.addEventListener('change', () => { saveDraft();themeId=topicSelect.value;batch=1;renderLines(); });
  document.querySelectorAll('.batch-btn').forEach(b => b.addEventListener('click', () => {
    const next=Number(b.dataset.batch);
    if(next === batch) return;
    saveDraft();batch=next;renderLines();
  }));
  $('resetBatch').addEventListener('click', () => { draftCache.delete(keyFor());renderLines(); });
  fontSelect.addEventListener('change',updateFontDescription);
  $('refMode').addEventListener('change',updateRefMode);
  ['characterDesc','artStyle','fillColor','outlineColor','textPosition','background'].forEach(id => {
    $(id).addEventListener(id==='characterDesc'||id==='fillColor'?'input':'change', () => {
      if(id==='fillColor')$('fillColorCode').textContent=$('fillColor').value.toUpperCase();
      markNeeded();
    });
  });
  $('generateBtn').addEventListener('click',generate);
  $('copyBtn').addEventListener('click',copyText);
  updateFontDescription();updateRefMode();renderLines();generate();
})();
