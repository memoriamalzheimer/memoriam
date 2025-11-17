const gridContainer = document.querySelector(".grid-container");
const htpb = document.getElementById('htpb');
const comoj = document.getElementById('comoj');
const fecharComoj = document.getElementById('fecharComoj');
let cards = [
  { image: "./assets/memoria1.png", name: "memoria1" },
  { image: "./assets/memoria2.png", name: "memoria2" },
  { image: "./assets/memoria3.png", name: "memoria3" },
  { image: "./assets/memoria4.png", name: "memoria4" },
  { image: "./assets/memoria5.png", name: "memoria5" },
  { image: "./assets/memoria6.png", name: "memoria6" },
  { image: "./assets/memoria7.png", name: "memoria7" },
  { image: "./assets/memoria8.png", name: "memoria8" },
  { image: "./assets/memoria9.png", name: "memoria9" }
];

let firstCard, secondCard;
let lockBoard = false;
let score = 0;

document.querySelector(".score").textContent = score;

cards = [...cards, ...cards];

shuffleCards();
generateCards();

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  gridContainer.innerHTML = "";

  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.dataset.name = card.name;

    cardElement.innerHTML = `
    <div class="front">
        <img class="front-image" src=${card.image} />
    </div>
    <div class="back"></div>
    `;

    cardElement.addEventListener("click", flipCard);
    gridContainer.appendChild(cardElement);
  }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  resetBoard();

  score++;
  document.querySelector(".score").textContent = score;

  if (score === cards.length / 2) {
    mostrarPopupVitoria();
  }
}

function mostrarPopupVitoria() {
  const popv = document.getElementById("popv-vitoria");
  popv.style.display = "flex";

  const btnReiniciar = document.getElementById("btn-reiniciar");
  btnReiniciar.onclick = function() {
    popv.style.display = "none";
    restartGame();
  };
}

function restartGame() {
  score = 0;
  document.querySelector(".score").textContent = score;
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  shuffleCards();
  generateCards();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 800);
}

htpb.addEventListener('click', () => comoj.style.display = 'flex');
fecharComoj.addEventListener('click', () => comoj.style.display = 'none');

function resetBoard() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}