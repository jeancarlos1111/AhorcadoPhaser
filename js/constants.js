export const C_YELLOW  = 0xFCE300;
export const C_BLUE    = 0x0038A8;
export const C_RED     = 0xCE1126;
export const C_BG      = 0xFDF5E6;
export const C_TEXT    = 0x1A1A2A;

// ── Mobile Game Style Palette ─────────────────────────────────
export const C_SKY_TOP  = 0x5BB8F5;   // Sky blue (top)
export const C_SKY_BOT  = 0xC4E8FA;   // Sky light (bottom)
export const C_GRASS    = 0x5CB85C;   // Grass green
export const C_GRASS_D  = 0x388E3C;   // Grass dark
export const C_ROCK_T   = 0xC04A1A;   // Rock terracotta
export const C_ROCK_D   = 0x8B3A0F;   // Rock dark

/**
 * Draws the illustrated cartoon background (sky, canyon rocks, clouds, grass).
 * Shared between LanguageScene and GameScene for visual consistency.
 * @param {Phaser.GameObjects.Graphics} g
 * @param {number} W - Scene width
 * @param {number} H - Scene height
 */
export function drawSceneBackground(g, W, H) {
  g.clear();

  // ── Sky gradient ──────────────────────────────────────────
  g.fillGradientStyle(C_SKY_TOP, C_SKY_TOP, C_SKY_BOT, C_SKY_BOT, 1);
  g.fillRect(0, 0, W, H);

  // Adaptive canyon wall width (scales with screen, max 130px per side)
  const rw = Math.min(130, W * 0.26);

  // ── Left canyon wall (irregular polygon, not a rectangle) ─
  // Dark base layer (widest silhouette)
  g.fillStyle(C_ROCK_D, 1);
  g.fillPoints([
    { x: -10, y: 0 },
    { x: rw * 1.00, y: 0 },
    { x: rw * 0.92, y: H * 0.14 },
    { x: rw * 1.06, y: H * 0.31 },
    { x: rw * 0.88, y: H * 0.47 },
    { x: rw * 1.03, y: H * 0.63 },
    { x: rw * 0.86, y: H * 0.79 },
    { x: rw * 0.97, y: H },
    { x: -10,       y: H },
  ], true, true);

  // Mid-tone face
  g.fillStyle(C_ROCK_T, 1);
  g.fillPoints([
    { x: -10, y: 0 },
    { x: rw * 0.78, y: 0 },
    { x: rw * 0.71, y: H * 0.16 },
    { x: rw * 0.85, y: H * 0.33 },
    { x: rw * 0.69, y: H * 0.49 },
    { x: rw * 0.81, y: H * 0.65 },
    { x: rw * 0.67, y: H * 0.81 },
    { x: rw * 0.76, y: H },
    { x: -10,       y: H },
  ], true, true);

  // Light highlight face
  g.fillStyle(0xD4561E, 1);
  g.fillPoints([
    { x: -10, y: 0 },
    { x: rw * 0.56, y: 0 },
    { x: rw * 0.50, y: H * 0.18 },
    { x: rw * 0.62, y: H * 0.35 },
    { x: rw * 0.48, y: H * 0.51 },
    { x: rw * 0.58, y: H * 0.67 },
    { x: rw * 0.46, y: H * 0.83 },
    { x: rw * 0.53, y: H },
    { x: -10,       y: H },
  ], true, true);

  // ── Right canyon wall (mirrored) ──────────────────────────
  g.fillStyle(C_ROCK_D, 1);
  g.fillPoints([
    { x: W + 10,        y: 0 },
    { x: W - rw * 1.00, y: 0 },
    { x: W - rw * 0.92, y: H * 0.14 },
    { x: W - rw * 1.06, y: H * 0.31 },
    { x: W - rw * 0.88, y: H * 0.47 },
    { x: W - rw * 1.03, y: H * 0.63 },
    { x: W - rw * 0.86, y: H * 0.79 },
    { x: W - rw * 0.97, y: H },
    { x: W + 10,        y: H },
  ], true, true);

  g.fillStyle(C_ROCK_T, 1);
  g.fillPoints([
    { x: W + 10,        y: 0 },
    { x: W - rw * 0.78, y: 0 },
    { x: W - rw * 0.71, y: H * 0.16 },
    { x: W - rw * 0.85, y: H * 0.33 },
    { x: W - rw * 0.69, y: H * 0.49 },
    { x: W - rw * 0.81, y: H * 0.65 },
    { x: W - rw * 0.67, y: H * 0.81 },
    { x: W - rw * 0.76, y: H },
    { x: W + 10,        y: H },
  ], true, true);

  g.fillStyle(0xD4561E, 1);
  g.fillPoints([
    { x: W + 10,        y: 0 },
    { x: W - rw * 0.56, y: 0 },
    { x: W - rw * 0.50, y: H * 0.18 },
    { x: W - rw * 0.62, y: H * 0.35 },
    { x: W - rw * 0.48, y: H * 0.51 },
    { x: W - rw * 0.58, y: H * 0.67 },
    { x: W - rw * 0.46, y: H * 0.83 },
    { x: W - rw * 0.53, y: H },
    { x: W + 10,        y: H },
  ], true, true);

  // ── Clouds (white fluffy ellipses) ────────────────────────
  g.fillStyle(0xFFFFFF, 0.93);
  const drawCloud = (cx, cy, size) => {
    g.fillEllipse(cx, cy, size, size * 0.50);
    g.fillEllipse(cx + size * 0.38, cy - size * 0.15, size * 0.72, size * 0.42);
    g.fillEllipse(cx - size * 0.32, cy + size * 0.06, size * 0.60, size * 0.36);
  };
  drawCloud(W * 0.28, H * 0.13, 105);
  drawCloud(W * 0.70, H * 0.09, 125);
  drawCloud(W * 0.50, H * 0.19, 72);

  // ── Grass hills at the bottom ─────────────────────────────
  g.fillStyle(0x66BB6A, 1);
  // Solid base to prevent any background gaps on the sides
  g.fillRect(0, H * 0.78, W, H * 0.22);
  g.fillEllipse(W / 2, H, W * 1.7, H * 0.45);
  g.fillStyle(C_GRASS, 1);
  g.fillEllipse(W * 0.28, H, W * 0.85, H * 0.35);
  g.fillStyle(0x81C784, 1);
  g.fillEllipse(W * 0.78, H, W * 0.75, H * 0.35);

  // ── Bushes ────────────────────────────────────────────────
  g.fillStyle(C_GRASS_D, 1);
  g.fillEllipse(W * 0.09, H * 0.90, 85, 52);
  g.fillEllipse(W * 0.20, H * 0.93, 60, 38);
  g.fillStyle(0x43A047, 1);
  g.fillEllipse(W * 0.84, H * 0.88, 95, 58);
  g.fillEllipse(W * 0.93, H * 0.92, 62, 40);
}


