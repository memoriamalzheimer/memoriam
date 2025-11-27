const gridContainer = document.querySelector(".grid-container");
const htpb = document.getElementById('htpb');
const comoj = document.getElementById('comoj');
const fecharComoj = document.getElementById('fecharComoj');
let cards = [
  { image: "/js/assets/memoria1.png", name: "memoria1" },
  { image: "/js/assets/memoria2.png", name: "memoria2" },
  { image: "/js/assets/memoria3.png", name: "memoria3" },
  { image: "/js/assets/memoria4.png", name: "memoria4" },
  { image: "/js/assets/memoria5.png", name: "memoria5" },
  { image: "/js/assets/memoria6.png", name: "memoria6" },
  { image: "/js/assets/memoria7.png", name: "memoria7" },
  { image: "/js/assets/memoria8.png", name: "memoria8" },
  { image: "/js/assets/memoria9.png", name: "memoria9" }
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
const somAcerto = new Audio('js/assets/sounds/JDMacerto.wav');

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  somAcerto.play();
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  resetBoard();

  score++;
  document.querySelector(".score").textContent = score;

  if (score === cards.length / 2) {
    mostrarPopupVitoria();
  }
}
const somVitoria = new Audio('js/assets/sounds/Concluir.wav')
function mostrarPopupVitoria() {
  somVitoria.play();
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
const somErrado = new Audio ('/js/assets/sounds/SudokuErro.wav')
function unflipCards() {
  somErrado.play();
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
window.addEventListener('load', () => {
  const popupInicio = document.getElementById('popupInicio');
  const btnFecharPopupInicio = document.getElementById('fecharPopupInicio');

  popupInicio.style.display = 'flex';  

  btnFecharPopupInicio.addEventListener('click', () => {
    popupInicio.style.display = 'none';
  });
});
