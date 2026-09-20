// ==========================================================
//  El jardín de Patricia — minijuego top-down con WASD
// ==========================================================
// Personaliza aquí:

const MENSAJE_FINAL = `¡Feliz día, Patricia! Espero que este pequeño juego
  te haya sacado una sonrisa. 💛`;

const FLORES_AMARILLAS = 8;   // cuántas flores amarillas hay que encontrar
const FLORES_DECORATIVAS = 26; // cuántas flores "de relleno" (no cuentan)

// ==========================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const foundEl = document.getElementById('found');
const totalEl = document.getElementById('total');
const bouquetTrack = document.getElementById('bouquetTrack');
const overlay = document.getElementById('overlay');
const mensajeEl = document.getElementById('mensaje');
const replayBtn = document.getElementById('replay');
const confettiContainer = document.getElementById('confetti-container');
const bouquetCanvas = document.getElementById('bouquetCanvas');
const bctx = bouquetCanvas.getContext('2d');

mensajeEl.innerHTML = MENSAJE_FINAL;
totalEl.textContent = FLORES_AMARILLAS;

// ---------- precarga de imágenes ----------
const IMG_NAMES = [
  'char_down_0', 'char_down_1',
  'char_up_0', 'char_up_1',
  'char_left_0', 'char_left_1',
  'flower_yellow', 'flower_pink', 'flower_purple', 'flower_white', 'flower_orange',
  'bow'
];
const images = {};
let loaded = 0;

function preload(cb) {
  IMG_NAMES.forEach(name => {
    const img = new Image();
    img.src = `assets/${name}.png`;
    img.onload = () => {
      loaded++;
      if (loaded === IMG_NAMES.length) cb();
    };
    images[name] = img;
  });
}

// ---------- fondo (pasto pre-renderizado) ----------
let bgCanvas;
function buildBackground() {
  bgCanvas = document.createElement('canvas');
  bgCanvas.width = W;
  bgCanvas.height = H;
  const bctx2 = bgCanvas.getContext('2d');
  const grad = bctx2.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#67c458');
  grad.addColorStop(1, '#2f7a3d');
  bctx2.fillStyle = grad;
  bctx2.fillRect(0, 0, W, H);

  // caminito de piedritas ondulado
  bctx2.fillStyle = 'rgba(214, 191, 140, 0.35)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 53) % W;
    const y = H / 2 + Math.sin(i * 0.6) * 60;
    bctx2.beginPath();
    bctx2.ellipse(x, y, 10, 6, 0, 0, Math.PI * 2);
    bctx2.fill();
  }

  // matas de pasto oscuras
  bctx2.fillStyle = 'rgba(30, 90, 40, 0.4)';
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    bctx2.beginPath();
    bctx2.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2);
    bctx2.fill();
  }
  // motitas claras (luciérnagas / brillo)
  bctx2.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    bctx2.beginPath();
    bctx2.arc(x, y, 1.5, 0, Math.PI * 2);
    bctx2.fill();
  }
}

// ---------- jugador ----------
const player = {
  x: W / 2,
  y: H / 2,
  size: 40,
  speed: 220, // px/seg
  dir: 'down',
  frame: 0,
  animTimer: 0,
  moving: false,
};

const keys = { up: false, down: false, left: false, right: false };

function setKey(code, isDown) {
  switch (code) {
    case 'KeyW': case 'ArrowUp': keys.up = isDown; break;
    case 'KeyS': case 'ArrowDown': keys.down = isDown; break;
    case 'KeyA': case 'ArrowLeft': keys.left = isDown; break;
    case 'KeyD': case 'ArrowRight': keys.right = isDown; break;
  }
}

window.addEventListener('keydown', e => {
  if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
  setKey(e.code, true);
});
window.addEventListener('keyup', e => setKey(e.code, false));

// ---------- detección de dispositivo táctil (celular / tablet) ----------
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
  document.body.classList.add('is-touch');
  const hint = document.getElementById('gameHint');
  if (hint) hint.innerHTML = 'Usa el <strong>joystick</strong> de abajo para moverte en cualquier dirección.';
}

// ---------- joystick analógico (soporta las 8 direcciones, incluidas diagonales) ----------
// joyVec.x / joyVec.y van de -1 a 1 y se suman al movimiento del teclado.
const joyVec = { x: 0, y: 0 };
const joyBase = document.getElementById('joystickBase');
const joyStick = document.getElementById('joystickStick');
let joyTouchId = null;

function joyReset() {
  joyVec.x = 0;
  joyVec.y = 0;
  joyStick.style.transform = 'translate(0px, 0px)';
  joyStick.classList.remove('active');
  joyTouchId = null;
}

