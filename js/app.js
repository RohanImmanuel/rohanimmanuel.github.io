const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const COLS = 10;
const ROWS = 15;
const CELL = 48;
const BOARD_W = COLS * CELL;
const BOARD_H = ROWS * CELL;

canvas.width = BOARD_W;
canvas.height = BOARD_H;

const AUDIO_SETTINGS = {
  musicVolume: 10,
  sfxVolume: 5,
};

const splashScreen = document.getElementById('splashScreen');
const enterExperienceBtn = document.getElementById('enterExperienceBtn');

const palette = {
  bg: '#090909',
  grid: '#1b1b1b',
  wall: '#f3f3f3',
  piece: '#d94a4a',
  pieceAlt: '#ffffff',
  text: '#f3f3f3',
  muted: '#bdbdbd',
  redDark: '#972f2f',
};

const sections = [
  {
    key: 'INTRO',
    title: 'INTRO',
    desc: 'Software engineer focused on internal tools, automation, CI/CD, and debugging workflows that make engineering systems easier to work with.',
    chips: ['Software engineering', 'Internal tooling', 'Automation'],
    pattern: [
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    ],
  },
  {
    key: 'HUBSPOT',
    title: 'HUBSPOT',
    desc: 'Built a Kafka and Snowflake pipeline visualizer for debugging field mutations, extended Selenium Grid support for Edge, and wrote runbooks for internal tools.',
    chips: ['Kafka', 'Snowflake', 'Selenium Grid'],
    pattern: [
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
      [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 1, 1, 0],
    ],
  },
  {
    key: 'AUTOMATION',
    title: 'AUTOMATION',
    desc: 'Built Playwright-based automation, visual regression checks, uptime monitoring, and GitHub Actions deployment workflows across different teams and projects.',
    chips: ['Playwright', 'GitHub Actions', 'Visual regression'],
    pattern: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    key: 'BROWSERSTACK',
    title: 'BROWSERSTACK',
    desc: 'Worked across support and solutions engineering, building sample repos, debugging customer systems, and handling high-volume technical workflows.',
    chips: ['Integrations', 'Debugging', 'Customer systems'],
    pattern: [
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    ],
  },
  {
    key: 'NEXT',
    title: 'NEXT',
    desc: 'I want to keep building useful technical things: software engineering, developer tooling, internal platforms, automation, and systems with strong product feel.',
    chips: ['Builder mindset', 'Developer tooling', 'Next role'],
    pattern: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    ],
  },
];

const levelList = document.getElementById('levelList');
const sectionIndex = document.getElementById('sectionIndex');
const sectionTitle = document.getElementById('sectionTitle');
const sectionDesc = document.getElementById('sectionDesc');
const sectionChips = document.getElementById('sectionChips');
const progressLabel = document.getElementById('progressLabel');
const progressFill = document.getElementById('progressFill');
const enterBtn = document.getElementById('enterBtn');
const playBtn = document.getElementById('playBtn');
const mobileModeBtn = document.getElementById('mobileModeBtn');
const desktopHelpPanel = document.getElementById('desktopHelpPanel');
const audioToggle = document.getElementById('audioToggle');
const mobileAudioToggle = document.getElementById('mobileAudioToggle');
const audioLabel = document.getElementById('audioLabel');
const mobileAudioLabel = document.getElementById('mobileAudioLabel');
const audioIconWrap = document.getElementById('audioIconWrap');
const mobileAudioIconWrap = document.getElementById('mobileAudioIconWrap');

let currentSection = 0;
let autoTour = true;
let playMode = false;
let tourRowProgress = 0;
let board = createEmptyBoard();
let settledRows = 0;
let frame = 0;
let clearingRows = [];
let clearFlashFrames = 0;

let audioEnabled = true;
let audioStarted = false;
let audioCtx = null;
let musicMaster = null;
let sfxMaster = null;
let bgmInterval = null;

const pieceTemplates = [
  [[1, 1], [1, 1]],
  [[1, 1, 1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];

function rotateMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]).reverse());
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function createPiece(sectionIndexValue) {
  const shape = cloneMatrix(pieceTemplates[sectionIndexValue % pieceTemplates.length]);
  return {
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: -shape.length,
    sectionIndex: sectionIndexValue,
    alt: sectionIndexValue % 2 === 0,
  };
}

