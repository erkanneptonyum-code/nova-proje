const questions = [
  {
    title: 'Şu an hangi moddasın?',
    subtitle: 'İlk aklına geleni seç.',
    options: [
      { id: 'action', icon: '⚡', title: 'Hareket olsun', detail: 'Hız, refleks ve bol enerji', scores: { action: 3, coop: 1 } },
      { id: 'adventure', icon: '🧭', title: 'Keşfe çıkayım', detail: 'Yeni yerler ve güzel hikâyeler', scores: { adventure: 3, cozy: 1 } },
      { id: 'puzzle', icon: '🧩', title: 'Biraz düşüneyim', detail: 'Bulmaca ve zekice çözümler', scores: { puzzle: 3, strategy: 1 } },
      { id: 'cozy', icon: '☁️', title: 'Kafamı dinleyeyim', detail: 'Sakin, rahat ve stressiz', scores: { cozy: 3, adventure: 1 } }
    ]
  },
  {
    title: 'Ne kadar vaktin var?',
    subtitle: 'Oyun seansının süresini düşün.',
    options: [
      { id: 'quick', icon: '⏱️', title: 'Kısa bir mola', detail: '10–20 dakika', scores: { puzzle: 2, action: 2, cozy: 1 } },
      { id: 'medium', icon: '◷', title: 'Biraz takılabilirim', detail: 'Yaklaşık yarım saat', scores: { adventure: 2, cozy: 2, coop: 1 } },
      { id: 'long', icon: '🌙', title: 'Uzun bir oturum', detail: 'Vakit bende, macera başlasın', scores: { strategy: 2, adventure: 2, coop: 1 } }
    ]
  },
  {
    title: 'Kiminle oynamak istersin?',
    subtitle: 'Tek başına veya birlikte, ikisi de güzel.',
    options: [
      { id: 'solo', icon: '🎧', title: 'Kendim takılayım', detail: 'Kendi tempomda oynayayım', scores: { adventure: 2, puzzle: 2, cozy: 1, strategy: 1 } },
      { id: 'friends', icon: '🫶', title: 'Birlikte oynayalım', detail: 'Arkadaşlarla daha eğlenceli', scores: { coop: 3, action: 1 } },
      { id: 'either', icon: '🎮', title: 'Fark etmez', detail: 'Yeter ki oyun güzel olsun', scores: { action: 1, adventure: 1, cozy: 1, strategy: 1 } }
    ]
  }
];

const genres = {
  action: { title: 'Aksiyon ve tempo', emoji: '⚡', description: 'Hızlı kararlar, hareketli anlar ve enerjisi yüksek bir oyun arıyorsun. Kısa sürede oyuna dalmak istediğinde bu tür tam sana göre olabilir.', examples: 'Aksiyon, platform ve hızlı roguelike oyunlarına göz at.' },
  adventure: { title: 'Keşif ve macera', emoji: '🧭', description: 'Yeni dünyalara adım atmak, çevreyi keşfetmek ve bir hikâyenin parçası olmak sana iyi gelebilir.', examples: 'Macera, keşif ve hikâye odaklı oyun türlerini deneyebilirsin.' },
  puzzle: { title: 'Bulmaca ve zekâ', emoji: '🧩', description: 'Biraz kafa yormak, örüntüleri çözmek ve “buldum!” anı yaşamak istiyorsun. Kısa oyun molaları için de harika bir seçim.', examples: 'Bulmaca, mantık ve kaçış odası tarzı oyunlara göz at.' },
  cozy: { title: 'Sakin ve rahat', emoji: '☁️', description: 'Bugün acele yok. Kendi temponda ilerleyebileceğin, rahatlatıcı ve huzurlu bir oyun arıyorsun.', examples: 'Çiftçilik, dekorasyon ve gündelik yaşam simülasyonlarını keşfet.' },
  strategy: { title: 'Strateji ve planlama', emoji: '♟️', description: 'Hamlelerini düşünmek, plan kurmak ve kararlarının sonucunu görmek hoşuna gidebilir.', examples: 'Sıra tabanlı strateji ve şehir kurma türlerine bak.' },
  coop: { title: 'Birlikte oynama', emoji: '🫶', description: 'Eğlenceyi paylaşmak istiyorsun. Takım olup görev çözmek veya birlikte mücadele etmek sana göre.', examples: 'Eşli macera, parti ve takım oyunlarını araştır.' }
};