function joyUpdateFromPoint(clientX, clientY) {
  const rect = joyBase.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxR = rect.width / 2 - 8;

  let dx = clientX - cx;
  let dy = clientY - cy;
  const len = Math.hypot(dx, dy);
  if (len > maxR) {
    dx = (dx / len) * maxR;
    dy = (dy / len) * maxR;
  }
  joyStick.style.transform = `translate(${dx}px, ${dy}px)`;
  joyStick.classList.add('active');

  // deadzone pequeña para evitar que tiemble estando quieto
  const dead = 0.12;
  let nx = dx / maxR;
  let ny = dy / maxR;
  if (Math.hypot(nx, ny) < dead) { nx = 0; ny = 0; }
  joyVec.x = nx;
  joyVec.y = ny;
}

joyBase.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  joyTouchId = t.identifier;
  joyUpdateFromPoint(t.clientX, t.clientY);
}, { passive: false });

joyBase.addEventListener('touchmove', e => {
  for (const t of e.changedTouches) {
    if (t.identifier === joyTouchId) {
      e.preventDefault();
      joyUpdateFromPoint(t.clientX, t.clientY);
    }
  }
}, { passive: false });

function joyTouchEnd(e) {
  for (const t of e.changedTouches) {
    if (t.identifier === joyTouchId) joyReset();
  }
}
joyBase.addEventListener('touchend', joyTouchEnd);
joyBase.addEventListener('touchcancel', joyTouchEnd);

// también funciona con mouse (útil para probarlo en escritorio)
let joyMouseDown = false;
joyBase.addEventListener('mousedown', e => {
  joyMouseDown = true;
  joyUpdateFromPoint(e.clientX, e.clientY);
});
window.addEventListener('mousemove', e => {
  if (joyMouseDown) joyUpdateFromPoint(e.clientX, e.clientY);
});
window.addEventListener('mouseup', () => {
  if (joyMouseDown) { joyMouseDown = false; joyReset(); }
});

// ---------- flores ----------
let flowers = [];
const DECOY_COLORS = ['pink', 'purple', 'white', 'orange'];

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function placeFlowers() {
  flowers = [];
  const margin = 36;
  const minGap = 42;
  const total = FLORES_AMARILLAS + FLORES_DECORATIVAS;
  const types = [];
  for (let i = 0; i < FLORES_AMARILLAS; i++) types.push('yellow');
  for (let i = 0; i < FLORES_DECORATIVAS; i++) {
    types.push(DECOY_COLORS[Math.floor(Math.random() * DECOY_COLORS.length)]);
  }

  types.forEach(color => {
    let pos, attempts = 0;
    do {
      pos = {
        x: margin + Math.random() * (W - margin * 2),
        y: margin + 50 + Math.random() * (H - margin * 2 - 60),
      };
      attempts++;
    } while (
      attempts < 40 &&
      (dist(pos, player) < 80 || flowers.some(f => dist(pos, f) < minGap))
    );
    flowers.push({ x: pos.x, y: pos.y, color, collected: false, popT: 0 });
  });
}

// ---------- HUD ramo ----------
let found = 0;
function buildBouquetTrack() {
  bouquetTrack.innerHTML = '';
  for (let i = 0; i < FLORES_AMARILLAS; i++) {
    const slot = document.createElement('div');
    slot.className = 'bouquet-slot';
    bouquetTrack.appendChild(slot);
  }
}
function updateHud() {
  foundEl.textContent = found;
  const slots = bouquetTrack.children;
  for (let i = 0; i < slots.length; i++) {
    slots[i].classList.toggle('filled', i < found);
  }
}

// ---------- loop ----------
let last = performance.now();
let gameOver = false;

function update(dt) {
  if (gameOver) return;

  // teclado: vector discreto de 8 direcciones
  let dx = 0, dy = 0;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;

  // joystick: vector analógico continuo (se suma al del teclado)
  dx += joyVec.x;
  dy += joyVec.y;

  const rawLen = Math.hypot(dx, dy);
  player.moving = rawLen > 0.05;

  if (player.moving) {
    // solo normalizamos si el vector combinado supera 1 (para que el
    // joystick permita velocidad variable en vez de ir siempre a tope)
    const len = Math.max(rawLen, 1);
    dx /= len; dy /= len;
    player.x += dx * player.speed * dt;
    player.y += dy * player.speed * dt;

    if (Math.abs(dx) > Math.abs(dy)) {
      player.dir = dx > 0 ? 'right' : 'left';
    } else if (dy !== 0) {
      player.dir = dy > 0 ? 'down' : 'up';
    }

    player.animTimer += dt;
    if (player.animTimer > 0.16) {
      player.animTimer = 0;
      player.frame = player.frame === 0 ? 1 : 0;
    }
  } else {
    player.frame = 0;
  }

  const half = player.size / 2;
  player.x = Math.max(half, Math.min(W - half, player.x));
  player.y = Math.max(half + 30, Math.min(H - half, player.y));

  // colisiones con flores
  flowers.forEach(f => {
    if (f.collected) return;
    if (dist(player, f) < 30) {
      if (f.color === 'yellow') {
        f.collected = true;
        f.popT = 0.001;
        found++;
        updateHud();
        if (found === FLORES_AMARILLAS) {
          gameOver = true;
          setTimeout(showWin, 500);
        }
      } else {
        f.wiggleT = 0.001;
      }
    }
  });
}

