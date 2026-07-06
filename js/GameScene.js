import { ALL_WORD_BANKS, drawSceneBackground } from './constants.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    this.MAX_ATTEMPTS = 6;
    const langKey    = this.registry.get('language') || 'es';
    this.langData    = ALL_WORD_BANKS[langKey];
    this.ui          = this.langData.ui;

    this.initAudio();
    this._chooseWord();

    // Layers
    this.bgGfx  = this.add.graphics();
    this.topGfx = this.add.graphics();

    // Top bar — dark text for white card background
    this.topTitle = this.add.text(0, 0, 'AHORCADO', {
      fontSize: '20px', fontFamily: '"Orbitron", monospace',
      color: '#1A237E', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.langBtnBg = this.add.graphics(); // Pill bg drawn in resize()
    this.langBtn = this.add.text(0, 0, this.ui.changeLang, {
      fontSize: '12px', fontFamily: '"Exo 2", Arial',
      color: '#1A237E', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setInteractive({ cursor: 'pointer' });
    this.langBtn.on('pointerover', () => this.langBtn.setColor('#4CAF50'));
    this.langBtn.on('pointerout',  () => this.langBtn.setColor('#1A237E'));
    this.langBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(280, 91, 184, 245);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('LanguageScene'));
    });

    this.hearts = [];
    for (let i = 0; i < this.MAX_ATTEMPTS; i++)
      this.hearts.push(this.add.text(0, 0, '❤️', { fontSize: '17px' }).setOrigin(0.5));

    this.gallowsContainer = this.add.container(0, 0);
    this._createGallowsObjects();

    this.infoContainer = this.add.container(0, 0);
    this._createInfoObjects();

    this.wordContainer = this.add.container(0, 0);
    this._createWordObjects();

    this.kbContainer = this.add.container(0, 0);
    this._createKeyboardObjects();

    this.btnContainer = this.add.container(0, 0);
    this._createButtonObjects();

    this.overlayContainer = this.add.container(0, 0);
    this.overlayContainer.setDepth(100);

    this.scale.on('resize', this.resize, this);
    this.resize(this.scale.gameSize);

    this._setupKeyInput();
    this._updateHearts();

    this.cameras.main.fadeIn(400, 91, 184, 245);
  }

  // ── AUDIO ────────────────────────────────────────────────────
  initAudio() {
    try { this.sfx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    this.events.once('shutdown', () => { if (this.sfx) this.sfx.close().catch(() => {}); });
  }

  _tone(freq, wave, delay, dur, vol) {
    if (!this.sfx) return;
    if (this.sfx.state === 'suspended') this.sfx.resume();
    const o = this.sfx.createOscillator();
    const g = this.sfx.createGain();
    o.connect(g); g.connect(this.sfx.destination);
    o.type = wave || 'sine'; o.frequency.value = freq;
    const t = this.sfx.currentTime + (delay || 0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.25, t + 0.025);
    g.gain.exponentialRampToValueAtTime(0.001, t + (dur || 0.3));
    o.start(t); o.stop(t + (dur || 0.3) + 0.02);
  }

  playSound(type) {
    switch (type) {
      case 'click':   this._tone(700, 'sine', 0, 0.07, 0.12); break;
      case 'correct': this._tone(523,'sine',0,0.22,0.22); this._tone(659,'sine',0.08,0.26,0.2); this._tone(784,'sine',0.17,0.32,0.18); break;
      case 'wrong':   this._tone(200,'sawtooth',0,0.12,0.18); this._tone(130,'sawtooth',0.11,0.3,0.15); break;
      case 'win':     [523,659,784,1047].forEach((f,i) => this._tone(f,'sine',i*0.12,0.45,0.28)); this._tone(1047,'sine',0.54,0.75,0.22); break;
      case 'lose':    [330,262,220,165].forEach((f,i) => this._tone(f,'sawtooth',i*0.17,0.4,0.18)); break;
    }
  }

  // ── GAME SETUP ───────────────────────────────────────────────
  _chooseWord() {
    const cats   = Object.keys(this.langData.categories);
    this.category = cats[Phaser.Math.Between(0, cats.length - 1)];
    const words  = this.langData.categories[this.category];
    this.secret  = words[Phaser.Math.Between(0, words.length - 1)];
    this.revealed = Array(this.secret.length).fill('_');
    this.wrong   = [];
    this.attempts = 0;
    this.gameOver = false;
    this.hintUsed = false;
  }

  // ── GALLOWS ──────────────────────────────────────────────────
  _createGallowsObjects() {
    this.gCatTxt = this.add.text(80, -22, `📂 ${this.category}`, {
      fontSize: '12px', fontFamily: '"Exo 2", Arial',
      color: '#1A237E', fontStyle: 'bold',
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5);

    this.gBaseGfx = this.add.graphics();
    this.bp = {};
    ['head','body','leftArm','rightArm','leftLeg','rightLeg','eyeL','eyeR','mouth'].forEach(n => {
      this.bp[n] = this.add.graphics().setAlpha(0);
    });
    this.partOrder = ['head','body','leftArm','rightArm','leftLeg','rightLeg'];

    this.gallowsContainer.add([this.gCatTxt, this.gBaseGfx, ...Object.values(this.bp)]);
    this._drawGallowsBase();
  }

  _drawGallowsBase() {
    const g = this.gBaseGfx; g.clear();
    const ox = 0, oy = 0;
    // Lighter, more cartoon-like wood palette
    const WD = 0xA0714F, WL = 0xC89060, WH = 0xDEAA78;
    g.fillStyle(WD); g.fillRect(ox, oy+249, 150, 12);
    g.fillStyle(WL); g.fillRect(ox, oy+242, 150, 9);
    g.fillStyle(WH); g.fillRect(ox, oy+239, 150, 5);            // Base
    g.fillStyle(WD); g.fillRect(ox+44, oy, 13, 248);
    g.fillStyle(WL); g.fillRect(ox+38, oy, 12, 248);
    g.fillStyle(WH); g.fillRect(ox+35, oy, 4, 248);             // Post
    g.fillStyle(WD); g.fillRect(ox+38, oy+9, 126, 13);
    g.fillStyle(WL); g.fillRect(ox+38, oy, 126, 9);
    g.fillStyle(WH); g.fillRect(ox+38, oy-2, 126, 4);           // Beam
    g.lineStyle(7, WD, 1); g.lineBetween(ox+52, oy+44, ox+82, oy);
    g.lineStyle(5, WL, 1); g.lineBetween(ox+49, oy+41, ox+79, oy-2); // Brace
    g.lineStyle(3, 0xCCCCCC, 1); g.lineBetween(ox+160, oy, ox+160, oy+45);
    g.fillStyle(0xBBBBBB); g.fillCircle(ox+160, oy+46, 4);     // Rope
  }

  _drawPart(name) {
    const g = this.bp[name]; g.clear();
    const rx=160, rky=45, hr=22, hcy=rky+hr+3, bt=hcy+hr, bb=bt+60, ay=bt+16;
    const ink = 0x111122;
    switch (name) {
      case 'head':     g.fillStyle(0xFFD4A8); g.fillCircle(rx,hcy,hr); g.lineStyle(3,ink,1); g.strokeCircle(rx,hcy,hr); break;
      case 'body':     g.lineStyle(5,ink,1); g.lineBetween(rx,bt,rx,bb); break;
      case 'leftArm':  g.lineStyle(4,ink,1); g.lineBetween(rx,ay,rx-25,ay+25); break;
      case 'rightArm': g.lineStyle(4,ink,1); g.lineBetween(rx,ay,rx+25,ay+25); break;
      case 'leftLeg':  g.lineStyle(4,ink,1); g.lineBetween(rx,bb,rx-22,bb+35); break;
      case 'rightLeg': g.lineStyle(4,ink,1); g.lineBetween(rx,bb,rx+22,bb+35); break;
    }
  }

  _drawFace() {
    const dead=this.attempts>=this.MAX_ATTEMPTS, scared=this.attempts>=3;
    const rx=160, hcy=45+22+3, eOX=7, ey=hcy-5, eSz=2+(scared?1.5:0), mcy=hcy+7;
    const le=this.bp.eyeL; le.clear();
    const re=this.bp.eyeR; re.clear();
    const m=this.bp.mouth; m.clear();
    if (dead) {
      le.lineStyle(2,0x111,1); le.lineBetween(rx-eOX-4,ey-4,rx-eOX+4,ey+4); le.lineBetween(rx-eOX-4,ey+4,rx-eOX+4,ey-4);
      re.lineStyle(2,0x111,1); re.lineBetween(rx+eOX-4,ey-4,rx+eOX+4,ey+4); re.lineBetween(rx+eOX-4,ey+4,rx+eOX+4,ey-4);
      m.lineStyle(2,0x111,1); m.fillStyle(0x400); m.fillEllipse(rx,mcy+4,10,8); m.strokeEllipse(rx,mcy+4,10,8);
    } else {
      le.fillStyle(0x111); le.fillCircle(rx-eOX,ey,eSz);
      re.fillStyle(0x111); re.fillCircle(rx+eOX,ey,eSz);
      m.lineStyle(2,0x111,1);
      if (this.attempts>=4) { m.beginPath(); m.arc(rx,mcy,6,0,Math.PI,true); m.strokePath(); }
      else if (this.attempts>=2) { m.lineBetween(rx-6,mcy+2,rx+6,mcy+2); }
      else { m.beginPath(); m.arc(rx,mcy,6,0,Math.PI,false); m.strokePath(); }
    }
  }

  // ── CREATE OBJECTS ───────────────────────────────────────────
  _createInfoObjects() {
    // White card panel drawn once (position is container-relative)
    this.infoPanelGfx = this.add.graphics();
    this.infoPanelGfx.fillStyle(0x000000, 0.07);
    this.infoPanelGfx.fillRoundedRect(-157, -25, 314, 86, 12);
    this.infoPanelGfx.fillStyle(0xFFFFFF, 0.93);
    this.infoPanelGfx.fillRoundedRect(-155, -27, 310, 86, 12);

    this.statusTxt = this.add.text(0, 0, `${this.ui.attempts}: 0 / ${this.MAX_ATTEMPTS}`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#1A237E', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.wrongTxt = this.add.text(0, 22, `${this.ui.wrongLetters} —`, {
      fontSize: '13px', fontFamily: '"Orbitron", monospace', color: '#E53935', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.hintTxt = this.add.text(0, 44, '', {
      fontSize: '12px', fontFamily: 'Arial', color: '#F57C00',
    }).setOrigin(0.5);

    this.infoContainer.add([this.infoPanelGfx, this.statusTxt, this.wrongTxt, this.hintTxt]);
  }

  _createWordObjects() {
    this.boxes = [];
    for (let i = 0; i < this.secret.length; i++) {
      const bg  = this.add.graphics();
      const txt = this.add.text(0, 0, '', {
        fontSize: '22px', fontFamily: '"Orbitron", monospace',
        color: '#FFFFFF', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.wordContainer.add([bg, txt]);
      this.boxes.push({ bg, txt, letter: this.secret[i], isRev: false });
    }
    this.wordLenTxt = this.add.text(0, 46, `${this.ui.word}: ${this.secret.length} ${this.ui.letters}`, {
      fontSize: '11px', fontFamily: 'Arial', color: '#1A237E', fontStyle: 'bold',
      backgroundColor: 'rgba(255,255,255,0.90)',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5);
    this.wordContainer.add(this.wordLenTxt);
  }

  _createKeyboardObjects() {
    // White card panel behind all keys (added first = rendered behind)
    this.kbBgGfx = this.add.graphics();
    this.kbContainer.add(this.kbBgGfx);

    this.keys = {};
    const rows = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
    rows.forEach(row => {
      row.split('').forEach(l => {
        const bg  = this.add.graphics();
        const txt = this.add.text(0, 0, l, {
          fontSize: '15px', fontFamily: '"Exo 2", Arial',
          color: '#1A237E', fontStyle: 'bold',
        }).setOrigin(0.5);
        const z = this.add.rectangle(0, 0, 10, 10).setInteractive({ cursor: 'pointer' });
        z.on('pointerover',  () => { if (!this.keys[l].used) { this._paintKey(l,'hover');  this.tweens.add({ targets:txt, scale:1.12, duration:80 }); } });
        z.on('pointerout',   () => { if (!this.keys[l].used) { this._paintKey(l,'normal'); this.tweens.add({ targets:txt, scale:1,    duration:80 }); } });
        z.on('pointerdown',  () => { if (!this.gameOver && !this.keys[l].used) { this.playSound('click'); this._processLetter(l); } });
        this.kbContainer.add([bg, txt, z]);
        this.keys[l] = { bg, txt, z, used: false, state: 'normal' };
      });
    });
  }

  _createButtonObjects() {
    this.hHover = false;
    this.rHover = false;

    this.hBg  = this.add.graphics();
    this.hTxt = this.add.text(0, 0, this.ui.hintBtn, {
      fontSize: '14px', fontFamily: '"Exo 2", Arial',
      color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.hZone = this.add.rectangle(0, 0, 10, 10).setInteractive({ cursor: 'pointer' });
    this.hZone.on('pointerover',  () => { this.hHover = true;  this._layoutButtons(); });
    this.hZone.on('pointerout',   () => { this.hHover = false; this._layoutButtons(); });
    this.hZone.on('pointerdown',  () => { this.playSound('click'); this._useHint(); });

    this.rBg  = this.add.graphics();
    this.rTxt = this.add.text(0, 0, this.ui.restartBtn, {
      fontSize: '14px', fontFamily: '"Exo 2", Arial',
      color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.rZone = this.add.rectangle(0, 0, 10, 10).setInteractive({ cursor: 'pointer' });
    this.rZone.on('pointerover',  () => { this.rHover = true;  this._layoutButtons(); });
    this.rZone.on('pointerout',   () => { this.rHover = false; this._layoutButtons(); });
    this.rZone.on('pointerdown',  () => { this.playSound('click'); this._restart(); });

    this.btnContainer.add([this.hBg, this.hTxt, this.hZone, this.rBg, this.rTxt, this.rZone]);
  }

  // ── RESIZE / LAYOUT ──────────────────────────────────────────
  resize(gameSize) {
    const W = gameSize.width, H = gameSize.height;

    // Illustrated cartoon background
    drawSceneBackground(this.bgGfx, W, H);

    // White floating card — top bar
    this.topGfx.clear();
    this.topGfx.fillStyle(0x000000, 0.07);
    this.topGfx.fillRect(0, 4, W, 56);
    this.topGfx.fillStyle(0xFFFFFF, 1);
    this.topGfx.fillRect(0, 0, W, 57);
    this.topGfx.fillStyle(0xE0E0E0, 1);
    this.topGfx.fillRect(0, 56, W, 1);

    this.topTitle.setPosition(W / 2, 28);
    this.langBtn.setPosition(14, 28);
    // Draw pill background for langBtn
    const lbw = this.langBtn.width + 18, lbh = 26;
    this.langBtnBg.clear();
    this.langBtnBg.fillStyle(0xE3F2FD, 1);
    this.langBtnBg.fillRoundedRect(7, 28 - lbh / 2, lbw, lbh, 13);
    this.langBtnBg.lineStyle(1.5, 0x90CAF9, 1);
    this.langBtnBg.strokeRoundedRect(7, 28 - lbh / 2, lbw, lbh, 13);
    this.hearts.forEach((h, i) =>
      h.setPosition(W - 16 - (this.MAX_ATTEMPTS - 1 - i) * 22, 28)
    );

    const isLand = W > H && W > 600;
    let gx, gy, ix, iy, wx, wy, kx, ky, bx, by, kbW;

    if (isLand) {
      const leftW  = Math.min(W * 0.45, 450);
      const rightW = W - leftW;

      this.gallowsContainer.setScale(1);
      this.infoContainer.setScale(1);
      this.wordContainer.setScale(1);
      this.kbContainer.setScale(1);
      this.btnContainer.setScale(1);

      gx = leftW / 2 - 80;
      gy = Math.max(90, H / 2 - 160);
      ix = leftW / 2;
      iy = gy + 295;
      kbW = Math.min(rightW - 40, 500);
      wx = leftW + rightW / 2;
      wy = Math.max(90, H * 0.2);
      kx = wx;  ky = wy + 95;
      bx = wx;  by = ky + 172;
    } else {
      const gallowsH = 290, infoH = 72, wordH = 72, kbH = 158, btnH = 60;
      const totalNatH = gallowsH + infoH + wordH + kbH + btnH;
      const availH = H - 60;
      let scale = 1;
      if (availH < totalNatH) scale = Math.max(0.4, availH / totalNatH);

      this.gallowsContainer.setScale(scale);
      this.infoContainer.setScale(scale);
      this.wordContainer.setScale(scale);
      this.kbContainer.setScale(scale);
      this.btnContainer.setScale(scale);

      const extraSpace = Math.max(0, availH - (totalNatH * scale));
      const gap = extraSpace / 6;
      let curY = 62 + gap;

      gx = W / 2 - (80 * scale); gy = curY + (25 * scale);
      curY += (gallowsH * scale) + gap;
      ix = W / 2; iy = curY + (10 * scale);
      curY += (infoH * scale) + gap;
      wx = W / 2; wy = curY + (25 * scale);
      curY += (wordH * scale) + gap;
      kx = W / 2; ky = curY;
      curY += (kbH * scale) + gap;
      bx = W / 2; by = curY + (25 * scale);
      kbW = Math.min(W - 10, 500) / scale;
    }

    this.gallowsContainer.setPosition(gx, gy);
    this.infoContainer.setPosition(ix, iy);
    this.wordContainer.setPosition(wx, wy);
    this._layoutWordBoxes(kbW);
    this.kbContainer.setPosition(kx, ky);
    this._layoutKeyboard(kbW);
    this.btnContainer.setPosition(bx, by);
    this._layoutButtons();

    if (this.gameOverOverlay) {
      this.overlayContainer.setPosition(W / 2, H / 2);
      this._drawOverlayBg(W, H);
    }
  }

  // ── WORD BOXES ───────────────────────────────────────────────
  _layoutWordBoxes(availW) {
    const wlen = this.secret.length;
    const bh = 44, gap = 6;
    const bw = Math.max(20, Math.min(40, Math.floor((availW - gap * (wlen - 1)) / wlen)));
    const totalW = wlen * bw + gap * (wlen - 1);
    const sx = -totalW / 2;

    this.boxes.forEach((b, i) => {
      const bx = sx + i * (bw + gap);
      b.x = bx; b.y = -bh / 2; b.w = bw; b.h = bh;
      b.txt.setPosition(bx + bw / 2, 0);
      this._drawBox(b);
    });
    this.wordLenTxt.setPosition(0, bh / 2 + 14);
  }

  _drawBox(b) {
    b.bg.clear();
    const r = 10;
    if (b.isErr) {
      // Error box: pink / red
      b.bg.fillStyle(0x000000, 0.10); b.bg.fillRoundedRect(b.x+2, b.y+4, b.w, b.h, r);
      b.bg.fillStyle(0xFFCDD2, 1);    b.bg.fillRoundedRect(b.x,   b.y,   b.w, b.h, r);
      b.bg.lineStyle(2, 0xEF5350, 1); b.bg.strokeRoundedRect(b.x, b.y,   b.w, b.h, r);
    } else if (b.isRev) {
      // Revealed correct: dark navy
      b.bg.fillStyle(0x000000, 0.18); b.bg.fillRoundedRect(b.x+2, b.y+4, b.w, b.h, r);
      b.bg.fillStyle(0x1A237E, 1);    b.bg.fillRoundedRect(b.x,   b.y,   b.w, b.h, r);
      // Top shine
      b.bg.fillStyle(0xFFFFFF, 0.12);
      b.bg.fillRoundedRect(b.x+3, b.y+3, b.w-6, b.h*0.4, b.h*0.2);
    } else {
      // Normal: light sky-blue tint with matching border (game-like)
      b.bg.fillStyle(0x000000, 0.10); b.bg.fillRoundedRect(b.x+2, b.y+4, b.w, b.h, r);
      b.bg.fillStyle(0xECF4FF, 1);    b.bg.fillRoundedRect(b.x,   b.y,   b.w, b.h, r);
      b.bg.lineStyle(2, 0x90CAF9, 1); b.bg.strokeRoundedRect(b.x, b.y,   b.w, b.h, r);
    }
  }

  // ── KEYBOARD ─────────────────────────────────────────────────
  _layoutKeyboard(availW) {
    const rows = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
    const kh = 44, kgap = 6;
    const kw = Math.floor((availW - 9 * kgap) / 10);

    rows.forEach((row, ri) => {
      const rowW = row.length * (kw + kgap) - kgap;
      const sx = -rowW / 2;
      const ky = ri * (kh + kgap);
      row.split('').forEach((l, ci) => {
        const k = this.keys[l];
        k.x = sx + ci*(kw+kgap); k.y = ky; k.w = kw; k.h = kh;
        k.z.setPosition(k.x + kw/2, k.y + kh/2);
        k.z.setSize(kw, kh);
        k.txt.setPosition(k.x + kw/2, k.y + kh/2);
        this._paintKey(l, k.state);
      });
    });

    // White card panel behind all keys
    const numRows = rows.length;
    const panelW  = availW + 18;
    const panelH  = numRows * (kh + kgap) - kgap + 30;
    this.kbBgGfx.clear();
    this.kbBgGfx.fillStyle(0x000000, 0.07);
    this.kbBgGfx.fillRoundedRect(-panelW / 2 - 2, -16, panelW + 4, panelH + 4, 20);
    this.kbBgGfx.fillStyle(0xFFFFFF, 0.97);
    this.kbBgGfx.fillRoundedRect(-panelW / 2, -14, panelW, panelH, 18);
  }

  _paintKey(l, state) {
    const k = this.keys[l]; k.state = state;
    const g = k.bg; g.clear();
    const S = {
      normal:  { f:0xFFFFFF, sh:0xBBBBBB, tc:'#1A237E', bd:0xE0E0E0 },
      hover:   { f:0xF0F4FF, sh:0xAAAAAA, tc:'#1A237E', bd:0xC5CAE9 },
      correct: { f:0x4CAF50, sh:0x2E7D32, tc:'#FFFFFF', bd:0x388E3C },
      wrong:   { f:0xEF5350, sh:0xB71C1C, tc:'#FFFFFF', bd:0xE53935 },
      hint:    { f:0xFFA726, sh:0xE65100, tc:'#FFFFFF', bd:0xFB8C00 },
    };
    const s = S[state] || S.normal;
    const r = k.h * 0.42; // pill-like rounding
    // Shadow (pronounced bottom)
    g.fillStyle(s.sh, 1); g.fillRoundedRect(k.x, k.y+3, k.w, k.h, r);
    // Main fill
    g.fillStyle(s.f, 1);  g.fillRoundedRect(k.x, k.y,   k.w, k.h, r);
    // Top shine for normal/hover
    if (state === 'normal' || state === 'hover') {
      g.fillStyle(0xFFFFFF, 0.5);
      g.fillRoundedRect(k.x+2, k.y+2, k.w-4, k.h*0.4, k.h*0.2);
    }
    k.txt.setColor(s.tc);
  }

  // ── BUTTONS ──────────────────────────────────────────────────
  _layoutButtons() {
    const bw=150, bh=46, gap=14;

    // Hint button (green / grey when used)
    const hx = -bw/2 - gap/2;
    this.hTxt.setPosition(hx, -1);
    this.hZone.setPosition(hx, 0); this.hZone.setSize(bw, bh);
    if (this.hintUsed) {
      this._paintBtn(this.hBg, hx-bw/2, -bh/2, bw, bh, 0xBDBDBD, 0x9E9E9E);
    } else {
      this._paintBtn(this.hBg, hx-bw/2, -bh/2, bw, bh, this.hHover ? 0x66BB6A : 0x4CAF50, 0x1B5E20);
    }
    this.hTxt.setColor('#FFFFFF');

    // Restart button (red)
    const rx = bw/2 + gap/2;
    this.rTxt.setPosition(rx, -1);
    this.rZone.setPosition(rx, 0); this.rZone.setSize(bw, bh);
    this._paintBtn(this.rBg, rx-bw/2, -bh/2, bw, bh, this.rHover ? 0xEF5350 : 0xE53935, 0x7F0000);
    this.rTxt.setColor('#FFFFFF');
  }

  _paintBtn(g, x, y, w, h, fillColor, shadowColor) {
    g.clear();
    const r = h * 0.42;
    // Pronounced bottom shadow
    g.fillStyle(shadowColor, 1); g.fillRoundedRect(x, y+5, w, h, r);
    // Main button face
    g.fillStyle(fillColor, 1);   g.fillRoundedRect(x, y, w, h, r);
    // Top shine highlight
    g.fillStyle(0xFFFFFF, 0.22);
    g.fillRoundedRect(x+3, y+3, w-6, h*0.4, h*0.2);
  }

  // ── GAME LOGIC ───────────────────────────────────────────────
  _processLetter(letter) {
    if (this.gameOver) return;
    if (this.revealed.includes(letter) || this.wrong.includes(letter)) return;
    const key = this.keys[letter];
    if (!key || key.used) return;
    key.used = true;

    if (this.secret.includes(letter)) {
      this.playSound('correct');
      const indices = [];
      for (let i = 0; i < this.secret.length; i++)
        if (this.secret[i] === letter) { this.revealed[i] = letter; indices.push(i); }
      this._paintKey(letter, 'correct');
      indices.forEach((idx, d) => this.time.delayedCall(d * 90, () => this._revealBox(idx)));
      if (!this.revealed.includes('_')) this.time.delayedCall(700, () => this._endGame(true));
    } else {
      this.playSound('wrong');
      this.wrong.push(letter); this.attempts++;
      this._paintKey(letter, 'wrong');
      this.statusTxt.setText(`${this.ui.attempts}: ${this.attempts} / ${this.MAX_ATTEMPTS}`);
      this.wrongTxt.setText(`${this.ui.wrongLetters} ${this.wrong.join(' ')}`);
      this._updateHearts();
      this._showNextBodyPart();
      this.cameras.main.shake(150, 0.005);
      if (this.attempts >= this.MAX_ATTEMPTS) this.time.delayedCall(820, () => this._endGame(false));
    }
  }

  _useHint() {
    if (this.gameOver || this.hintUsed) return;
    const unrev = [];
    for (let i = 0; i < this.secret.length; i++) if (this.revealed[i] === '_') unrev.push(i);
    if (unrev.length === 0) return;

    this.hintUsed = true;
    this.hTxt.setText(this.ui.hintUsed);
    this._layoutButtons();

    const idx    = unrev[Phaser.Math.Between(0, unrev.length - 1)];
    const letter = this.secret[idx];
    this.attempts++;
    this._updateHearts();
    this._showNextBodyPart();
    this.cameras.main.shake(120, 0.004);

    for (let i = 0; i < this.secret.length; i++)
      if (this.secret[i] === letter) { this.revealed[i] = letter; this._revealBox(i); }
    if (this.keys[letter]) { this.keys[letter].used = true; this._paintKey(letter, 'hint'); }
    this.hintTxt.setText(this.ui.hintNotice);

    if (!this.revealed.includes('_')) this.time.delayedCall(700, () => this._endGame(true));
    else if (this.attempts >= this.MAX_ATTEMPTS) this.time.delayedCall(820, () => this._endGame(false));
  }

  _revealBox(index, isError = false) {
    const b = this.boxes[index];
    b.txt.setText(this.secret[index]);
    b.isRev = !isError; b.isErr = isError;
    this._drawBox(b);
    b.txt.setColor(isError ? '#C62828' : '#FFFFFF');
    b.txt.setScale(0);
    this.tweens.add({ targets: b.txt, scale: 1, duration: 320, ease: 'Back.easeOut' });
  }

  _showNextBodyPart() {
    const name = this.partOrder[this.attempts - 1];
    if (!name) return;
    this._drawPart(name);
    this.tweens.add({ targets: this.bp[name], alpha: 1, duration: 400 });
    if (this.attempts >= 1) {
      this._drawFace();
      this.bp.eyeL.setAlpha(1); this.bp.eyeR.setAlpha(1); this.bp.mouth.setAlpha(1);
    }
  }

  _updateHearts() {
    this.hearts.forEach((h, i) => {
      const active = i < (this.MAX_ATTEMPTS - this.attempts);
      h.setText(active ? '❤️' : '🖤');
      h.setAlpha(active ? 1 : 0.4);
      if (!active) this.tweens.add({ targets: h, scale: 1.5, duration: 100, yoyo: true });
    });
  }

  _setupKeyInput() {
    this.input.keyboard.on('keydown', (e) => {
      if (e.key.toLowerCase() === 'r') { this.playSound('click'); this._restart(); return; }
      const l = e.key.toUpperCase();
      if (l === 'Ñ' || (l.length === 1 && l >= 'A' && l <= 'Z')) this._processLetter(l);
    });
  }

  _restart() {
    this.cameras.main.fadeOut(360, 91, 184, 245);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart());
  }

  // ── OVERLAYS ─────────────────────────────────────────────────
  _endGame(won) {
    this.gameOver = true;
    this.gameOverOverlay = true;
    this.overlayBg    = this.add.graphics();
    this.overlayPanel = this.add.graphics();

    this.oTitle = this.add.text(0, -55, won ? this.ui.youWin : this.ui.youLose, {
      fontSize: '36px', fontFamily: '"Orbitron"',
      color: won ? '#2E7D32' : '#C62828', fontStyle: 'bold',
      stroke: '#FFFFFF', strokeThickness: 5,
    }).setOrigin(0.5).setScale(0);

    this.oSub = this.add.text(0, 14, `${won ? this.ui.wordWas : this.ui.wordWasLabel}\n${this.secret}`, {
      fontSize: '22px', fontFamily: '"Exo 2"',
      color: won ? '#1A237E' : '#333', align: 'center', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    this.oHint = this.add.text(0, 76, this.ui.pressR, {
      fontSize: '13px', fontFamily: 'Arial', color: '#777',
    }).setOrigin(0.5).setAlpha(0);

    this.overlayContainer.add([this.overlayBg, this.overlayPanel, this.oTitle, this.oSub, this.oHint]);
    this.resize(this.scale.gameSize);

    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', () => { this.playSound('click'); this._restart(); });
    });

    if (won) {
      this.playSound('win');
      this.tweens.add({ targets: this.oTitle, scale: 1, duration: 560, ease: 'Back.easeOut' });
      this.tweens.add({ targets: [this.oSub, this.oHint], alpha: 1, duration: 700, delay: 460 });
      this.tweens.add({ targets: this.oTitle, y: '-=6', duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 600 });
      this._spawnConfetti();
    } else {
      this.playSound('lose');
      for (let i = 0; i < this.secret.length; i++)
        if (this.revealed[i] === '_') this.time.delayedCall(i * 80, () => this._revealBox(i, true));
      this._drawFace();
      this.tweens.add({ targets: [this.gBaseGfx, ...Object.values(this.bp)], x: 4, duration: 50, yoyo: true, repeat: 5, onComplete: () => { [this.gBaseGfx, ...Object.values(this.bp)].forEach(t => t.x = 0); } });
      this.time.delayedCall(700, () => {
        this.tweens.add({ targets: this.oTitle, scale: 1, duration: 600, ease: 'Back.easeOut' });
        this.tweens.add({ targets: [this.oSub, this.oHint], alpha: 1, duration: 700, delay: 500 });
        this.time.delayedCall(650, () => this.tweens.add({ targets: this.oTitle, x: '+=4', duration: 70, yoyo: true, repeat: 6, onComplete: () => this.oTitle.x = 0 }));
      });
    }
  }

  _drawOverlayBg(W, H) {
    this.overlayBg.clear();
    this.overlayBg.fillStyle(0x000000, 0.68);
    this.overlayBg.fillRect(-W/2, -H/2, W, H);

    this.overlayPanel.clear();
    // Card shadow
    this.overlayPanel.fillStyle(0x000000, 0.15); this.overlayPanel.fillRoundedRect(-164, -118, 328, 236, 22);
    // White card base
    this.overlayPanel.fillStyle(0xFFFFFF, 1);    this.overlayPanel.fillRoundedRect(-160, -120, 320, 240, 20);
    // Top colored header strip (height 40 ensures radius 20 renders perfectly without sharp artifacts)
    this.overlayPanel.fillStyle(0x1A237E, 1);    this.overlayPanel.fillRoundedRect(-160, -120, 320, 40, 20);
    // Mask the bottom 24px of the blue strip to leave exactly a 16px header
    this.overlayPanel.fillStyle(0xFFFFFF, 1);    this.overlayPanel.fillRect(-160, -104, 320, 24);
    // Border
    this.overlayPanel.lineStyle(2, 0xE0E0E0, 1); this.overlayPanel.strokeRoundedRect(-160, -120, 320, 240, 20);
  }

  _spawnConfetti() {
    const W = this.scale.gameSize.width, H = this.scale.gameSize.height;
    const palette = [0xFCE300, 0x4CAF50, 0xEF5350, 0x2196F3, 0xFF9800, 0x9C27B0, 0x00BCD4];
    for (let i = 0; i < 110; i++) {
      const c  = palette[Phaser.Math.Between(0, palette.length - 1)];
      const px = Phaser.Math.Between(20, W - 20);
      const py = Phaser.Math.Between(40, H - 40);
      const dot = this.add.graphics();
      dot.setPosition(W / 2, H / 2);
      if (Math.random() > 0.5) { dot.fillStyle(c,1); dot.fillCircle(0,0,Phaser.Math.Between(4,7)); }
      else { dot.fillStyle(c,1); dot.fillRect(-4,-4,8,8); }
      this.tweens.add({ targets: dot, x: px, y: py, alpha: 0, scale: 0.2, duration: Phaser.Math.Between(800, 2500), ease: 'Power2', onComplete: () => dot.destroy() });
    }
  }
}