let currentPiece = createPiece(currentSection);

function initAudio() {
  if (audioStarted) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  musicMaster = audioCtx.createGain();
  sfxMaster = audioCtx.createGain();
  musicMaster.gain.value = audioEnabled ? AUDIO_SETTINGS.musicVolume : 0;
  sfxMaster.gain.value = audioEnabled ? AUDIO_SETTINGS.sfxVolume : 0;
  musicMaster.connect(audioCtx.destination);
  sfxMaster.connect(audioCtx.destination);
  startBgm();
  audioStarted = true;
}

function unlockAudio() {
  if (!audioStarted) initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function setAudioUI() {
  const text = audioEnabled ? 'SOUND ON' : 'SOUND OFF';
  const iconSrc = audioEnabled ? './img/sound.png' : './img/mute.png';

  if (audioLabel) audioLabel.textContent = text;
  if (mobileAudioLabel) mobileAudioLabel.textContent = text;

  if (audioIconWrap) {
    audioIconWrap.innerHTML = `<img src="${iconSrc}" alt="" width="18" height="18">`;
  }

  if (mobileAudioIconWrap) {
    mobileAudioIconWrap.innerHTML = `<img src="${iconSrc}" alt="" width="18" height="18">`;
  }

  if (audioToggle) {
    audioToggle.setAttribute('aria-label', audioEnabled ? 'Mute audio' : 'Unmute audio');
    audioToggle.setAttribute('title', audioEnabled ? 'Mute audio' : 'Unmute audio');
  }

  if (mobileAudioToggle) {
    mobileAudioToggle.setAttribute('aria-label', audioEnabled ? 'Mute audio' : 'Unmute audio');
  }
}

function toggleAudio() {
  if (!audioStarted) return;
  audioEnabled = !audioEnabled;

  if (musicMaster && audioCtx) {
    musicMaster.gain.setValueAtTime(audioEnabled ? AUDIO_SETTINGS.musicVolume : 0, audioCtx.currentTime);
  }

  if (sfxMaster && audioCtx) {
    sfxMaster.gain.setValueAtTime(audioEnabled ? AUDIO_SETTINGS.sfxVolume : 0, audioCtx.currentTime);
  }

  setAudioUI();
}

function playTone(freq = 440, duration = 0.08, type = 'square', volume = 0.08, target = null) {
  if (!audioEnabled || !audioStarted || !audioCtx) return;

  const output = target || sfxMaster;
  if (!output) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(output);

  osc.start(now);
  osc.stop(now + duration + 0.03);
}

function playMoveSfx() {
  playTone(220, 0.04, 'square', 0.08);
}

function playRotateSfx() {
  playTone(520, 0.07, 'triangle', 0.1);
}

function playDropSfx() {
  playTone(140, 0.1, 'sawtooth', 0.12);
}

function playClearSfx() {
  playTone(440, 0.06, 'square', 0.1);
  setTimeout(() => playTone(660, 0.08, 'square', 0.12), 50);
  setTimeout(() => playTone(880, 0.1, 'square', 0.14), 110);
}

function playGameOverSfx() {
  playTone(260, 0.12, 'sawtooth', 0.11);
  setTimeout(() => playTone(180, 0.18, 'sawtooth', 0.11), 90);
}

function playSectionAdvanceSfx() {
  playTone(330, 0.05, 'triangle', 0.08);
  setTimeout(() => playTone(392, 0.05, 'triangle', 0.08), 50);
}

function startBgm() {
  if (bgmInterval) clearInterval(bgmInterval);

  const motif = [
    [196, 0.24],
    [247, 0.24],
    [294, 0.26],
    [247, 0.24],
    [174, 0.28],
    [220, 0.24],
  ];

  let step = 0;
  bgmInterval = setInterval(() => {
    if (!audioEnabled || !audioStarted || !musicMaster) return;
    const [freq, dur] = motif[step % motif.length];
    playTone(freq, dur, 'triangle', 0.08, musicMaster);
    playTone(freq / 2, dur * 1.35, 'sine', 0.045, musicMaster);
    step += 1;
  }, 340);
}

function resetBoard() {
  board = createEmptyBoard();
  settledRows = 0;
  frame = 0;
  tourRowProgress = 0;
  clearingRows = [];
  clearFlashFrames = 0;
  currentPiece = createPiece(currentSection);
}

function collides(piece, offsetX = 0, offsetY = 0, testShape = piece.shape) {
  for (let y = 0; y < testShape.length; y++) {
    for (let x = 0; x < testShape[y].length; x++) {
      if (!testShape[y][x]) continue;
      const nextX = piece.x + x + offsetX;
      const nextY = piece.y + y + offsetY;
      if (nextX < 0 || nextX >= COLS || nextY >= ROWS) return true;
      if (nextY >= 0 && board[nextY][nextX]) return true;
    }
  }
  return false;
}

function mergePiece(piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      const by = piece.y + y;
      const bx = piece.x + x;
      if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
        board[by][bx] = piece.sectionIndex + 1;
      }
    });
  });
}

