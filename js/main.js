import LanguageScene from './LanguageScene.js';
import GameScene from './GameScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
    zoom: 1 / (window.devicePixelRatio || 1)
  },
  backgroundColor: '#5BB8F5',
  resolution: window.devicePixelRatio || 1,
  parent: 'game-container',
  scene: [LanguageScene, GameScene],
});
