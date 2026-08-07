const BASE_CELL_W = 370;
const BASE_CELL_H = 320;
const DEFAULT_CELL_SCALE = 1;
const MIN_CELL_SCALE = 0.1;
const MAX_CELL_SCALE = 1;

const standardSizeMap = {
  '16:9': [[1280,720],[1600,900],[1920,1080],[2560,1440],[3840,2160]],
  '9:16': [[720,1280],[900,1600],[1080,1920],[1440,2560],[2160,3840]],
  '1:1': [[1080,1080],[1440,1440],[1920,1920],[2160,2160]],
  '4:5': [[1080,1350],[1440,1800],[2160,2700]],
  '4:3': [[1280,960],[1600,1200],[1920,1440],[2560,1920],[3840,2880]],
  '3:2': [[1200,800],[1800,1200],[2400,1600],[3000,2000]],
};

const dom = {
  fileInput: document.getElementById('fileInput'),
  replaceInput: document.getElementById('replaceInput'),
  layoutPreset: document.getElementById('layoutPreset'),
  colsInput: document.getElementById('colsInput'),
  rowsInput: document.getElementById('rowsInput'),
  emptyMode: document.getElementById('emptyMode'),
  ratioPreset: document.getElementById('ratioPreset'),
  ratioW: document.getElementById('ratioW'),
  ratioH: document.getElementById('ratioH'),
  scalePreset: document.getElementById('scalePreset'),
  scaleCustom: document.getElementById('scaleCustom'),
  bgColor: document.getElementById('bgColor'),
  bgColorText: document.getElementById('bgColorText'),
  cellScaleInput: document.getElementById('cellScaleInput'),
  allCellScaleInput: document.getElementById('allCellScaleInput'),
  computedSize: document.getElementById('computedSize'),
  fillEmptyBtn: document.getElementById('fillEmptyBtn'),
  clearBoardBtn: document.getElementById('clearBoardBtn'),
  clearAssetsBtn: document.getElementById('clearAssetsBtn'),
  removeCellBtn: document.getElementById('removeCellBtn'),
  cloneFillBtn: document.getElementById('cloneFillBtn'),
  exportBtn: document.getElementById('exportBtn'),
  previewCanvas: document.getElementById('previewCanvas'),
  previewWrap: document.getElementById('previewWrap'),
  cellOverlay: document.getElementById('cellOverlay'),
  previewMeta: document.getElementById('previewMeta'),
  activeCellLabel: document.getElementById('activeCellLabel'),
  filledCountLabel: document.getElementById('filledCountLabel'),
  assetCountLabel: document.getElementById('assetCountLabel'),
  assetList: document.getElementById('assetList'),
  assetItemTemplate: document.getElementById('assetItemTemplate'),
  assetPanel: document.getElementById('assetPanel'),
  assetPanelHeader: document.getElementById('assetPanelHeader'),
  assetPanelBody: document.getElementById('assetPanelBody'),
  collapseAssetBtn: document.getElementById('collapseAssetBtn'),
  assetPanelToggle: document.getElementById('assetPanelToggle'),
  customRatioFields: document.getElementById('customRatioFields'),
  customScaleField: document.getElementById('customScaleField'),
};

const state = {
  assets: [],
  cells: [],
  cols: 4,
  rows: 3,
  activeCellIndex: -1,
  settings: {
    ratioW: 16,
    ratioH: 9,
    scale: 1.5,
    background: '#666666',
    commonCellScale: DEFAULT_CELL_SCALE,
  },
  nextAssetId: 1,
};

function init() {
  resetCells();
  bindEvents();
  updateConditionalFields();
  syncScaleControls();
  renderAll();

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => {
      fitPreviewCanvas();
      renderCellOverlay();
    });
    observer.observe(dom.previewWrap);
  }
}

