export const C_BG_TOP = 0x4facfe; // Vibrant light blue
export const C_BG_BOT = 0x00f2fe; // Cyan
export const C_GLASS_BG = 0xffffff; // White for panels
export const C_TEXT = 0x1e293b; // Dark slate
export const C_PRIMARY = 0x3b82f6; // Bright blue for accents
export const C_SUCCESS = 0x10b981; // Vibrant Green
export const C_DANGER = 0xef4444; // Vibrant Red

/**
 * Draws a premium vibrant light gradient background.
 * @param {Phaser.GameObjects.Graphics} g
 * @param {number} W
 * @param {number} H
 */
export function drawSceneBackground(g, W, H) {
  g.clear();
  g.fillGradientStyle(C_BG_TOP, C_BG_TOP, C_BG_BOT, C_BG_BOT, 1);
  g.fillRect(0, 0, W, H);
}

/**
 * Utility to draw a Glassmorphism panel (Premium Light).
 * @param {Phaser.GameObjects.Graphics} g
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} radius
 * @param {number} alpha (opacity of the white background)
 */
export function drawGlassPanel(g, x, y, w, h, radius = 16, alpha = 0.9) {
  g.clear();

  // Soft drop shadow (simulated with multiple passes for softness)
  g.fillStyle(0x004488, 0.05);
  g.fillRoundedRect(x + 2, y + 4, w, h, radius);
  g.fillStyle(0x004488, 0.03);
  g.fillRoundedRect(x + 4, y + 8, w, h, radius);

  // Base glass
  g.fillStyle(C_GLASS_BG, alpha);
  g.fillRoundedRect(x, y, w, h, radius);

  // Top-left shine (border)
  g.lineStyle(2, 0xffffff, 0.8);
  g.strokeRoundedRect(x, y, w, h, radius);
}

