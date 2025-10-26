const tabuleiro = document.getElementById('tabuleiro');
const iniciarBtn = document.getElementById('iniciar');
const dificuldadeSelect = document.getElementById('dificuldade');
const tempoSpan = document.getElementById('tempo');
const tentativasSpan = document.getElementById('tentativas');
 
let cartas = [];
let cartasViradas = [];
let paresEncontrados = 0;
let tentativas = 0;
let tempo = 0;
let timer = null;
let totalPares = 0;
 
function gerarImagens(qtd) {
  const imagens = [];
  for (let i = 1; i <= qtd; i++) {
    imagens.push(`/assets/jogos/memoria${i}.png`);
  }
  return imagens;
}
 
function embaralhar(array) {
  return array.sort(() => Math.random() - 0.5);
}
 
function criarTabuleiro(linhas, colunas) {
  tabuleiro.innerHTML = '';
  tabuleiro.style.gridTemplateColumns = `repeat(${colunas}, 1fr)`;
  const totalCartas = linhas * colunas;
  totalPares = totalCartas / 2;
 
  const imagens = gerarImagens(totalPares);
  const duplicadas = embaralhar([...imagens, ...imagens]);
 
  duplicadas.forEach((img, i) => {
    const carta = document.createElement('div');
    carta.classList.add('carta');
    carta.dataset.imagem = img;
    carta.innerHTML = `
<div class="face frente"></div>
<div class="face verso" style="background-image: url('${img}')"></div>
    `;
    carta.addEventListener('click', () => virarCarta(carta));
    tabuleiro.appendChild(carta);
  });
}
 
function iniciarCronometro() {
  clearInterval(timer);
  tempo = 0;
  tempoSpan.textContent = '00:00';
  timer = setInterval(() => {
    tempo++;
    const minutos = Math.floor(tempo / 60).toString().padStart(2, '0');
    const segundos = (tempo % 60).toString().padStart(2, '0');
    tempoSpan.textContent = `${minutos}:${segundos}`;
  }, 1000);
}
 
function pararCronometro() {
  clearInterval(timer);
}
 
function virarCarta(carta) {
  if (cartasViradas.length < 2 && !carta.classList.contains('virada')) {
    carta.classList.add('virada');
    cartasViradas.push(carta);
  }
 
  if (cartasViradas.length === 2) {
    tentativas++;
    tentativasSpan.textContent = tentativas;
    const [c1, c2] = cartasViradas;
    if (c1.dataset.imagem === c2.dataset.imagem) {
      paresEncontrados++;
      cartasViradas = [];
      if (paresEncontrados === totalPares) {
        pararCronometro();
        alert(`Parabéns! Você concluiu o jogo em ${tempoSpan.textContent} com ${tentativas} tentativas.`);
      }
    } else {
      setTimeout(() => {
        c1.classList.remove('virada');
        c2.classList.remove('virada');
        cartasViradas = [];
      }, 800);
    }
  }
}
 
iniciarBtn.addEventListener('click', () => {
  tentativas = 0;
  tentativasSpan.textContent = '0';
  paresEncontrados = 0;
  cartasViradas = [];
 
  const dificuldade = dificuldadeSelect.value;
  if (dificuldade === 'facil') criarTabuleiro(4, 5);
  else if (dificuldade === 'medio') criarTabuleiro(6, 6);
  else criarTabuleiro(6, 8);
 
  iniciarCronometro();
});