function bindEvents() {
  dom.fileInput.addEventListener('change', (e) => importFiles(e.target.files));
  dom.replaceInput.addEventListener('change', (e) => replaceCurrentCellFromFile(e.target.files[0]));
  dom.layoutPreset.addEventListener('change', onLayoutPresetChange);
  dom.colsInput.addEventListener('input', onGridInputsChange);
  dom.rowsInput.addEventListener('input', onGridInputsChange);
  dom.ratioPreset.addEventListener('change', onRatioPresetChange);
  dom.ratioW.addEventListener('input', onRatioInputsChange);
  dom.ratioH.addEventListener('input', onRatioInputsChange);
  dom.scalePreset.addEventListener('change', onScalePresetChange);
  dom.scaleCustom.addEventListener('input', onScaleCustomChange);
  dom.bgColor.addEventListener('input', onBgColorChange);
  dom.bgColorText.addEventListener('input', onBgColorTextChange);
  dom.cellScaleInput.addEventListener('input', onCellScaleInputChange);
  dom.allCellScaleInput.addEventListener('input', onAllCellScaleInputChange);

  dom.fillEmptyBtn.addEventListener('click', fillEmptyFromAssets);
  dom.clearBoardBtn.addEventListener('click', clearBoard);
  dom.clearAssetsBtn.addEventListener('click', clearAssets);
  dom.removeCellBtn.addEventListener('click', clearActiveCell);
  dom.cloneFillBtn.addEventListener('click', cloneLastFilledToEmpty);
  dom.exportBtn.addEventListener('click', exportPNG);

  dom.collapseAssetBtn.addEventListener('click', collapseAssetPanel);
  dom.assetPanelToggle.addEventListener('click', expandAssetPanel);

  setupAssetPanelDrag();
  window.addEventListener('resize', () => {
    fitPreviewCanvas();
    renderCellOverlay();
  });
}

function resetCells() {
  const total = state.cols * state.rows;
  state.cells = Array.from({ length: total }, () => createCell());
  state.activeCellIndex = -1;
}

function createCell(assetId = null, contentScale = state.settings.commonCellScale) {
  return {
    assetId,
    contentScale: normalizeCellScale(contentScale),
  };
}

function cloneCell(cell) {
  return createCell(cell?.assetId ?? null, cell?.contentScale ?? state.settings.commonCellScale);
}

function onLayoutPresetChange() {
  const value = dom.layoutPreset.value;
  if (value !== 'custom') {
    const [cols, rows] = value.split('x').map(Number);
    dom.colsInput.value = cols;
    dom.rowsInput.value = rows;
  }
  onGridInputsChange();
}

function onGridInputsChange() {
  const cols = clampInt(dom.colsInput.value, 1, 12, 4);
  const rows = clampInt(dom.rowsInput.value, 1, 12, 3);
  state.cols = cols;
  state.rows = rows;

  const presetValue = `${cols}x${rows}`;
  if (['4x3','4x4','5x4'].includes(presetValue)) {
    dom.layoutPreset.value = presetValue;
  } else {
    dom.layoutPreset.value = 'custom';
  }

  const prev = state.cells.slice();
  const total = cols * rows;
  state.cells = Array.from({ length: total }, (_, i) => cloneCell(prev[i]));
  if (state.activeCellIndex >= total) state.activeCellIndex = -1;
  renderAll();
}

function onRatioPresetChange() {
  const value = dom.ratioPreset.value;
  if (value === 'custom') {
    updateConditionalFields();
    renderAll();
    return;
  }

  const [w, h] = value.split(':').map(Number);
  dom.ratioW.value = w;
  dom.ratioH.value = h;
  onRatioInputsChange();
}

function onRatioInputsChange() {
  state.settings.ratioW = clampInt(dom.ratioW.value, 1, 999, 16);
  state.settings.ratioH = clampInt(dom.ratioH.value, 1, 999, 9);
  const preset = `${state.settings.ratioW}:${state.settings.ratioH}`;
  if (['16:9','9:16','1:1','4:5','4:3','3:2'].includes(preset)) {
    dom.ratioPreset.value = preset;
  } else {
    dom.ratioPreset.value = 'custom';
  }
  renderAll();
}