// ── All word banks ───────────────────────────────────────────
export const ALL_WORD_BANKS = {
  es: {
    flag: "🇪🇸",
    name: "Español",
    ui: {
      lives: "Vidas",
      attempts: "Intentos",
      word: "Palabra",
      letters: "letras",
      changeLang: "🌐 Cambiar",
      wrongLetters: "Letras Incorrectas:",
      hintBtn: "💡 Pista (−1)",
      hintUsed: "💡 Pista (usada)",
      restartBtn: "🔄 Reiniciar",
      hintNotice: "Pista usada (−1 vida)",
      pressR: "Toca aquí para jugar de nuevo",
      wordWas: "Palabra:",
      youWin: "¡GANASTE!",
      youLose: "¡AHORCADO!",
      wordWasLabel: "La palabra era:",
    },
    categories: {
      "Programación 💻": [
        "JAVASCRIPT",
        "ALGORITMO",
        "VARIABLE",
        "FUNCION",
        "OBJETO",
        "SERVIDOR",
        "INTERFAZ",
        "BUCLE",
        "DEPURAR",
        "COMPILAR",
        "TYPESCRIPT",
        "FRAMEWORK",
      ],
      "Animales 🦁": [
        "ELEFANTE",
        "JIRAFA",
        "TORTUGA",
        "DELFIN",
        "AGUILA",
        "MARIPOSA",
        "COCODRILO",
        "LEOPARDO",
        "TIBURON",
        "PINGUINO",
        "ORANGUTAN",
      ],
      "Países 🌍": [
        "ARGENTINA",
        "MEXICO",
        "COLOMBIA",
        "ESPAÑA",
        "VENEZUELA",
        "PERU",
        "CHILE",
        "ECUADOR",
        "URUGUAY",
      ],
      "Naturaleza 🌿": [
        "MONTANA",
        "OCEANO",
        "VOLCAN",
        "TORNADO",
        "GALAXIA",
        "CASCADA",
        "DESIERTO",
        "GLACIAR",
        "SELVA",
      ],
      "Deportes 🏅": [
        "FUTBOL",
        "BALONCESTO",
        "NATACION",
        "ATLETISMO",
        "VOLEIBOL",
        "CICLISMO",
        "GIMNASIA",
        "BEISBOL",
        "TENIS",
      ],
    },
  },
  en: {
    flag: "🇬🇧",
    name: "English",
    ui: {
      lives: "Lives",
      attempts: "Attempts",
      word: "Word",
      letters: "letters",
      changeLang: "🌐 Change",
      wrongLetters: "Wrong Letters:",
      hintBtn: "💡 Hint (−1)",
      hintUsed: "💡 Hint (used)",
      restartBtn: "🔄 Restart",
      hintNotice: "Hint used (−1 life)",
      pressR: "Tap here to play again",
      wordWas: "Word:",
      youWin: "YOU WIN!",
      youLose: "HANGED!",
      wordWasLabel: "The word was:",
    },
    categories: {
      "Programming 💻": [
        "ALGORITHM",
        "VARIABLE",
        "FUNCTION",
        "OBJECT",
        "SERVER",
        "INTERFACE",
        "LOOP",
        "DEBUG",
        "COMPILE",
        "FRAMEWORK",
        "TYPESCRIPT",
      ],
      "Animals 🦁": [
        "ELEPHANT",
        "GIRAFFE",
        "TURTLE",
        "DOLPHIN",
        "EAGLE",
        "BUTTERFLY",
        "CROCODILE",
        "LEOPARD",
        "SHARK",
        "PENGUIN",
        "PLATYPUS",
      ],
      "Countries 🌍": [
        "AUSTRALIA",
        "CANADA",
        "ENGLAND",
        "SCOTLAND",
        "IRELAND",
        "DENMARK",
        "NORWAY",
        "FINLAND",
        "BRAZIL",
        "COLOMBIA",
      ],
      "Nature 🌿": [
        "MOUNTAIN",
        "OCEAN",
        "VOLCANO",
        "TORNADO",
        "GALAXY",
        "WATERFALL",
        "DESERT",
        "GLACIER",
        "RAINFOREST",
      ],
      "Sports 🏅": [
        "FOOTBALL",
        "BASKETBALL",
        "SWIMMING",
        "ATHLETICS",
        "VOLLEYBALL",
        "CYCLING",
        "GYMNASTICS",
        "BASEBALL",
        "TENNIS",
      ],
    },
  },
  pt: {
    flag: "🇧🇷",
    name: "Português",
    ui: {
      lives: "Vidas",
      attempts: "Tentativas",
      word: "Palavra",
      letters: "letras",
      changeLang: "🌐 Mudar",
      wrongLetters: "Letras Erradas:",
      hintBtn: "💡 Dica (−1)",
      hintUsed: "💡 Dica (usada)",
      restartBtn: "🔄 Reiniciar",
      hintNotice: "Dica usada (−1 vida)",
      pressR: "Toque aqui para jogar de novo",
      wordWas: "Palavra:",
      youWin: "GANHOU!",
      youLose: "ENFORCADO!",
      wordWasLabel: "A palavra era:",
    },
    categories: {
      "Programação 💻": [
        "ALGORITMO",
        "VARIAVEL",
        "FUNCAO",
        "OBJETO",
        "SERVIDOR",
        "INTERFACE",
        "BUCLE",
        "DEPURAR",
        "COMPILAR",
        "FRAMEWORK",
      ],
      "Animais 🦁": [
        "ELEFANTE",
        "GIRAFA",
        "TARTARUGA",
        "GOLFINHO",
        "AGUIA",
        "BORBOLETA",
        "CROCODILO",
        "LEOPARDO",
        "TUBARAO",
        "PINGUIM",
      ],
      "Países 🌍": [
        "BRASIL",
        "PORTUGAL",
        "ANGOLA",
        "MOCAMBIQUE",
        "AUSTRALIA",
        "CANADA",
        "NORUEGA",
        "ARGENTINA",
        "COLOMBIA",
      ],
      "Natureza 🌿": [
        "MONTANHA",
        "OCEANO",
        "VULCAO",
        "TORNADO",
        "GALAXIA",
        "CACHOEIRA",
        "DESERTO",
        "GLACIAR",
        "FLORESTA",
      ],
      "Esportes 🏅": [
        "FUTEBOL",
        "BASQUETE",
        "NATACAO",
        "ATLETISMO",
        "VOLEIBOL",
        "CICLISMO",
        "GINASTICA",
        "BEISEBOL",
        "TENIS",
      ],
    },
  },
};