const questionArea = document.querySelector('#question-area');
const nextButton = document.querySelector('#next-button');
const backButton = document.querySelector('#back-button');
const progressFill = document.querySelector('#progress-fill');
const progressLabel = document.querySelector('#step-label');
const progressPercent = document.querySelector('#progress-percent');
const progressBar = document.querySelector('.progress-track');
const selectHint = document.querySelector('#select-hint');
const resultDialog = document.querySelector('#result-dialog');
const answers = [];
let currentStep = 0;
let lastRecommendation = null;
const arcadeDuration = 20;
let arcadeScore = 0;
let arcadeTimeLeft = arcadeDuration;
let arcadeTimer = null;
let arcadeIsRunning = false;
const arcadeBoard = document.querySelector('#arcade-board');
const starTarget = document.querySelector('#star-target');
const arcadeStart = document.querySelector('#arcade-start');
const arcadeStatus = document.querySelector('#arcade-status');
const bestScoreKey = 'oyun-ariyorum-yildiz-rekoru';
let memoryCards = [];
let memoryRevealed = [];
let memoryMatched = new Set();
let memoryMoves = 0;
let memoryLocked = false;
let rpsPlayerScore = 0;
let rpsComputerScore = 0;

function readBestScore() {
  try { return Number(localStorage.getItem(bestScoreKey)) || 0; }
  catch { return 0; }
}

function moveStar() {
  const padding = 12;
  const maxX = Math.max(padding, arcadeBoard.clientWidth - starTarget.offsetWidth - padding);
  const maxY = Math.max(padding, arcadeBoard.clientHeight - starTarget.offsetHeight - padding);
  starTarget.style.left = `${padding + Math.random() * (maxX - padding)}px`;
  starTarget.style.top = `${padding + Math.random() * (maxY - padding)}px`;
}

function finishArcadeGame() {
  window.clearInterval(arcadeTimer);
  arcadeIsRunning = false;
  starTarget.hidden = true;
  arcadeStart.disabled = false;
  arcadeStart.innerHTML = 'Yeniden oyna <span aria-hidden="true">↻</span>';
  const bestScore = readBestScore();
  arcadeStatus.textContent = arcadeScore > bestScore
    ? `Yeni rekor! ${arcadeScore} yıldız yakaladın. ✨`
    : `Süre doldu! ${arcadeScore} yıldız yakaladın. Bir tur daha?`;
  if (arcadeScore > bestScore) {
    try { localStorage.setItem(bestScoreKey, String(arcadeScore)); } catch { /* Rekor bu oturumda da görünür. */ }
  }
  document.querySelector('#arcade-best').textContent = String(Math.max(bestScore, arcadeScore)).padStart(2, '0');
}

function startArcadeGame() {
  window.clearInterval(arcadeTimer);
  arcadeScore = 0;
  arcadeTimeLeft = arcadeDuration;
  arcadeIsRunning = true;
  document.querySelector('#arcade-score').textContent = '00';
  document.querySelector('#arcade-time').textContent = String(arcadeTimeLeft);
  document.querySelector('#arcade-best').textContent = String(readBestScore()).padStart(2, '0');
  document.querySelector('#board-hint').hidden = true;
  arcadeStart.disabled = true;
  arcadeStart.textContent = 'Oyun başladı!';
  arcadeStatus.textContent = 'Yıldızları yakala, süren başladı!';
  starTarget.hidden = false;
  moveStar();
  arcadeTimer = window.setInterval(() => {
    arcadeTimeLeft -= 1;
    document.querySelector('#arcade-time').textContent = String(arcadeTimeLeft);
    if (arcadeTimeLeft <= 0) finishArcadeGame();
  }, 1000);
}

function renderQuestion() {
  const question = questions[currentStep];
  progressLabel.textContent = `SORU 0${currentStep + 1}`;
  const progress = Math.round(((currentStep + 1) / questions.length) * 100);
  progressFill.style.width = `${progress}%`;
  progressPercent.textContent = `${progress}%`;
  progressBar.setAttribute('aria-valuenow', String(currentStep + 1));
  backButton.hidden = currentStep === 0;
  nextButton.disabled = !answers[currentStep];
  nextButton.innerHTML = currentStep === questions.length - 1 ? 'Sonucu gör <span aria-hidden="true">✦</span>' : 'Devam et <span aria-hidden="true">→</span>';
  selectHint.textContent = answers[currentStep] ? 'Seçimini değiştirebilirsin' : 'Bir seçenek belirle';
  questionArea.innerHTML = `<h3 class="question-title">${question.title}</h3><p class="question-subtitle">${question.subtitle}</p><div class="option-grid">${question.options.map((option) => `
    <button class="option-card" type="button" data-option="${option.id}" aria-pressed="${answers[currentStep] === option.id}">
      <span class="option-icon" aria-hidden="true">${option.icon}</span><span class="option-label"><strong>${option.title}</strong><small>${option.detail}</small></span><span class="option-check" aria-hidden="true">✓</span>
    </button>`).join('')}</div>`;
}