function onScalePresetChange() {
  if (dom.scalePreset.value === 'custom') {
    updateConditionalFields();
    renderAll();
    return;
  }

  dom.scaleCustom.value = dom.scalePreset.value;
  onScaleCustomChange();
}

function onScaleCustomChange() {
  const value = clampFloat(dom.scaleCustom.value, 0.1, 10, 1.5);
  state.settings.scale = value;
  const known = ['1','1.5','2'];
  if (known.includes(String(value))) {
    dom.scalePreset.value = String(value);
  } else {
    dom.scalePreset.value = 'custom';
  }
  renderAll();
}

function onBgColorChange() {
  state.settings.background = dom.bgColor.value;
  dom.bgColorText.value = dom.bgColor.value.toUpperCase();
  renderAll();
}

function onBgColorTextChange() {
  const hex = normalizeHex(dom.bgColorText.value);
  if (hex) {
    state.settings.background = hex;
    dom.bgColor.value = hex;
    renderAll();
  }
}

function onCellScaleInputChange() {
  if (state.activeCellIndex < 0) {
    syncScaleControls();
    return;
  }
  const value = parseScalePercentInput(dom.cellScaleInput.value, state.cells[state.activeCellIndex].contentScale);
  state.cells[state.activeCellIndex].contentScale = value;
  renderAll();
}

function onAllCellScaleInputChange() {
  const value = parseScalePercentInput(dom.allCellScaleInput.value, state.settings.commonCellScale);
  state.settings.commonCellScale = value;
  state.cells.forEach(cell => {
    cell.contentScale = value;
  });
  renderAll();
}

async function importFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  const loaded = [];
  for (const file of files) {
    try {
      const asset = await createAssetFromFile(file);
      loaded.push(asset);
    } catch (err) {
      console.error('素材讀取失敗', file.name, err);
    }
  }

  state.assets.push(...loaded);
  dom.fileInput.value = '';
  renderAll();
}

async function replaceCurrentCellFromFile(file) {
  if (!file || state.activeCellIndex < 0) return;
  const asset = await createAssetFromFile(file);
  state.assets.push(asset);
  state.cells[state.activeCellIndex].assetId = asset.id;
  dom.replaceInput.value = '';
  renderAll();
}

function createAssetFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve({
        id: state.nextAssetId++,
        name: file.name,
        url: reader.result,
        width: img.width,
        height: img.height,
        image: img,
      });
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getAssetById(id) {
  return state.assets.find(asset => asset.id === id) || null;
}

function fillEmptyFromAssets() {
  const used = new Set(state.cells.filter(c => c.assetId != null).map(c => c.assetId));
  const available = state.assets.filter(asset => !used.has(asset.id));
  let cursor = 0;
  state.cells.forEach(cell => {
    if (cell.assetId == null && available[cursor]) {
      cell.assetId = available[cursor].id;
      cell.contentScale = normalizeCellScale(state.settings.commonCellScale);
      cursor += 1;
    }
  });
  renderAll();
}

function clearBoard() {
  state.cells.forEach(cell => {
    cell.assetId = null;
    cell.contentScale = normalizeCellScale(state.settings.commonCellScale);
  });
  state.activeCellIndex = -1;
  renderAll();
}

function clearAssets() {
  state.assets = [];
  state.cells.forEach(cell => {
    cell.assetId = null;
    cell.contentScale = normalizeCellScale(state.settings.commonCellScale);
  });
  state.activeCellIndex = -1;
  renderAll();
}

function clearActiveCell() {
  if (state.activeCellIndex < 0) return;
  state.cells[state.activeCellIndex].assetId = null;
  renderAll();
}