function drawFlower(f) {
  const img = images['flower_' + f.color];
  const size = 26;
  ctx.save();
  ctx.translate(f.x, f.y);
  if (f.popT) {
    f.popT += 1 / 60;
    const s = Math.max(0, 1 - f.popT * 3.2);
    ctx.globalAlpha = s;
    ctx.scale(1 + f.popT, 1 + f.popT);
  }
  if (f.wiggleT) {
    f.wiggleT += 1 / 60;
    const w = Math.sin(f.wiggleT * 40) * 0.15;
    ctx.rotate(w);
    if (f.wiggleT > 0.3) f.wiggleT = 0;
  }
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawPlayer() {
  let key;
  if (player.dir === 'left') key = `char_left_${player.frame}`;
  else if (player.dir === 'right') key = `char_left_${player.frame}`; // se espeja
  else key = `char_${player.dir}_${player.frame}`;

  const img = images[key];
  const w = player.size, h = player.size * 1.35;
  ctx.save();
  ctx.translate(player.x, player.y - h / 2 + player.size / 2);
  // sombra
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.ellipse(0, h / 2 - 4, w / 2.4, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.globalAlpha = 1;

  if (player.dir === 'right') {
    ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else {
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  }
  ctx.restore();
}

function render() {
  ctx.drawImage(bgCanvas, 0, 0);
  flowers
    .slice()
    .sort((a, b) => a.y - b.y)
    .forEach(f => {
      if (f.collected && !f.popT) return;
      if (f.collected && f.popT > 0.3) return;
      drawFlower(f);
    });
  drawPlayer();
}

function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

// ---------- ramo final ----------
function drawBouquet() {
  bctx.clearRect(0, 0, bouquetCanvas.width, bouquetCanvas.height);
  const cx = bouquetCanvas.width / 2;
  const knot = bouquetCanvas.height - 26; // punto donde se atan los tallos
  const n = FLORES_AMARILLAS;

  const heads = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / (n - 1) - 0.5) * 1.05;   // abanico más cerrado
    const r = 48 + (i % 2 === 0 ? 0 : 6);        // dos alturas para dar volumen
    const x = cx + Math.sin(angle) * r;
    const y = knot - Math.cos(angle) * r - 6;
    heads.push({ x, y, angle });
  }

  // tallos convergiendo hacia el nudo del lazo
  bctx.strokeStyle = '#4a9140';
  bctx.lineWidth = 3;
  heads.forEach(h => {
    bctx.beginPath();
    bctx.moveTo(cx, knot);
    bctx.quadraticCurveTo((h.x + cx) / 2, (h.y + knot) / 2 + 10, h.x, h.y + 8);
    bctx.stroke();
  });

  // cabezas de flores
  heads.forEach(h => {
    bctx.save();
    bctx.translate(h.x, h.y);
    bctx.rotate(h.angle * 0.35);
    bctx.drawImage(images.flower_yellow, -15, -15, 30, 30);
    bctx.restore();
  });

  // lazo sobre el nudo
  bctx.drawImage(images.bow, cx - 22, knot - 14, 44, 34);
}

// ---------- confeti ----------
function launchConfetti() {
  const colors = ['#ffd93d', '#f2a9d8', '#58b24c', '#ff9c5a', '#b98fe0'];
  confettiContainer.innerHTML = '';
  for (let i = 0; i < 130; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2.2 + Math.random() * 2) + 's';
    piece.style.animationDelay = (Math.random() * 1.2) + 's';
    confettiContainer.appendChild(piece);
  }
  setTimeout(() => { confettiContainer.innerHTML = ''; }, 5500);
}

function showWin() {
  drawBouquet();
  overlay.classList.remove('hidden');
  launchConfetti();
}

function resetGame() {
  found = 0;
  gameOver = false;
  player.x = W / 2;
  player.y = H / 2;
  updateHud();
  placeFlowers();
  overlay.classList.add('hidden');
}

replayBtn.addEventListener('click', resetGame);

// ---------- arranque ----------
buildBouquetTrack();
buildBackground();
preload(() => {
  placeFlowers();
  updateHud();
  requestAnimationFrame(t => { last = t; requestAnimationFrame(loop); });
});