function findFullRows() {
  const rows = [];
  for (let y = 0; y < ROWS; y++) {
    if (board[y].every(Boolean)) rows.push(y);
  }
  return rows;
}

function applyClearRows(rowsToClear) {
  board = board.filter((_, index) => !rowsToClear.includes(index));
  while (board.length < ROWS) {
    board.unshift(Array(COLS).fill(0));
  }
  settledRows += rowsToClear.length;
}

function triggerLineClear(rowsToClear) {
  clearingRows = rowsToClear;
  clearFlashFrames = 12;
  playClearSfx();
  canvas.classList.add('clear-flash');
  setTimeout(() => canvas.classList.remove('clear-flash'), 260);
}

function advanceSection() {
  currentSection = (currentSection + 1) % sections.length;
  playSectionAdvanceSfx();
  syncSectionUI();
  currentPiece = createPiece(currentSection);
  tourRowProgress = 0;
}

function handleGameOver() {
  playGameOverSfx();
  resetBoard();
  currentPiece = createPiece(currentSection);
  playMode = true;
  syncSectionUI();
  render();
}

function spawnNextPiece() {
  currentPiece = createPiece(currentSection);
  if (collides(currentPiece, 0, 0)) {
    handleGameOver();
  }
}

function lockPiece() {
  const isOutOfFrame = currentPiece.shape.some((row, y) =>
    row.some((value) => value && currentPiece.y + y < 0)
  );

  if (isOutOfFrame) {
    handleGameOver();
    return;
  }

  mergePiece(currentPiece);
  playDropSfx();

  const fullRows = findFullRows();
  if (fullRows.length) {
    triggerLineClear(fullRows);
  } else {
    advanceSection();
    spawnNextPiece();
  }
}

function dropPiece() {
  if (clearFlashFrames > 0) return;
  if (!collides(currentPiece, 0, 1)) {
    currentPiece.y += 1;
    return;
  }
  lockPiece();
}

function movePiece(dir) {
  if (!playMode || clearFlashFrames > 0) return;
  if (!collides(currentPiece, dir, 0)) {
    currentPiece.x += dir;
    playMoveSfx();
  }
}

function rotatePiece() {
  if (!playMode || clearFlashFrames > 0) return;
  const rotated = rotateMatrix(currentPiece.shape);
  if (!collides(currentPiece, 0, 0, rotated)) {
    currentPiece.shape = rotated;
    playRotateSfx();
  }
}

function hardDrop() {
  if (!playMode || clearFlashFrames > 0) return;
  while (!collides(currentPiece, 0, 1)) {
    currentPiece.y += 1;
  }
  lockPiece();
}

function drawCell(x, y, color, inset = 3) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL + inset, y * CELL + inset, CELL - inset * 2, CELL - inset * 2);
}