function cloneLastFilledToEmpty() {
  let lastCell = null;
  for (const cell of state.cells) {
    if (cell.assetId != null) lastCell = cell;
  }
  if (!lastCell) return;
  for (const cell of state.cells) {
    if (cell.assetId == null) {
      cell.assetId = lastCell.assetId;
      cell.contentScale = lastCell.contentScale;
    }
  }
  renderAll();
}

function placeAsset(assetId) {
  if (state.activeCellIndex >= 0) {
    const targetCell = state.cells[state.activeCellIndex];
    const wasEmpty = targetCell.assetId == null;
    targetCell.assetId = assetId;
    if (wasEmpty) {
      targetCell.contentScale = normalizeCellScale(state.settings.commonCellScale);
    }
    const nextEmpty = state.cells.findIndex((cell, idx) => idx > state.activeCellIndex && cell.assetId == null);
    state.activeCellIndex = nextEmpty;
  } else {
    const emptyIndex = state.cells.findIndex(cell => cell.assetId == null);
    if (emptyIndex >= 0) {
      const targetCell = state.cells[emptyIndex];
      targetCell.assetId = assetId;
      targetCell.contentScale = normalizeCellScale(state.settings.commonCellScale);
      const nextEmpty = state.cells.findIndex((cell, idx) => idx > emptyIndex && cell.assetId == null);
      state.activeCellIndex = nextEmpty;
    }
  }
  renderAll();
}

function getEffectiveCells() {
  const cloned = state.cells.map(cell => cloneCell(cell));
  if (dom.emptyMode.value === 'clone-last') {
    let lastCell = null;
    for (const cell of cloned) {
      if (cell.assetId != null) {
        lastCell = cell;
      } else if (lastCell) {
        cell.assetId = lastCell.assetId;
        cell.contentScale = lastCell.contentScale;
      }
    }
  }
  return cloned;
}

function calculateCanvasSize() {
  const cols = state.cols;
  const rows = state.rows;
  const ratioW = state.settings.ratioW;
  const ratioH = state.settings.ratioH;
  const ratio = ratioW / ratioH;
  const scale = state.settings.scale;
  const minW = BASE_CELL_W * cols * scale;
  const minH = BASE_CELL_H * rows * scale;
  const presetKey = `${ratioW}:${ratioH}`;

  const candidates = standardSizeMap[presetKey] || generateFallbackCandidates(ratio, minW, minH);
  let chosen = candidates.find(([w,h]) => w >= minW && h >= minH);

  if (!chosen) {
    chosen = generateCustomSize(ratio, minW, minH);
  }

  return { width: chosen[0], height: chosen[1] };
}

function generateFallbackCandidates(ratio, minW, minH) {
  const candidates = [];
  for (let base = 512; base <= 8192; base += 128) {
    let w = base;
    let h = Math.round(w / ratio);
    if (w >= minW && h >= minH) candidates.push([w, h]);
    h = base;
    w = Math.round(h * ratio);
    if (w >= minW && h >= minH) candidates.push([w, h]);
  }
  candidates.sort((a,b) => (a[0]*a[1]) - (b[0]*b[1]));
  return candidates;
}

function generateCustomSize(ratio, minW, minH) {
  let width = Math.ceil(minW);
  let height = Math.ceil(width / ratio);
  if (height < minH) {
    height = Math.ceil(minH);
    width = Math.ceil(height * ratio);
  }
  return [width, height];
}

function renderAll() {
  updateConditionalFields();
  renderComputedSize();
  renderPreview();
  renderCellOverlay();
  renderAssetList();
  renderStatus();
  syncScaleControls();
}

function renderComputedSize() {
  const { width, height } = calculateCanvasSize();
  dom.computedSize.textContent = `${width} × ${height}`;
  dom.previewMeta.textContent = `${state.cols} × ${state.rows} ｜${state.settings.ratioW}:${state.settings.ratioH} ｜${width} × ${height}`;
}

