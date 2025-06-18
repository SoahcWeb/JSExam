const images = [
  "bunny", "dog", "fox", "mouse", "owl", "whale",
  "alpaca", "cat", "chick", "hedgehog", "koala",
  "panda", "parrot", "penguin", "raccoon",
  "shark", "sloth", "tiger"
];

const app = document.querySelector('#app');
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timerInterval;
let secondsElapsed = 0;

function createHomeScreen() {
  app.innerHTML = `
    <div class="home-screen">
      <img src="/assets/logo.png" alt="Mémo Kawaii" class="logo" />
      <label for="difficulty">Choisissez la difficulté :</label>
      <select id="difficulty">
        <option value="easy">Facile (4x4 - 8 paires)</option>
        <option value="medium">Moyen (5x4 - 10 paires)</option>
        <option value="hard">Difficile (6x6 - 18 paires)</option>
      </select>
      <button id="startBtn">Jouer</button>
    </div>
  `;

  document.getElementById('startBtn').addEventListener('click', () => {
    const difficulty = document.getElementById('difficulty').value;
    startGame(difficulty);
  });
}

function startGame(difficulty) {
  moves = 0;
  secondsElapsed = 0;
  matchedPairs = 0;
  flippedCards = [];

  // Définir le nombre de paires et colonnes selon la difficulté
  let pairCount, columns;
  switch(difficulty) {
    case 'easy':
      pairCount = 8;    // 4x4
      columns = 4;
      break;
    case 'medium':
      pairCount = 10;   // 5x4
      columns = 5;
      break;
    case 'hard':
      pairCount = 18;   // 6x6
      columns = 6;
      break;
    default:
      pairCount = 8;
      columns = 4;
  }

  // Sélectionner les images selon pairCount et créer les cartes en double
  const selected = images.slice(0, pairCount);
  const cards = [...selected, ...selected].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="scoreboard">
      <div>Coups : <span id="movesCount">0</span></div>
      <div>Temps : <span id="timer">0:00</span></div>
    </div>
    <div class="grid" style="grid-template-columns: repeat(${columns}, 1fr);"></div>
  `;

  const grid = document.querySelector('.grid');

  cards.forEach(name => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.name = name;
    card.innerHTML = `
      <div class="card-inner">
        <img class="front" src="/assets/${name}.jpeg" alt="${name}" />
        <img class="back" src="/assets/back.jpeg" alt="back" />
      </div>
    `;
    card.addEventListener('click', flipCard);
    grid.appendChild(card);
  });

  // Démarrer le timer
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsElapsed++;
    document.getElementById('timer').textContent = formatTime(secondsElapsed);
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function flipCard(e) {
  const card = e.currentTarget;
  if (card.classList.contains('flipped') || flippedCards.length === 2) return;

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 1) {
    moves++;
    document.getElementById('movesCount').textContent = moves;
  }

  if (flippedCards.length === 2) {
    const [first, second] = flippedCards;
    const match = first.dataset.name === second.dataset.name;

    setTimeout(() => {
      if (match) {
        matchedPairs++;

        // Vérifie si toutes les paires sont trouvées selon la difficulté
        // pairCount est déterminé au début du jeu, on peut le récupérer via le nombre total de cartes divisé par 2
        const totalPairs = document.querySelectorAll('.card').length / 2;
        if (matchedPairs === totalPairs) {
          clearInterval(timerInterval);
          setTimeout(() => showVictory(moves, secondsElapsed), 500);
        }
      } else {
        first.classList.remove('flipped');
        second.classList.remove('flipped');
      }
      flippedCards = [];
    }, 1000);
  }
}

function showVictory(moves, time) {
  const bestScore = JSON.parse(localStorage.getItem('bestScore')) || null;

  let newBest = false;
  if (!bestScore || time < bestScore.time || (time === bestScore.time && moves < bestScore.moves)) {
    localStorage.setItem('bestScore', JSON.stringify({moves, time}));
    newBest = true;
  }

  app.innerHTML = `
    <div class="victory">
      <h1>Gagné ! 🎉</h1>
      <p>Coups : ${moves}</p>
      <p>Temps : ${formatTime(time)}</p>
      ${newBest ? '<p><strong>🎉 Nouveau meilleur score !</strong></p>' : 
        bestScore ? `<p>Meilleur score : ${bestScore.moves} coups en ${formatTime(bestScore.time)}</p>` : ''}
      <button id="restartBtn">Rejouer</button>
    </div>
  `;

  document.getElementById('restartBtn').addEventListener('click', createHomeScreen);
}

createHomeScreen();
