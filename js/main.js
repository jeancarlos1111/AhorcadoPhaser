import LanguageScene from './LanguageScene.js';
import GameScene from './GameScene.js';

const DPR = window.devicePixelRatio || 1;

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.NONE,
    width: window.innerWidth,
    height: window.innerHeight
  },
  backgroundColor: '#5BB8F5',
  resolution: DPR,
  parent: 'game-container',
  scene: [LanguageScene, GameScene],
});

window.addEventListener('resize', () => {
  if (window.game && window.game.scale) {
    window.game.scale.resize(window.innerWidth, window.innerHeight);
  }
});
