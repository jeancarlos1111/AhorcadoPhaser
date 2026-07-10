import { drawSceneBackground, drawGlassPanel, C_TEXT, C_PRIMARY } from './constants.js';

export default class LanguageScene extends Phaser.Scene {
  constructor() { super({ key: 'LanguageScene' }); }

  create() {
    this.bg = this.add.graphics();

    // Title — dark text with neumorphic style
    this.titleShadow = this.add.text(0, 0, 'AHORCADO', {
      fontSize: '48px', fontFamily: '"Orbitron", monospace',
      color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.title = this.add.text(0, 0, 'AHORCADO', {
      fontSize: '48px', fontFamily: '"Orbitron", monospace',
      color: '#4A5568', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.subtitle = this.add.text(0, 0,
      'Elige tu idioma  ·  Choose language  ·  Escolha o idioma', {
      fontSize: '14px', fontFamily: '"Exo 2", Arial',
      color: '#FFFFFF', align: 'center',
    }).setOrigin(0.5);

    this.version = this.add.text(0, 0, 'v4.0 Premium Light', {
      fontSize: '11px', fontFamily: 'Arial', color: '#E2E8F0',
    }).setOrigin(0.5);

    // Language buttons
    this.btnGroup = [];
    const langs = [
      { key: 'es', flag: '🇪🇸', name: 'Español' },
      { key: 'en', flag: '🇬🇧', name: 'English' },
      { key: 'pt', flag: '🇧🇷', name: 'Português' },
    ];

    langs.forEach((lang) => {
      const g = this.add.graphics();
      const f = this.add.text(0, 0, lang.flag, { fontSize: '32px' }).setOrigin(0.5);
      const n = this.add.text(0, 0, lang.name, {
        fontSize: '22px', fontFamily: '"Exo 2", Arial',
        color: '#1E293B', fontStyle: 'bold',
      }).setOrigin(0.5);
      const z = this.add.rectangle(0, 0, 260, 72).setInteractive({ cursor: 'pointer' });

      z.on('pointerover', () => {
        this._paintLangBtn(g, 0, 0, 260, 72, true);
        this.tweens.add({ targets: [f, n], scale: 1.06, duration: 100 });
      });
      z.on('pointerout', () => {
        this._paintLangBtn(g, 0, 0, 260, 72, false);
        this.tweens.add({ targets: [f, n], scale: 1, duration: 100 });
      });
      z.on('pointerdown', () => {
        this.registry.set('language', lang.key);
        this.cameras.main.fadeOut(300, 79, 172, 254);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
      });

      this._paintLangBtn(g, 0, 0, 260, 72, false);
      this.btnGroup.push({ g, f, n, z });
    });

    this.scale.on('resize', this.resize, this);
    this.resize(this.scale.gameSize);

    this.cameras.main.fadeIn(400, 79, 172, 254);
  }

  _paintLangBtn(g, x, y, w, h, hover) {
    const cx = x - w / 2, cy = y - h / 2;
    drawGlassPanel(g, cx, cy, w, h, 16, hover ? 1 : 0.85);
  }

  resize(gameSize) {
    const W = gameSize.width, H = gameSize.height;
    const cx = W / 2, cy = H / 2;

    // Draw the shared neumorphic background
    drawSceneBackground(this.bg, W, H);

    const isLand = W > H;
    const titleY = isLand ? Math.max(55, cy - 185) : Math.max(82, cy - 240);

    this.tweens.killTweensOf(this.title);
    this.titleShadow.setPosition(cx - 2, titleY - 2); // Neumorphic light highlight effect
    this.title.setPosition(cx, titleY);
    this.tweens.add({
      targets: this.title,
      y: titleY - 8,
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.subtitle.setPosition(cx, titleY + 65);
    this.version.setPosition(cx, H - 20);

    const btnStartY = titleY + 148;
    this.btnGroup.forEach((btn, i) => {
      const by = btnStartY + i * 92;
      btn.g.setPosition(cx, by);
      btn.f.setPosition(cx - 82, by);
      btn.n.setPosition(cx + 18, by);
      btn.z.setPosition(cx, by);
      btn.z.setSize(260, 72);
    });
  }
}
