const BASE_CELL_W = 370;
const BASE_CELL_H = 320;
const DEFAULT_CELL_SCALE = 1;
const MIN_CELL_SCALE = 0.1;
const MAX_CELL_SCALE = 1;
const DEFAULT_FREE_IMAGE_SIZE = 0.28;
const DEFAULT_FREE_TEXT_SIZE = 0.06;

const standardSizeMap = {
  '16:9': [[1280,720],[1600,900],[1920,1080],[2560,1440],[3840,2160]],
  '9:16': [[720,1280],[900,1600],[1080,1920],[1440,2560],[2160,3840]],
  '1:1': [[1080,1080],[1440,1440],[1920,1920],[2160,2160]],
  '4:5': [[1080,1350],[1440,1800],[2160,2700]],
  '4:3': [[1280,960],[1600,1200],[1920,1440],[2560,1920],[3840,2880]],
  '3:2': [[1200,800],[1800,1200],[2400,1600],[3000,2000]],
};

const fontMap = {
  sans: '"Microsoft JhengHei", "Noto Sans TC", sans-serif',
  serif: '"Noto Serif TC", "PMingLiU", serif',
  mono: '"Consolas", "Noto Sans Mono CJK TC", monospace',
};

const dom = {
  fileInput: document.getElementById('fileInput'),
  replaceInput: document.getElementById('replaceInput'),
  layoutMode: document.getElementById('layoutMode'),
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
  clearAssetsFreeBtn: document.getElementById('clearAssetsFreeBtn'),
  clearFreeBtn: document.getElementById('clearFreeBtn'),
  addTextBtn: document.getElementById('addTextBtn'),
  removeCellBtn: document.getElementById('removeCellBtn'),
  cloneFillBtn: document.getElementById('cloneFillBtn'),
  exportBtn: document.getElementById('exportBtn'),
  previewCanvas: document.getElementById('previewCanvas'),
  previewWrap: document.getElementById('previewWrap'),
  cellOverlay: document.getElementById('cellOverlay'),
  freeObjectOverlay: document.getElementById('freeObjectOverlay'),
  previewMeta: document.getElementById('previewMeta'),
  previewTitle: document.getElementById('previewTitle'),
  previewHint: document.getElementById('previewHint'),
  activeCellLabel: document.getElementById('activeCellLabel'),
  filledCountLabel: document.getElementById('filledCountLabel'),
  freeObjectCountLabel: document.getElementById('freeObjectCountLabel'),
  activeObjectLabel: document.getElementById('activeObjectLabel'),
  assetCountLabel: document.getElementById('assetCountLabel'),
  assetList: document.getElementById('assetList'),
  assetItemTemplate: document.getElementById('assetItemTemplate'),
  assetPanel: document.getElementById('assetPanel'),
  assetPanelHeader: document.getElementById('assetPanelHeader'),
  assetPanelBody: document.getElementById('assetPanelBody'),
  assetPanelNote: document.getElementById('assetPanelNote'),
  collapseAssetBtn: document.getElementById('collapseAssetBtn'),
  assetPanelToggle: document.getElementById('assetPanelToggle'),
  customRatioFields: document.getElementById('customRatioFields'),
  customScaleField: document.getElementById('customScaleField'),
  gridLayoutControls: document.getElementById('gridLayoutControls'),
  freeLayoutControls: document.getElementById('freeLayoutControls'),
  gridObjectControls: document.getElementById('gridObjectControls'),
  freeObjectControls: document.getElementById('freeObjectControls'),
  freeNoSelection: document.getElementById('freeNoSelection'),
  freeSelectionControls: document.getElementById('freeSelectionControls'),
  textControls: document.getElementById('textControls'),
  textContent: document.getElementById('textContent'),
  textFont: document.getElementById('textFont'),
  textSizeInput: document.getElementById('textSizeInput'),
  textColor: document.getElementById('textColor'),
  textBold: document.getElementById('textBold'),
  objectRotationInput: document.getElementById('objectRotationInput'),
  bringFrontBtn: document.getElementById('bringFrontBtn'),
  sendBackBtn: document.getElementById('sendBackBtn'),
  deleteObjectBtn: document.getElementById('deleteObjectBtn'),
};