function drawBoard() {
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);

  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;

  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, BOARD_H);
    ctx.stroke();
  }

  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(BOARD_W, y * CELL);
    ctx.stroke();
  }

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      const color = value % 2 === 0 ? palette.wall : palette.redDark;
      drawCell(x, y, color, 4);
    });
  });

  if (clearingRows.length && clearFlashFrames > 0) {
    clearingRows.forEach((rowIndex) => {
      ctx.fillStyle = clearFlashFrames % 4 < 2 ? palette.wall : palette.piece;
      ctx.fillRect(0, rowIndex * CELL, BOARD_W, CELL);
    });
  }
}

function drawPiece(piece, ghost = false) {
  const color = ghost ? 'rgba(217,74,74,0.18)' : (piece.alt ? palette.piece : palette.pieceAlt);
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      const px = piece.x + x;
      const py = piece.y + y;
      if (py >= 0) drawCell(px, py, color, ghost ? 8 : 4);
    });
  });
}

function drawGhost() {
  const ghostPiece = {
    ...currentPiece,
    shape: currentPiece.shape,
    x: currentPiece.x,
    y: currentPiece.y,
  };

  while (!collides(ghostPiece, 0, 1)) {
    ghostPiece.y += 1;
  }

  drawPiece(ghostPiece, true);
}

function drawTourPattern() {
  const pattern = sections[currentSection].pattern;
  const startRow = Math.floor((ROWS - pattern.length) / 2);

  for (let py = 0; py < pattern.length; py++) {
    for (let px = 0; px < pattern[py].length; px++) {
      if (!pattern[py][px]) continue;
      if (py > tourRowProgress) continue;
      const boardY = startRow + py;

      let color = palette.wall;
      if (sections[currentSection].key === 'HUBSPOT') {
        color = px % 3 === 0 ? palette.piece : palette.wall;
      } else if (sections[currentSection].key === 'AUTOMATION') {
        color = py % 2 === 0 ? palette.piece : palette.wall;
      } else if (sections[currentSection].key === 'BROWSERSTACK') {
        color = (px + py) % 2 === 0 ? palette.piece : palette.wall;
      } else if (sections[currentSection].key === 'NEXT') {
        color = Math.abs(px - 4.5) < 2 ? palette.piece : palette.wall;
      } else {
        color = (px + py + currentSection) % 2 === 0 ? palette.piece : palette.wall;
      }

      drawCell(px, boardY, color, 4);
    }
  }
}

function drawHUD() {
  ctx.fillStyle = palette.text;
  ctx.font = '700 18px Inter, sans-serif';
  ctx.fillText(`LEVEL ${String(currentSection + 1).padStart(2, '0')}`, 14, 28);

  ctx.fillStyle = palette.muted;
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText(sections[currentSection].key, 14, 48);

  ctx.textAlign = 'right';
  ctx.fillStyle = palette.text;
  ctx.fillText(playMode ? 'PLAY MODE' : 'TOUR MODE', BOARD_W - 14, 28);

  ctx.fillStyle = palette.muted;
  ctx.fillText(`ROWS ${String(settledRows).padStart(2, '0')}`, BOARD_W - 14, 48);
  ctx.textAlign = 'left';
}

function render() {
  drawBoard();

  if (playMode) {
    drawGhost();
    if (clearFlashFrames === 0) {
      drawPiece(currentPiece, false);
    }
  } else {
    drawTourPattern();
  }

  drawHUD();
}

function updateModeButtons() {
  if (playBtn) {
    playBtn.textContent = playMode ? 'Back to tour' : 'Play game';
  }
  if (mobileModeBtn) {
    mobileModeBtn.textContent = playMode ? 'Back to tour' : 'Play game';
  }
  if (desktopHelpPanel) {
    desktopHelpPanel.classList.toggle('show-desktop-help', playMode && window.innerWidth > 720);
  }
}