function renderPreview() {
  const canvas = dom.previewCanvas;
  const ctx = canvas.getContext('2d');
  const { width, height } = calculateCanvasSize();
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = state.settings.background;
  ctx.fillRect(0, 0, width, height);

  const cellW = width / state.cols;
  const cellH = height / state.rows;
  const effectiveCells = getEffectiveCells();

  effectiveCells.forEach((cell, index) => {
    const asset = getAssetById(cell.assetId);
    const col = index % state.cols;
    const row = Math.floor(index / state.cols);
    const x = col * cellW;
    const y = row * cellH;

    ctx.fillStyle = state.settings.background;
    ctx.fillRect(x, y, cellW, cellH);

    if (asset?.image) {
      drawContain(ctx, asset.image, x, y, cellW, cellH, cell.contentScale);
    }
  });

  fitPreviewCanvas();
}

function fitPreviewCanvas() {
  const canvas = dom.previewCanvas;
  const availableWidth = Math.max(1, dom.previewWrap.clientWidth);
  const availableHeight = Math.max(1, dom.previewWrap.clientHeight);
  const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
  const displayWidth = Math.max(1, Math.floor(canvas.width * scale));
  const displayHeight = Math.max(1, Math.floor(canvas.height * scale));
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
}

function drawContain(ctx, img, x, y, boxW, boxH, contentScale = DEFAULT_CELL_SCALE) {
  const containScale = Math.min(boxW / img.width, boxH / img.height);
  const scale = containScale * normalizeCellScale(contentScale);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = x + (boxW - drawW) / 2;
  const dy = y + (boxH - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function renderCellOverlay() {
  const overlay = dom.cellOverlay;
  overlay.innerHTML = '';

  const canvasRect = dom.previewCanvas.getBoundingClientRect();
  const wrapRect = dom.previewWrap.getBoundingClientRect();
  const offsetLeft = canvasRect.left - wrapRect.left + dom.previewWrap.scrollLeft;
  const offsetTop = canvasRect.top - wrapRect.top + dom.previewWrap.scrollTop;
  const displayW = canvasRect.width;
  const displayH = canvasRect.height;
  overlay.style.width = `${dom.previewWrap.scrollWidth}px`;
  overlay.style.height = `${dom.previewWrap.scrollHeight}px`;

  const cellW = displayW / state.cols;
  const cellH = displayH / state.rows;

  state.cells.forEach((cell, index) => {
    const col = index % state.cols;
    const row = Math.floor(index / state.cols);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'overlay-cell' + (index === state.activeCellIndex ? ' active' : '');
    btn.style.left = `${offsetLeft + col * cellW}px`;
    btn.style.top = `${offsetTop + row * cellH}px`;
    btn.style.width = `${cellW}px`;
    btn.style.height = `${cellH}px`;
    btn.innerHTML = `
      <span class="cell-badge">${String(index + 1).padStart(2, '0')}</span>
      <span class="cell-state">${cell.assetId != null ? '已放入' : '空白'}</span>
    `;
    btn.addEventListener('click', () => {
      state.activeCellIndex = index;
      renderStatus();
      renderCellOverlay();
      syncScaleControls();
    });
    overlay.appendChild(btn);
  });
}

function renderAssetList() {
  dom.assetList.innerHTML = '';
  state.assets.forEach(asset => {
    const node = dom.assetItemTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('img').src = asset.url;
    node.querySelector('img').alt = asset.name;
    node.querySelector('.asset-name').textContent = asset.name;
    node.querySelector('.asset-meta').textContent = `${asset.width} × ${asset.height}`;
    node.addEventListener('click', () => placeAsset(asset.id));
    dom.assetList.appendChild(node);
  });
  dom.assetCountLabel.textContent = `${state.assets.length} 張`;
}

function renderStatus() {
  const filled = state.cells.filter(cell => cell.assetId != null).length;
  const total = state.cols * state.rows;
  dom.filledCountLabel.textContent = `${filled} / ${total}`;
  dom.activeCellLabel.textContent = state.activeCellIndex >= 0
    ? `第 ${String(state.activeCellIndex + 1).padStart(2, '0')} 格`
    : '未選取';
}

function exportPNG() {
  const offCanvas = document.createElement('canvas');
  const { width, height } = calculateCanvasSize();
  offCanvas.width = width;
  offCanvas.height = height;
  const ctx = offCanvas.getContext('2d');
  ctx.fillStyle = state.settings.background;
  ctx.fillRect(0, 0, width, height);

  const cellW = width / state.cols;
  const cellH = height / state.rows;
  const effectiveCells = getEffectiveCells();
  effectiveCells.forEach((cell, index) => {
    const asset = getAssetById(cell.assetId);
    const col = index % state.cols;
    const row = Math.floor(index / state.cols);
    const x = col * cellW;
    const y = row * cellH;
    ctx.fillStyle = state.settings.background;
    ctx.fillRect(x, y, cellW, cellH);
    if (asset?.image) {
      drawContain(ctx, asset.image, x, y, cellW, cellH, cell.contentScale);
    }
  });

  const link = document.createElement('a');
  const filename = `board_${state.cols}x${state.rows}_${width}x${height}.png`;
  link.href = offCanvas.toDataURL('image/png');
  link.download = filename;
  link.click();
}

function setupAssetPanelDrag() {
  const panel = dom.assetPanel;
  const handle = dom.assetPanelHeader;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;
    dragging = true;
    const rect = panel.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const x = clampFloat(e.clientX - offsetX, 0, window.innerWidth - panel.offsetWidth, 0);
    const y = clampFloat(e.clientY - offsetY, 0, window.innerHeight - panel.offsetHeight, 0);
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });
}