const state = {
  assets: [],
  cells: [],
  freeObjects: [],
  mode: 'grid',
  cols: 4,
  rows: 3,
  activeCellIndex: -1,
  activeObjectId: null,
  settings: {
    ratioW: 16,
    ratioH: 9,
    scale: 1.5,
    background: '#666666',
    commonCellScale: DEFAULT_CELL_SCALE,
  },
  nextAssetId: 1,
  nextObjectId: 1,
};

let freeInteraction = null;

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
      renderFreeObjectOverlay();
    });
    observer.observe(dom.previewWrap);
  }
}

function bindEvents() {
  dom.fileInput.addEventListener('change', (e) => importFiles(e.target.files));
  dom.replaceInput.addEventListener('change', (e) => replaceCurrentCellFromFile(e.target.files[0]));
  dom.layoutMode.addEventListener('change', onLayoutModeChange);
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
  dom.clearAssetsFreeBtn.addEventListener('click', clearAssets);
  dom.clearFreeBtn.addEventListener('click', clearFreeBoard);
  dom.addTextBtn.addEventListener('click', addTextObject);
  dom.removeCellBtn.addEventListener('click', clearActiveCell);
  dom.cloneFillBtn.addEventListener('click', cloneLastFilledToEmpty);
  dom.exportBtn.addEventListener('click', exportPNG);

  dom.textContent.addEventListener('input', updateSelectedTextFromControls);
  dom.textFont.addEventListener('change', updateSelectedTextFromControls);
  dom.textSizeInput.addEventListener('input', updateSelectedTextFromControls);
  dom.textColor.addEventListener('input', updateSelectedTextFromControls);
  dom.textBold.addEventListener('change', updateSelectedTextFromControls);
  dom.objectRotationInput.addEventListener('input', updateSelectedRotation);
  dom.bringFrontBtn.addEventListener('click', bringSelectedFront);
  dom.sendBackBtn.addEventListener('click', sendSelectedBack);
  dom.deleteObjectBtn.addEventListener('click', deleteSelectedObject);

  dom.previewWrap.addEventListener('pointerdown', (e) => {
    if (state.mode !== 'free') return;
    if (e.target.closest('.free-object-box')) return;
    state.activeObjectId = null;
    renderFreeObjectOverlay();
    renderFreeObjectControls();
  });

  window.addEventListener('pointermove', onFreePointerMove);
  window.addEventListener('pointerup', endFreeInteraction);
  window.addEventListener('pointercancel', endFreeInteraction);
  window.addEventListener('keydown', onKeyDown);

  dom.collapseAssetBtn.addEventListener('click', collapseAssetPanel);
  dom.assetPanelToggle.addEventListener('click', expandAssetPanel);

  setupAssetPanelDrag();
  window.addEventListener('resize', () => {
    fitPreviewCanvas();
    renderCellOverlay();
    renderFreeObjectOverlay();
  });
}