function chooseOption(optionId) {
  answers[currentStep] = optionId;
  questionArea.querySelectorAll('.option-card').forEach((card) => {
    card.setAttribute('aria-pressed', String(card.dataset.option === optionId));
  });
  nextButton.disabled = false;
  selectHint.textContent = 'Seçimini değiştirebilirsin';
}

function getRecommendations() {
  const scores = Object.fromEntries(Object.keys(genres).map((key) => [key, 0]));
  answers.forEach((answerId, questionIndex) => {
    const option = questions[questionIndex].options.find((item) => item.id === answerId);
    if (option) Object.entries(option.scores).forEach(([genre, points]) => { scores[genre] += points; });
  });
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([genre]) => genre);
}

function showResult(genreId, isSurprise = false) {
  const genre = genres[genreId];
  if (!genre) return;
  lastRecommendation = genreId;
  document.querySelector('#result-kicker').textContent = isSurprise ? 'ŞANSINA ÇIKAN OYUN TÜRÜ' : 'SANA GÖRE OYUN TÜRÜ';
  document.querySelector('#result-emoji').textContent = genre.emoji;
  document.querySelector('#result-title').textContent = genre.title;
  document.querySelector('#result-description').textContent = genre.description;
  document.querySelector('#result-examples').textContent = genre.examples;
  document.querySelector('#copy-status').textContent = '';
  resultDialog.showModal();
}

function resetQuiz() {
  answers.length = 0;
  currentStep = 0;
  renderQuestion();
  resultDialog.close();
  document.querySelector('#game').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

questionArea.addEventListener('click', (event) => {
  const option = event.target.closest('[data-option]');
  if (option) chooseOption(option.dataset.option);
});

nextButton.addEventListener('click', () => {
  if (!answers[currentStep]) return;
  if (currentStep < questions.length - 1) {
    currentStep += 1;
    renderQuestion();
  } else {
    showResult(getRecommendations()[0]);
  }
});

backButton.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep -= 1;
    renderQuestion();
  }
});

document.querySelector('#surprise-button').addEventListener('click', () => {
  const choices = Object.keys(genres).filter((genre) => genre !== lastRecommendation);
  const randomGenre = choices[Math.floor(Math.random() * choices.length)];
  showResult(randomGenre, true);
});

document.querySelector('.dialog-close').addEventListener('click', () => resultDialog.close());
document.querySelector('#play-again').addEventListener('click', resetQuiz);
document.querySelector('#copy-result').addEventListener('click', async () => {
  const genre = genres[lastRecommendation];
  const text = `Bugün ${genre.title.toLocaleLowerCase('tr')} tarzı bir oyun arıyorum!`;
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'Sonuç panoya kopyalandı!';
  } catch {
    status.textContent = text;
  }
});

resultDialog.addEventListener('click', (event) => {
  if (event.target === resultDialog) resultDialog.close();
});

arcadeStart.addEventListener('click', startArcadeGame);
starTarget.addEventListener('click', () => {
  if (!arcadeIsRunning) return;
  arcadeScore += 1;
  document.querySelector('#arcade-score').textContent = String(arcadeScore).padStart(2, '0');
  moveStar();
});
document.querySelector('#arcade-best').textContent = String(readBestScore()).padStart(2, '0');

function activateMiniGame(gameId, focusTab = false) {
  if (arcadeIsRunning && gameId !== 'star') {
    window.clearInterval(arcadeTimer);
    arcadeIsRunning = false;
    starTarget.hidden = true;
    arcadeStart.disabled = false;
    arcadeStart.innerHTML = 'Yeniden başla <span aria-hidden="true">→</span>';
    arcadeStatus.textContent = 'Oyun duraklatıldı. Başka bir mini oyun seçtin.';
  }
  document.querySelectorAll('.game-tab').forEach((tab) => {
    const isActive = tab.dataset.game === gameId;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    if (isActive && focusTab) tab.focus();
  });
  document.querySelectorAll('.arcade-panel').forEach((panel) => {
    panel.hidden = panel.id !== `panel-${gameId}`;
  });
}

document.querySelectorAll('.game-tab').forEach((tab) => {
  tab.addEventListener('click', () => activateMiniGame(tab.dataset.game));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...document.querySelectorAll('.game-tab')];
    const index = tabs.indexOf(tab);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
    activateMiniGame(nextTab.dataset.game, true);
  });
});

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function renderMemoryCards() {
  const grid = document.querySelector('#memory-grid');
  grid.innerHTML = memoryCards.map((symbol, index) => `
    <button class="memory-card" type="button" data-card="${index}" aria-label="Kapalı kart" disabled>${symbol}</button>`).join('');
}