function syncSectionUI() {
  const section = sections[currentSection];
  sectionIndex.textContent = `${String(currentSection + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
  sectionTitle.textContent = section.title;
  sectionDesc.textContent = section.desc;
  sectionChips.innerHTML = '';

  section.chips.forEach((chip) => {
    const el = document.createElement('span');
    el.className = 'chip';
    el.textContent = chip;
    sectionChips.appendChild(el);
  });

  progressLabel.textContent = `Level ${currentSection + 1} / ${sections.length}`;
  progressFill.style.width = `${((currentSection + 1) / sections.length) * 100}%`;
  [...levelList.children].forEach((btn, i) => btn.classList.toggle('active', i === currentSection));
  updateModeButtons();
}

function goToSection(index) {
  currentSection = Math.max(0, Math.min(sections.length - 1, index));
  currentPiece = createPiece(currentSection);
  tourRowProgress = 0;
  syncSectionUI();
  render();
}

function setupLevels() {
  levelList.innerHTML = '';

  sections.forEach((section, i) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn';
    btn.innerHTML = `<span>${String(i + 1).padStart(2, '0')} — ${section.key}</span><span>ENTER</span>`;
    btn.addEventListener('click', () => goToSection(i));
    levelList.appendChild(btn);
  });
}

function setPlayMode(nextState) {
  playMode = nextState;
  resetBoard();
  syncSectionUI();

  if (playMode && window.innerWidth <= 720) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function togglePlayMode() {
  setPlayMode(!playMode);
}

function enterExperience() {
  unlockAudio();
  setAudioUI();
  if (splashScreen) {
    splashScreen.classList.add('hidden');
  }
}

function tick() {
  frame += 1;

  if (clearFlashFrames > 0) {
    clearFlashFrames -= 1;
    if (clearFlashFrames === 0 && clearingRows.length) {
      applyClearRows(clearingRows);
      clearingRows = [];
      advanceSection();
      spawnNextPiece();
    }
  } else if (playMode) {
    if (frame % 42 === 0) {
      dropPiece();
    }
  } else if (autoTour) {
    if (frame % 64 === 0) {
      const patternHeight = sections[currentSection].pattern.length;
      if (tourRowProgress < patternHeight - 1) {
        tourRowProgress += 1;
      } else {
        advanceSection();
      }
    }
  }

  render();
  requestAnimationFrame(tick);
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && splashScreen && !splashScreen.classList.contains('hidden')) {
    e.preventDefault();
    enterExperience();
    return;
  }

  if (playMode) {
    const captureKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'x', 'X'];
    if (captureKeys.includes(e.key)) {
      e.preventDefault();
    }
  }

  if (e.key === 'ArrowLeft') movePiece(-1);
  if (e.key === 'ArrowRight') movePiece(1);
  if (e.key === 'ArrowDown' && playMode) dropPiece();
  if ((e.key === 'ArrowUp' || e.key.toLowerCase() === 'x') && playMode) rotatePiece();

  if (e.key === ' ') {
    if (playMode) {
      e.preventDefault();
      hardDrop();
    }
  }

  const n = Number(e.key);
  if (n >= 1 && n <= sections.length) goToSection(n - 1);
}, { passive: false });

window.addEventListener('resize', () => {
  updateModeButtons();
});

const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const dropBtn = document.getElementById('dropBtn');
const rotateBtn = document.getElementById('rotateBtn');

if (leftBtn) leftBtn.addEventListener('click', () => movePiece(-1));
if (rightBtn) rightBtn.addEventListener('click', () => movePiece(1));
if (dropBtn) {
  dropBtn.addEventListener('click', () => {
    if (playMode) dropPiece();
  });
}
if (rotateBtn) {
  rotateBtn.addEventListener('click', () => {
    if (playMode) rotatePiece();
  });
}

if (enterBtn) {
  enterBtn.addEventListener('click', () => {
    autoTour = !autoTour;
    enterBtn.textContent = autoTour ? 'Pause tour' : 'Resume tour';
  });
}

if (playBtn) {
  playBtn.addEventListener('click', togglePlayMode);
}

if (mobileModeBtn) {
  mobileModeBtn.addEventListener('click', togglePlayMode);
}

if (audioToggle) {
  audioToggle.addEventListener('click', () => {
    if (audioStarted) toggleAudio();
  });
}

if (mobileAudioToggle) {
  mobileAudioToggle.addEventListener('click', () => {
    if (audioStarted) toggleAudio();
  });
}

if (enterExperienceBtn) {
  enterExperienceBtn.addEventListener('click', enterExperience);
}

setupLevels();
setAudioUI();
syncSectionUI();
setPlayMode(false);
render();
tick();
