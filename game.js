const WORD_POOL_SIZE = 50000;
const START_LIVES = 3;

const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const livesEl = document.getElementById("lives");
const wordPoolEl = document.getElementById("wordPool");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const dictionary = buildWordPool(WORD_POOL_SIZE);
wordPoolEl.textContent = String(dictionary.length);

const state = {
  running: false,
  score: 0,
  level: 1,
  lives: START_LIVES,
  activeWords: [],
  targetWordId: null,
  typed: "",
  spawnTimer: 0,
  lastFrame: 0,
  nextId: 1,
};

function buildWordPool(size) {
  const easySyllables = [
    "ba", "be", "bi", "bo", "ca", "de", "do", "fa", "go", "ha", "ki", "la", "mi", "na", "pa", "ra", "so", "ta", "vi", "zo"
  ];
  const hardSyllables = [
    "tron", "glyph", "vector", "quant", "spect", "crypt", "vortex", "fract", "plasm", "strat", "nexus", "phase", "drift", "clast", "pulse"
  ];

  const words = new Set(["cat", "dog", "run", "jump", "star", "moon", "river", "light", "speed", "cloud"]);
  while (words.size < size) {
    const difficultyRoll = Math.random();
    const syllables = difficultyRoll < 0.55 ? easySyllables : hardSyllables;
    const pieces = difficultyRoll < 0.4 ? randInt(2, 3) : difficultyRoll < 0.8 ? randInt(2, 4) : randInt(3, 5);

    let candidate = "";
    for (let i = 0; i < pieces; i += 1) {
      candidate += syllables[randInt(0, syllables.length - 1)];
    }

    candidate = candidate.toLowerCase().replace(/[^a-z]/g, "");
    if (candidate.length >= 3 && candidate.length <= 16) {
      words.add(candidate);
    }
  }

  return Array.from(words);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWordByLevel(level) {
  if (level <= 1) {
    return randomWord((word) => word.length >= 3 && word.length <= 5);
  }
  if (level <= 3) {
    return randomWord((word) => word.length >= 4 && word.length <= 7);
  }
  if (level <= 6) {
    return randomWord((word) => word.length >= 5 && word.length <= 10);
  }
  return randomWord((word) => word.length >= 7);
}

function randomWord(predicate) {
  for (let tries = 0; tries < 250; tries += 1) {
    const candidate = dictionary[randInt(0, dictionary.length - 1)];
    if (predicate(candidate)) {
      return candidate;
    }
  }
  return dictionary[randInt(0, dictionary.length - 1)];
}

function getSpawnInterval(level) {
  return Math.max(350, 1400 - level * 90);
}

function getWordSpeed(level) {
  return 26 + level * 7;
}

function startGame() {
  resetGameData();
  state.running = true;
  statusEl.textContent = "RAVIR online. Type quickly — harder words unlock every level.";
  startBtn.disabled = true;
  restartBtn.disabled = false;
  state.lastFrame = performance.now();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  clearWords();
  startGame();
}

function resetGameData() {
  state.score = 0;
  state.level = 1;
  state.lives = START_LIVES;
  state.targetWordId = null;
  state.typed = "";
  state.spawnTimer = 0;
  state.activeWords = [];
  updateHud();
}

function clearWords() {
  gameArea.innerHTML = "";
}

function updateHud() {
  scoreEl.textContent = String(state.score);
  levelEl.textContent = String(state.level);
  livesEl.textContent = String(state.lives);
}

function gameLoop(now) {
  if (!state.running) {
    return;
  }

  const dt = (now - state.lastFrame) / 1000;
  state.lastFrame = now;

  state.spawnTimer += dt * 1000;
  if (state.spawnTimer >= getSpawnInterval(state.level)) {
    spawnWord();
    state.spawnTimer = 0;
  }

  updateWords(dt);
  requestAnimationFrame(gameLoop);
}

function spawnWord() {
  const text = pickWordByLevel(state.level);
  const node = document.createElement("div");
  node.className = "word";

  const x = randInt(8, Math.max(8, gameArea.clientWidth - 170));
  const wordObj = {
    id: state.nextId,
    text,
    y: -30,
    x,
    speed: getWordSpeed(state.level) + randInt(-4, 12),
    node,
  };

  state.nextId += 1;
  state.activeWords.push(wordObj);
  gameArea.appendChild(node);
  renderWord(wordObj);
}

function updateWords(dt) {
  const bottomLimit = gameArea.clientHeight - 20;

  for (let i = state.activeWords.length - 1; i >= 0; i -= 1) {
    const word = state.activeWords[i];
    word.y += word.speed * dt;

    if (word.y >= bottomLimit) {
      removeWordByIndex(i);
      onWordHitGround();
      continue;
    }

    positionWord(word);
  }
}

function positionWord(word) {
  word.node.style.transform = `translate(${word.x}px, ${word.y}px)`;
}

function renderWord(word) {
  const isTarget = word.id === state.targetWordId;
  const typed = isTarget ? state.typed : "";
  const typedPart = word.text.slice(0, typed.length);
  const remaining = word.text.slice(typed.length);

  word.node.innerHTML = `<span class="typed">${typedPart}</span><span class="remaining">${remaining}</span>`;
  word.node.classList.toggle("target", isTarget);
  positionWord(word);
}

function onWordHitGround() {
  state.lives -= 1;
  state.targetWordId = null;
  state.typed = "";

  if (state.lives <= 0) {
    gameOver();
  } else {
    statusEl.textContent = `A word hit the ground! Lives left: ${state.lives}`;
  }
  updateHud();
  refreshWordRender();
}

function removeWordByIndex(index) {
  const [removed] = state.activeWords.splice(index, 1);
  if (removed?.node?.parentNode) {
    removed.node.parentNode.removeChild(removed.node);
  }
  if (removed.id === state.targetWordId) {
    state.targetWordId = null;
    state.typed = "";
  }
}

function removeTargetWord() {
  const index = state.activeWords.findIndex((word) => word.id === state.targetWordId);
  if (index === -1) {
    state.targetWordId = null;
    state.typed = "";
    return;
  }

  removeWordByIndex(index);
  state.score += 10 + state.level * 2;
  state.level = 1 + Math.floor(state.score / 120);
  statusEl.textContent = `Destroyed! Level ${state.level} increases difficulty.`;
  updateHud();
}

function refreshWordRender() {
  state.activeWords.forEach((word) => renderWord(word));
}

function pickTargetByFirstLetter(letter) {
  const matches = state.activeWords.filter((word) => word.text.startsWith(letter));
  if (!matches.length) {
    return null;
  }
  matches.sort((a, b) => b.y - a.y);
  return matches[0];
}

function gameOver() {
  state.running = false;
  startBtn.disabled = false;
  restartBtn.disabled = false;
  statusEl.textContent = `Game Over. Final score: ${state.score}. Press Restart to play RAVIR again.`;
}

document.addEventListener("keydown", (event) => {
  if (!state.running) {
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    if (state.typed.length > 0) {
      state.typed = state.typed.slice(0, -1);
      if (state.typed.length === 0) {
        state.targetWordId = null;
      }
      refreshWordRender();
    }
    return;
  }

  if (!/^[a-zA-Z]$/.test(event.key)) {
    return;
  }

  const char = event.key.toLowerCase();

  if (state.targetWordId === null) {
    const target = pickTargetByFirstLetter(char);
    if (!target) {
      statusEl.textContent = `No word starts with "${char}" right now.`;
      return;
    }
    state.targetWordId = target.id;
    state.typed = char;
    if (state.typed === target.text) {
      removeTargetWord();
    }
    refreshWordRender();
    return;
  }

  const target = state.activeWords.find((word) => word.id === state.targetWordId);
  if (!target) {
    state.targetWordId = null;
    state.typed = "";
    return;
  }

  const expected = target.text[state.typed.length];
  if (char === expected) {
    state.typed += char;
    if (state.typed === target.text) {
      removeTargetWord();
    }
  } else {
    statusEl.textContent = `Mistyped on "${target.text}". Keep focus!`;
  }

  refreshWordRender();
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