// ── All word banks ───────────────────────────────────────────
export const ALL_WORD_BANKS = {
  es: {
    flag: '🇪🇸', name: 'Español',
    ui: { lives: 'Vidas', attempts: 'Intentos', word: 'Palabra', letters: 'letras', changeLang: '🌐 Cambiar', wrongLetters: 'Letras Incorrectas:', hintBtn: '💡 Pista (−1)', hintUsed: '💡 Pista (usada)', restartBtn: '🔄 Reiniciar', hintNotice: 'Pista usada (−1 vida)', pressR: 'Toca aquí para jugar de nuevo', wordWas: 'Palabra:', youWin: '¡GANASTE!', youLose: '¡AHORCADO!', wordWasLabel: 'La palabra era:' },
    categories: {
      'Programación 💻': ['JAVASCRIPT', 'ALGORITMO', 'VARIABLE', 'FUNCION', 'OBJETO', 'SERVIDOR', 'INTERFAZ', 'BUCLE', 'DEPURAR', 'COMPILAR', 'TYPESCRIPT', 'FRAMEWORK'],
      'Animales 🦁':     ['ELEFANTE', 'JIRAFA', 'TORTUGA', 'DELFIN', 'AGUILA', 'MARIPOSA', 'COCODRILO', 'LEOPARDO', 'TIBURON', 'PINGUINO', 'ORANGUTAN'],
      'Países 🌍':       ['ARGENTINA', 'MEXICO', 'COLOMBIA', 'ESPANA', 'VENEZUELA', 'PERU', 'CHILE', 'ECUADOR', 'URUGUAY'],
      'Naturaleza 🌿':   ['MONTANA', 'OCEANO', 'VOLCAN', 'TORNADO', 'GALAXIA', 'CASCADA', 'DESIERTO', 'GLACIAR', 'SELVA'],
      'Deportes 🏅':    ['FUTBOL', 'BALONCESTO', 'NATACION', 'ATLETISMO', 'VOLEIBOL', 'CICLISMO', 'GIMNASIA', 'BEISBOL', 'TENIS'],
    },
  },
  en: {
    flag: '🇬🇧', name: 'English',
    ui: { lives: 'Lives', attempts: 'Attempts', word: 'Word', letters: 'letters', changeLang: '🌐 Change', wrongLetters: 'Wrong Letters:', hintBtn: '💡 Hint (−1)', hintUsed: '💡 Hint (used)', restartBtn: '🔄 Restart', hintNotice: 'Hint used (−1 life)', pressR: 'Tap here to play again', wordWas: 'Word:', youWin: 'YOU WIN!', youLose: 'HANGED!', wordWasLabel: 'The word was:' },
    categories: {
      'Programming 💻': ['ALGORITHM', 'VARIABLE', 'FUNCTION', 'OBJECT', 'SERVER', 'INTERFACE', 'LOOP', 'DEBUG', 'COMPILE', 'FRAMEWORK', 'TYPESCRIPT'],
      'Animals 🦁':     ['ELEPHANT', 'GIRAFFE', 'TURTLE', 'DOLPHIN', 'EAGLE', 'BUTTERFLY', 'CROCODILE', 'LEOPARD', 'SHARK', 'PENGUIN', 'PLATYPUS'],
      'Countries 🌍':   ['AUSTRALIA', 'CANADA', 'ENGLAND', 'SCOTLAND', 'IRELAND', 'DENMARK', 'NORWAY', 'FINLAND', 'BRAZIL', 'COLOMBIA'],
      'Nature 🌿':      ['MOUNTAIN', 'OCEAN', 'VOLCANO', 'TORNADO', 'GALAXY', 'WATERFALL', 'DESERT', 'GLACIER', 'RAINFOREST'],
      'Sports 🏅':      ['FOOTBALL', 'BASKETBALL', 'SWIMMING', 'ATHLETICS', 'VOLLEYBALL', 'CYCLING', 'GYMNASTICS', 'BASEBALL', 'TENNIS'],
    },
  },
  pt: {
    flag: '🇧🇷', name: 'Português',
    ui: { lives: 'Vidas', attempts: 'Tentativas', word: 'Palavra', letters: 'letras', changeLang: '🌐 Mudar', wrongLetters: 'Letras Erradas:', hintBtn: '💡 Dica (−1)', hintUsed: '💡 Dica (usada)', restartBtn: '🔄 Reiniciar', hintNotice: 'Dica usada (−1 vida)', pressR: 'Toque aqui para jogar de novo', wordWas: 'Palavra:', youWin: 'GANHOU!', youLose: 'ENFORCADO!', wordWasLabel: 'A palavra era:' },
    categories: {
      'Programação 💻': ['ALGORITMO', 'VARIAVEL', 'FUNCAO', 'OBJETO', 'SERVIDOR', 'INTERFACE', 'BUCLE', 'DEPURAR', 'COMPILAR', 'FRAMEWORK'],
      'Animais 🦁':     ['ELEFANTE', 'GIRAFA', 'TARTARUGA', 'GOLFINHO', 'AGUIA', 'BORBOLETA', 'CROCODILO', 'LEOPARDO', 'TUBARAO', 'PINGUIM'],
      'Países 🌍':      ['BRASIL', 'PORTUGAL', 'ANGOLA', 'MOCAMBIQUE', 'AUSTRALIA', 'CANADA', 'NORUEGA', 'ARGENTINA', 'COLOMBIA'],
      'Natureza 🌿':    ['MONTANHA', 'OCEANO', 'VULCAO', 'TORNADO', 'GALAXIA', 'CACHOEIRA', 'DESERTO', 'GLACIAR', 'FLORESTA'],
      'Esportes 🏅':    ['FUTEBOL', 'BASQUETE', 'NATACAO', 'ATLETISMO', 'VOLEIBOL', 'CICLISMO', 'GINASTICA', 'BEISEBOL', 'TENIS'],
    },
  },
};