function collapseAssetPanel() {
  dom.assetPanel.classList.add('collapsed');
  dom.assetPanel.classList.add('hidden');
  dom.assetPanelToggle.classList.remove('hidden');
}

function expandAssetPanel() {
  dom.assetPanel.classList.remove('hidden');
  dom.assetPanel.classList.remove('collapsed');
  dom.assetPanelToggle.classList.add('hidden');
}

function updateConditionalFields() {
  dom.customRatioFields?.classList.toggle('hidden', dom.ratioPreset.value !== 'custom');
  dom.customScaleField?.classList.toggle('hidden', dom.scalePreset.value !== 'custom');
}

function syncScaleControls() {
  dom.allCellScaleInput.value = formatScalePercent(state.settings.commonCellScale);
  if (state.activeCellIndex >= 0 && state.cells[state.activeCellIndex]) {
    dom.cellScaleInput.disabled = false;
    dom.cellScaleInput.value = formatScalePercent(state.cells[state.activeCellIndex].contentScale);
  } else {
    dom.cellScaleInput.disabled = true;
    dom.cellScaleInput.value = formatScalePercent(state.settings.commonCellScale);
  }
}

function parseScalePercentInput(value, fallbackScale = DEFAULT_CELL_SCALE) {
  const fallbackPercent = formatScalePercent(fallbackScale);
  const percent = clampInt(value, 10, 100, fallbackPercent);
  return normalizeCellScale(percent / 100);
}

function formatScalePercent(scale) {
  return Math.round(normalizeCellScale(scale) * 100);
}

function normalizeCellScale(value) {
  return clampFloat(value, MIN_CELL_SCALE, MAX_CELL_SCALE, DEFAULT_CELL_SCALE);
}

function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function clampFloat(value, min, max, fallback) {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function normalizeHex(value) {
  const cleaned = String(value).trim();
  const matched = cleaned.match(/^#?[0-9a-fA-F]{6}$/);
  if (!matched) return null;
  return ('#' + cleaned.replace('#','')).toUpperCase();
}

init();
