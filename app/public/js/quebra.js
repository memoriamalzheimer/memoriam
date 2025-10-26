const imagens = [
  "/assets/jogos/quebra1.jpg",
  "/assets/jogos/quebra2.jpg",
  "/assets/jogos/quebra3.jpg"
];
 
const imagemEscolhida = imagens[Math.floor(Math.random() * imagens.length)];
const linhas = 12;
const colunas = 12;
let tentativas = 0;
let tempo = 0;
let timer;
let pecas = [];
let embaralhadas = [];
 
function iniciarJogo() {
  const tabuleiro = document.getElementById("tabuleiro");
  tabuleiro.innerHTML = "";
  tabuleiro.style.gridTemplateRows = `repeat(${linhas}, 1fr)`;
  tabuleiro.style.gridTemplateColumns = `repeat(${colunas}, 1fr)`;
 
  pecas = [];
  for (let i = 0; i < linhas * colunas; i++) pecas.push(i);
  embaralhadas = pecas.slice().sort(() => Math.random() - 0.5);
 
  embaralhadas.forEach((index, i) => {
    const div = document.createElement("div");
    div.classList.add("peca");
    div.style.backgroundImage = `url(${imagemEscolhida})`;
    div.style.backgroundSize = `${colunas * 100}% ${linhas * 100}%`;
    div.style.backgroundPosition = `${(index % colunas) * (100 / (colunas - 1))}% ${(Math.floor(index / colunas)) * (100 / (linhas - 1))}%`;
    div.dataset.index = index;
    div.draggable = true;
    div.addEventListener("dragstart", arrastar);
    div.addEventListener("dragover", permitirSoltar);
    div.addEventListener("drop", soltar);
    tabuleiro.appendChild(div);
  });
 
  tentativas = 0;
  tempo = 0;
  document.getElementById("tentativas").textContent = "Tentativas: 0";
  document.getElementById("tempo").textContent = "Tempo: 00:00";
 
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    tempo++;
    const m = String(Math.floor(tempo / 60)).padStart(2, "0");
    const s = String(tempo % 60).padStart(2, "0");
    document.getElementById("tempo").textContent = `Tempo: ${m}:${s}`;
  }, 1000);
}
 
function arrastar(e) {
  e.dataTransfer.setData("text", e.target.dataset.index);
}
 
function permitirSoltar(e) {
  e.preventDefault();
}
 
function soltar(e) {
  e.preventDefault();
  const origem = e.dataTransfer.getData("text");
  const destino = e.target.dataset.index;
  const idxOrigem = embaralhadas.indexOf(parseInt(origem));
  const idxDestino = embaralhadas.indexOf(parseInt(destino));
  [embaralhadas[idxOrigem], embaralhadas[idxDestino]] = [embaralhadas[idxDestino], embaralhadas[idxOrigem]];
  tentativas++;
  atualizarTabuleiro();
  verificarVitoria();
}
 
function atualizarTabuleiro() {
  const tabuleiro = document.getElementById("tabuleiro");
  const divs = tabuleiro.querySelectorAll(".peca");
  divs.forEach((div, i) => {
    const index = embaralhadas[i];
    div.style.backgroundPosition = `${(index % colunas) * (100 / (colunas - 1))}% ${(Math.floor(index / colunas)) * (100 / (linhas - 1))}%`;
  });
  document.getElementById("tentativas").textContent = `Tentativas: ${tentativas}`;
}
 
function verificarVitoria() {
  const venceu = embaralhadas.every((val, idx) => val === pecas[idx]);
  if (venceu) {
    clearInterval(timer);
    alert(`Parabéns! Você completou o quebra-cabeça em ${tentativas} tentativas e ${tempo} segundos.`);
  }
}
 
document.getElementById("reiniciar").addEventListener("click", iniciarJogo);
window.onload = iniciarJogo;