function startMemoryGame() {
  memoryCards = shuffle(['🚀', '🚀', '🎲', '🎲', '🪐', '🪐', '🐱', '🐱']);
  memoryRevealed = [];
  memoryMatched = new Set();
  memoryMoves = 0;
  memoryLocked = false;
  document.querySelector('#memory-moves').textContent = '00';
  document.querySelector('#memory-status').textContent = 'Eşleşen sembolleri bul!';
  document.querySelector('#memory-start').innerHTML = 'Yeniden dağıt <span aria-hidden="true">↻</span>';
  renderMemoryCards();
  document.querySelectorAll('.memory-card').forEach((card) => { card.disabled = false; });
}

document.querySelector('#memory-start').addEventListener('click', startMemoryGame);
document.querySelector('#memory-grid').addEventListener('click', (event) => {
  const card = event.target.closest('.memory-card');
  if (!card || memoryLocked || card.disabled) return;
  const index = Number(card.dataset.card);
  if (memoryMatched.has(index) || memoryRevealed.includes(index)) return;
  card.classList.add('is-revealed');
  card.setAttribute('aria-label', `Açık kart: ${memoryCards[index]}`);
  memoryRevealed.push(index);
  if (memoryRevealed.length < 2) return;

  memoryMoves += 1;
  document.querySelector('#memory-moves').textContent = String(memoryMoves).padStart(2, '0');
  const [firstIndex, secondIndex] = memoryRevealed;
  if (memoryCards[firstIndex] === memoryCards[secondIndex]) {
    memoryMatched.add(firstIndex);
    memoryMatched.add(secondIndex);
    document.querySelectorAll(`[data-card="${firstIndex}"], [data-card="${secondIndex}"]`).forEach((matchedCard) => {
      matchedCard.classList.add('is-matched');
      matchedCard.disabled = true;
      matchedCard.setAttribute('aria-label', `Eşleşti: ${memoryCards[firstIndex]}`);
    });
    memoryRevealed = [];
    if (memoryMatched.size === memoryCards.length) {
      document.querySelector('#memory-status').textContent = `${memoryMoves} hamlede hepsini buldun! 🎉`;
    } else {
      document.querySelector('#memory-status').textContent = 'Eşleşme buldun! Devam et.';
    }
  } else {
    memoryLocked = true;
    document.querySelector('#memory-status').textContent = 'Eşleşmedi, tekrar dene.';
    window.setTimeout(() => {
      document.querySelectorAll(`[data-card="${firstIndex}"], [data-card="${secondIndex}"]`).forEach((openCard) => {
        openCard.classList.remove('is-revealed');
        openCard.setAttribute('aria-label', 'Kapalı kart');
      });
      memoryRevealed = [];
      memoryLocked = false;
    }, 700);
  }
});

const rpsLabels = { rock: 'Taş', paper: 'Kağıt', scissors: 'Makas' };
function playRps(playerChoice) {
  const choices = Object.keys(rpsLabels);
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];
  let outcome;
  if (playerChoice === computerChoice) {
    outcome = 'Berabere';
  } else if (
    (playerChoice === 'rock' && computerChoice === 'scissors') ||
    (playerChoice === 'paper' && computerChoice === 'rock') ||
    (playerChoice === 'scissors' && computerChoice === 'paper')
  ) {
    rpsPlayerScore += 1;
    outcome = 'Bu tur senin!';
  } else {
    rpsComputerScore += 1;
    outcome = 'Bu tur bilgisayarın!';
  }
  document.querySelector('#rps-player-score').textContent = String(rpsPlayerScore);
  document.querySelector('#rps-computer-score').textContent = String(rpsComputerScore);
  document.querySelector('#rps-status').textContent = `${outcome} Sen: ${rpsLabels[playerChoice]} · Bilgisayar: ${rpsLabels[computerChoice]}.`;
}

document.querySelectorAll('.rps-choice').forEach((button) => {
  button.addEventListener('click', () => playRps(button.dataset.choice));
});
document.querySelector('#rps-reset').addEventListener('click', () => {
  rpsPlayerScore = 0;
  rpsComputerScore = 0;
  document.querySelector('#rps-player-score').textContent = '0';
  document.querySelector('#rps-computer-score').textContent = '0';
  document.querySelector('#rps-status').textContent = 'Hamleni seç, bakalım kim kazanacak?';
});

renderQuestion();