function onLayoutModeChange() {
  state.mode = dom.layoutMode.value === 'free' ? 'free' : 'grid';
  state.activeCellIndex = -1;
  state.activeObjectId = null;
  renderAll();
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
  if (!file || state.mode !== 'grid' || state.activeCellIndex < 0) return;
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
  if (state.mode !== 'grid') return;
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

function clearFreeBoard() {
  state.freeObjects = [];
  state.activeObjectId = null;
  renderAll();
}

function clearAssets() {
  state.assets = [];
  state.cells.forEach(cell => {
    cell.assetId = null;
    cell.contentScale = normalizeCellScale(state.settings.commonCellScale);
  });
  state.freeObjects = state.freeObjects.filter(obj => obj.type === 'text');
  state.activeCellIndex = -1;
  if (!getActiveFreeObject()) state.activeObjectId = null;
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
  if (state.mode === 'free') {
    addFreeImageObject(assetId);
    return;
  }

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

function addFreeImageObject(assetId) {
  const asset = getAssetById(assetId);
  if (!asset) return;
  const offset = (state.freeObjects.length % 6) * 0.025;
  const object = {
    id: `obj-${state.nextObjectId++}`,
    type: 'image',
    assetId,
    x: clampFloat(0.5 + offset, 0, 1, 0.5),
    y: clampFloat(0.5 + offset, 0, 1, 0.5),
    size: DEFAULT_FREE_IMAGE_SIZE,
    rotation: 0,
    z: getMaxFreeZ() + 1,
  };
  state.freeObjects.push(object);
  state.activeObjectId = object.id;
  renderAll();
}

function addTextObject() {
  if (state.mode !== 'free') return;
  const object = {
    id: `obj-${state.nextObjectId++}`,
    type: 'text',
    text: '輸入文字',
    x: 0.5,
    y: 0.5,
    font: 'sans',
    fontSize: DEFAULT_FREE_TEXT_SIZE,
    color: '#FFFFFF',
    bold: true,
    rotation: 0,
    z: getMaxFreeZ() + 1,
  };
  state.freeObjects.push(object);
  state.activeObjectId = object.id;
  renderAll();
}

function getActiveFreeObject() {
  return state.freeObjects.find(obj => obj.id === state.activeObjectId) || null;
}

function getMaxFreeZ() {
  return Math.max(0, ...state.freeObjects.map(obj => Number(obj.z) || 0));
}

function getMinFreeZ() {
  return Math.min(0, ...state.freeObjects.map(obj => Number(obj.z) || 0));
}

function bringSelectedFront() {
  const obj = getActiveFreeObject();
  if (!obj) return;
  obj.z = getMaxFreeZ() + 1;
  renderAll();
}

function sendSelectedBack() {
  const obj = getActiveFreeObject();
  if (!obj) return;
  obj.z = getMinFreeZ() - 1;
  renderAll();
}

function deleteSelectedObject() {
  if (!state.activeObjectId) return;
  state.freeObjects = state.freeObjects.filter(obj => obj.id !== state.activeObjectId);
  state.activeObjectId = null;
  renderAll();
}

function updateSelectedTextFromControls() {
  const obj = getActiveFreeObject();
  if (!obj || obj.type !== 'text') return;
  obj.text = dom.textContent.value;
  obj.font = fontMap[dom.textFont.value] ? dom.textFont.value : 'sans';
  obj.fontSize = clampFloat(Number(dom.textSizeInput.value) / 100, 0.02, 0.25, DEFAULT_FREE_TEXT_SIZE);
  obj.color = dom.textColor.value;
  obj.bold = dom.textBold.checked;
  renderPreview();
  renderFreeObjectOverlay();
  renderFreeObjectControls(false);
}

function updateSelectedRotation() {
  const obj = getActiveFreeObject();
  if (!obj) return;
  obj.rotation = normalizeRotation(clampFloat(dom.objectRotationInput.value, -180, 180, 0));
  renderPreview();
  renderFreeObjectOverlay();
}

function onKeyDown(e) {
  if (state.mode !== 'free') return;
  const tag = document.activeElement?.tagName?.toLowerCase();
  if (['input','textarea','select'].includes(tag)) return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && state.activeObjectId) {
    e.preventDefault();
    deleteSelectedObject();
  } else if (e.key === 'Escape') {
    state.activeObjectId = null;
    renderFreeObjectOverlay();
    renderFreeObjectControls();
  }
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
  const minW = state.mode === 'free' ? 1440 * scale : BASE_CELL_W * cols * scale;
  const minH = state.mode === 'free' ? minW / ratio : BASE_CELL_H * rows * scale;
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
  renderFreeObjectOverlay();
  renderAssetList();
  renderStatus();
  syncScaleControls();
  renderFreeObjectControls();
}

function renderComputedSize() {
  const { width, height } = calculateCanvasSize();
  dom.computedSize.textContent = `${width} × ${height}`;
  if (state.mode === 'grid') {
    dom.previewMeta.textContent = `${state.cols} × ${state.rows} ｜${state.settings.ratioW}:${state.settings.ratioH} ｜${width} × ${height}`;
    dom.previewTitle.textContent = '主圖板';
    dom.previewHint.textContent = '點格子指定更換位置';
  } else {
    dom.previewMeta.textContent = `自由排列 ｜${state.settings.ratioW}:${state.settings.ratioH} ｜${width} × ${height}`;
    dom.previewTitle.textContent = '自由畫布';
    dom.previewHint.textContent = '拖曳素材；控制點可縮放與旋轉';
  }
}

function renderPreview() {
  const canvas = dom.previewCanvas;
  const ctx = canvas.getContext('2d');
  const { width, height } = calculateCanvasSize();
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = state.settings.background;
  ctx.fillRect(0, 0, width, height);

  if (state.mode === 'grid') {
    renderGridToContext(ctx, width, height);
  } else {
    renderFreeToContext(ctx, width, height);
  }

  fitPreviewCanvas();
}

function renderGridToContext(ctx, width, height) {
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
}

function renderFreeToContext(ctx, width, height) {
  const ordered = state.freeObjects.slice().sort((a,b) => (a.z || 0) - (b.z || 0));
  ordered.forEach(obj => drawFreeObject(ctx, obj, width, height));
}

function drawFreeObject(ctx, obj, width, height) {
  const centerX = obj.x * width;
  const centerY = obj.y * height;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((obj.rotation || 0) * Math.PI / 180);

  if (obj.type === 'image') {
    const asset = getAssetById(obj.assetId);
    if (asset?.image) {
      const drawW = width * clampFloat(obj.size, 0.05, 1.5, DEFAULT_FREE_IMAGE_SIZE);
      const aspect = asset.width / Math.max(1, asset.height);
      const drawH = drawW / Math.max(0.01, aspect);
      ctx.drawImage(asset.image, -drawW / 2, -drawH / 2, drawW, drawH);
    }
  } else if (obj.type === 'text') {
    drawFreeText(ctx, obj, width);
  }

  ctx.restore();
}

function drawFreeText(ctx, obj, width) {
  const fontPx = width * clampFloat(obj.fontSize, 0.02, 0.25, DEFAULT_FREE_TEXT_SIZE);
  const family = fontMap[obj.font] || fontMap.sans;
  ctx.font = `${obj.bold ? 700 : 400} ${fontPx}px ${family}`;
  ctx.fillStyle = obj.color || '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = String(obj.text ?? '').split(/\r?\n/);
  const lineHeight = fontPx * 1.2;
  const totalHeight = Math.max(lineHeight, lines.length * lineHeight);
  lines.forEach((line, index) => {
    const y = -totalHeight / 2 + lineHeight / 2 + index * lineHeight;
    ctx.fillText(line || ' ', 0, y);
  });
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
  overlay.classList.toggle('hidden', state.mode !== 'grid');
  if (state.mode !== 'grid') return;

  const metrics = getCanvasDisplayMetrics();
  if (!metrics) return;
  overlay.style.width = `${dom.previewWrap.scrollWidth}px`;
  overlay.style.height = `${dom.previewWrap.scrollHeight}px`;

  const cellW = metrics.displayW / state.cols;
  const cellH = metrics.displayH / state.rows;

  state.cells.forEach((cell, index) => {
    const col = index % state.cols;
    const row = Math.floor(index / state.cols);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'overlay-cell' + (index === state.activeCellIndex ? ' active' : '');
    btn.style.left = `${metrics.offsetLeft + col * cellW}px`;
    btn.style.top = `${metrics.offsetTop + row * cellH}px`;
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

function renderFreeObjectOverlay() {
  const overlay = dom.freeObjectOverlay;
  overlay.innerHTML = '';
  overlay.classList.toggle('hidden', state.mode !== 'free');
  if (state.mode !== 'free') return;

  const metrics = getCanvasDisplayMetrics();
  if (!metrics) return;
  overlay.style.width = `${dom.previewWrap.scrollWidth}px`;
  overlay.style.height = `${dom.previewWrap.scrollHeight}px`;

  const ordered = state.freeObjects.slice().sort((a,b) => (a.z || 0) - (b.z || 0));
  ordered.forEach(obj => {
    const bounds = getFreeObjectDisplayBounds(obj, metrics);
    if (!bounds) return;
    const box = document.createElement('div');
    box.className = 'free-object-box' + (obj.id === state.activeObjectId ? ' active' : '');
    box.dataset.objectId = obj.id;
    box.style.left = `${bounds.cx - bounds.width / 2}px`;
    box.style.top = `${bounds.cy - bounds.height / 2}px`;
    box.style.width = `${bounds.width}px`;
    box.style.height = `${bounds.height}px`;
    box.style.transform = `rotate(${obj.rotation || 0}deg)`;
    box.style.zIndex = String(100 + (obj.z || 0));
    box.addEventListener('pointerdown', (e) => startFreeInteraction(e, obj, 'move'));

    if (obj.id === state.activeObjectId) {
      const resize = document.createElement('button');
      resize.type = 'button';
      resize.className = 'free-handle resize-handle';
      resize.title = '拖曳縮放';
      resize.addEventListener('pointerdown', (e) => startFreeInteraction(e, obj, 'resize'));
      box.appendChild(resize);

      const rotate = document.createElement('button');
      rotate.type = 'button';
      rotate.className = 'free-handle rotate-handle';
      rotate.title = '拖曳旋轉';
      rotate.addEventListener('pointerdown', (e) => startFreeInteraction(e, obj, 'rotate'));
      box.appendChild(rotate);
    }

    overlay.appendChild(box);
  });
}

function getCanvasDisplayMetrics() {
  const canvasRect = dom.previewCanvas.getBoundingClientRect();
  const wrapRect = dom.previewWrap.getBoundingClientRect();
  if (!canvasRect.width || !canvasRect.height) return null;
  return {
    displayW: canvasRect.width,
    displayH: canvasRect.height,
    offsetLeft: canvasRect.left - wrapRect.left + dom.previewWrap.scrollLeft,
    offsetTop: canvasRect.top - wrapRect.top + dom.previewWrap.scrollTop,
    canvasLeft: canvasRect.left,
    canvasTop: canvasRect.top,
  };
}

function getFreeObjectDisplayBounds(obj, metrics) {
  const cx = metrics.offsetLeft + obj.x * metrics.displayW;
  const cy = metrics.offsetTop + obj.y * metrics.displayH;
  if (obj.type === 'image') {
    const asset = getAssetById(obj.assetId);
    if (!asset) return null;
    const width = metrics.displayW * clampFloat(obj.size, 0.05, 1.5, DEFAULT_FREE_IMAGE_SIZE);
    const aspect = asset.width / Math.max(1, asset.height);
    const height = width / Math.max(0.01, aspect);
    return { cx, cy, width: Math.max(24, width), height: Math.max(24, height) };
  }

  const { width, height } = measureFreeText(obj, dom.previewCanvas.width);
  const displayScale = metrics.displayW / dom.previewCanvas.width;
  return {
    cx,
    cy,
    width: Math.max(36, width * displayScale),
    height: Math.max(28, height * displayScale),
  };
}

function measureFreeText(obj, canvasWidth) {
  const measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  const fontPx = canvasWidth * clampFloat(obj.fontSize, 0.02, 0.25, DEFAULT_FREE_TEXT_SIZE);
  const family = fontMap[obj.font] || fontMap.sans;
  ctx.font = `${obj.bold ? 700 : 400} ${fontPx}px ${family}`;
  const lines = String(obj.text ?? '').split(/\r?\n/);
  const width = Math.max(fontPx, ...lines.map(line => ctx.measureText(line || ' ').width));
  const height = Math.max(fontPx * 1.2, lines.length * fontPx * 1.2);
  return { width, height };
}

function startFreeInteraction(e, obj, type) {
  if (state.mode !== 'free') return;
  e.preventDefault();
  e.stopPropagation();
  state.activeObjectId = obj.id;
  const metrics = getCanvasDisplayMetrics();
  if (!metrics) return;
  const centerClientX = metrics.canvasLeft + obj.x * metrics.displayW;
  const centerClientY = metrics.canvasTop + obj.y * metrics.displayH;
  const distance = Math.hypot(e.clientX - centerClientX, e.clientY - centerClientY);
  const angle = Math.atan2(e.clientY - centerClientY, e.clientX - centerClientX) * 180 / Math.PI;
  freeInteraction = {
    pointerId: e.pointerId,
    type,
    objectId: obj.id,
    startClientX: e.clientX,
    startClientY: e.clientY,
    startX: obj.x,
    startY: obj.y,
    startSize: obj.type === 'image' ? obj.size : obj.fontSize,
    startRotation: obj.rotation || 0,
    startDistance: Math.max(10, distance),
    startAngle: angle,
  };
  try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch (_) {}
  renderFreeObjectOverlay();
  renderFreeObjectControls();
}

function onFreePointerMove(e) {
  if (!freeInteraction || freeInteraction.pointerId !== e.pointerId) return;
  const obj = state.freeObjects.find(item => item.id === freeInteraction.objectId);
  const metrics = getCanvasDisplayMetrics();
  if (!obj || !metrics) return;

  if (freeInteraction.type === 'move') {
    const dx = (e.clientX - freeInteraction.startClientX) / metrics.displayW;
    const dy = (e.clientY - freeInteraction.startClientY) / metrics.displayH;
    obj.x = clampFloat(freeInteraction.startX + dx, 0, 1, 0.5);
    obj.y = clampFloat(freeInteraction.startY + dy, 0, 1, 0.5);
  } else {
    const centerClientX = metrics.canvasLeft + obj.x * metrics.displayW;
    const centerClientY = metrics.canvasTop + obj.y * metrics.displayH;
    if (freeInteraction.type === 'resize') {
      const distance = Math.hypot(e.clientX - centerClientX, e.clientY - centerClientY);
      const factor = Math.max(0.1, distance / freeInteraction.startDistance);
      if (obj.type === 'image') {
        obj.size = clampFloat(freeInteraction.startSize * factor, 0.05, 1.5, DEFAULT_FREE_IMAGE_SIZE);
      } else {
        obj.fontSize = clampFloat(freeInteraction.startSize * factor, 0.02, 0.25, DEFAULT_FREE_TEXT_SIZE);
      }
    } else if (freeInteraction.type === 'rotate') {
      const angle = Math.atan2(e.clientY - centerClientY, e.clientX - centerClientX) * 180 / Math.PI;
      obj.rotation = normalizeRotation(freeInteraction.startRotation + angle - freeInteraction.startAngle);
    }
  }

  renderPreview();
  renderFreeObjectOverlay();
  renderFreeObjectControls(false);
}

function endFreeInteraction(e) {
  if (!freeInteraction) return;
  if (e?.pointerId != null && freeInteraction.pointerId !== e.pointerId) return;
  freeInteraction = null;
  renderFreeObjectControls();
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
  dom.assetPanelNote.textContent = state.mode === 'grid'
    ? '點素材填入目前格；未選格時依序填入空格。拖曳標題列可移動面板。'
    : '點素材加入自由畫布；可重複加入同一素材。拖曳標題列可移動面板。';
}

function renderStatus() {
  const filled = state.cells.filter(cell => cell.assetId != null).length;
  const total = state.cols * state.rows;
  dom.filledCountLabel.textContent = `${filled} / ${total}`;
  dom.activeCellLabel.textContent = state.activeCellIndex >= 0
    ? `第 ${String(state.activeCellIndex + 1).padStart(2, '0')} 格`
    : '未選取';
  dom.freeObjectCountLabel.textContent = `${state.freeObjects.length} 個物件`;
}

function renderFreeObjectControls(syncValues = true) {
  const obj = getActiveFreeObject();
  const hasSelection = state.mode === 'free' && !!obj;
  dom.freeNoSelection.classList.toggle('hidden', hasSelection);
  dom.freeSelectionControls.classList.toggle('hidden', !hasSelection);
  dom.textControls.classList.toggle('hidden', !obj || obj.type !== 'text');
  if (!obj || !syncValues) return;

  dom.activeObjectLabel.textContent = obj.type === 'text' ? '文字' : '圖片';
  dom.objectRotationInput.value = Math.round(normalizeRotation(obj.rotation || 0));
  if (obj.type === 'text') {
    dom.textContent.value = obj.text ?? '';
    dom.textFont.value = fontMap[obj.font] ? obj.font : 'sans';
    dom.textSizeInput.value = Math.round(clampFloat(obj.fontSize, 0.02, 0.25, DEFAULT_FREE_TEXT_SIZE) * 100);
    dom.textColor.value = normalizeHex(obj.color) || '#FFFFFF';
    dom.textBold.checked = obj.bold !== false;
  }
}

function exportPNG() {
  const offCanvas = document.createElement('canvas');
  const { width, height } = calculateCanvasSize();
  offCanvas.width = width;
  offCanvas.height = height;
  const ctx = offCanvas.getContext('2d');
  ctx.fillStyle = state.settings.background;
  ctx.fillRect(0, 0, width, height);

  if (state.mode === 'grid') {
    renderGridToContext(ctx, width, height);
  } else {
    renderFreeToContext(ctx, width, height);
  }

  const link = document.createElement('a');
  const filename = state.mode === 'grid'
    ? `board_${state.cols}x${state.rows}_${width}x${height}.png`
    : `free_board_${width}x${height}.png`;
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
  const isFree = state.mode === 'free';
  dom.gridLayoutControls.classList.toggle('hidden', isFree);
  dom.freeLayoutControls.classList.toggle('hidden', !isFree);
  dom.gridObjectControls.classList.toggle('hidden', isFree);
  dom.freeObjectControls.classList.toggle('hidden', !isFree);
  dom.layoutMode.value = state.mode;
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

function normalizeRotation(value) {
  let n = Number(value) || 0;
  while (n > 180) n -= 360;
  while (n < -180) n += 360;
  return n;
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
