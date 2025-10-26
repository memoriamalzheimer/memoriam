/* === Seleção de elementos HTML === */
const boardElem = document.getElementById('board');        // Div do tabuleiro
const turnLabel = document.getElementById('turnLabel');    // Mostra de quem é a vez
const scoreRed = document.getElementById('scoreRed');      // Placar das peças vermelhas
const scoreWhite = document.getElementById('scoreWhite');  // Placar das peças brancas
const reiniciarBtn = document.getElementById('reiniciar'); // Botão reiniciar jogo
const instrucoesBtn = document.getElementById('instrucoesBtn'); // Botão de instruções
const popup = document.getElementById('popupInstrucoes');  // Popup de instruções
const fecharPopup = document.getElementById('fecharPopup'); // Botão para fechar popup
const undoBtn = document.getElementById('undo');           // Botão desfazer

/* === Configurações e estado do jogo === */
const SIZE = 8; // Tabuleiro 8x8
let gameState = {
  board: [],               // Array do tabuleiro (cada índice = célula)
  currentPlayer: 'red',    // Vez do jogador ('red' ou 'white')
  selectedPiece: null,     // Índice da peça selecionada
  history: [],             // Histórico de movimentos para desfazer
  scores: { red: 0, white: 0 } // Capturas de cada jogador
};

/* === Funções de ajuda === */
const toIndex = (row, col) => row * SIZE + col;          // Converte linha/coluna para índice do array
const toRowCol = (index) => [Math.floor(index / SIZE), index % SIZE]; // Converte índice para linha/coluna
const capitalize = (str) => str[0].toUpperCase() + str.slice(1);      // Coloca primeira letra maiúscula
const cloneBoard = (board) => board.map(p => p ? { ...p } : null);    // Copia o tabuleiro (para undo)

/* === Inicializa o tabuleiro com as peças === */
function initializeBoard() {
  gameState.board = new Array(SIZE * SIZE).fill(null); // Cria tabuleiro vazio

  // Coloca peças vermelhas no topo (3 primeiras linhas)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) gameState.board[toIndex(r, c)] = { color: 'red', king: false };
    }
  }

  // Coloca peças brancas no fundo (3 últimas linhas)
  for (let r = 5; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) gameState.board[toIndex(r, c)] = { color: 'white', king: false };
    }
  }

  // Reseta estado do jogo
  gameState.currentPlayer = 'red';
  gameState.selectedPiece = null;
  gameState.history = [];
  gameState.scores = { red: 0, white: 0 };
}

/* === Renderiza o tabuleiro e peças === */
function renderBoard() {
  boardElem.innerHTML = ''; // Limpa o tabuleiro

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const idx = toIndex(r, c); // Índice no array
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.dataset.color = (r + c) % 2 === 0 ? 'light' : 'dark';

      // Casas jogáveis (escuras) recebem clique
      if ((r + c) % 2 === 1) cell.addEventListener('click', () => onCellClick(idx));

      const piece = gameState.board[idx];
      if (piece) {
        const el = document.createElement('div');
        el.className = `piece ${piece.color}${piece.king ? ' king' : ''}`;
        el.title = piece.king ? 'Dama' : 'Peça';
        el.addEventListener('click', (e) => { e.stopPropagation(); onPieceClick(idx); });
        cell.appendChild(el);
      }

      boardElem.appendChild(cell); // Adiciona célula ao tabuleiro
    }
  }

  // Atualiza placar e vez do jogador
  turnLabel.textContent = capitalize(gameState.currentPlayer);
  scoreRed.textContent = gameState.scores.red;
  scoreWhite.textContent = gameState.scores.white;
  undoBtn.disabled = gameState.history.length === 0; // Desabilita undo se não houver histórico
}

/* === Seleção de peças === */
function onPieceClick(index) {
  const piece = gameState.board[index];
  if (!piece || piece.color !== gameState.currentPlayer) return; // Só permite selecionar sua peça
  gameState.selectedPiece = index;
  highlightMoves(index); // Destaca movimentos possíveis
}

/* === Clique em célula para mover peça === */
function onCellClick(index) {
  if (gameState.selectedPiece === null) return; // Nenhuma peça selecionada
  if (gameState.selectedPiece === index) {
    // Deseleciona peça
    gameState.selectedPiece = null;
    clearHighlights();
    renderBoard();
    return;
  }

  const legalMoves = getLegalMoves(gameState.selectedPiece);
  const chosenMove = legalMoves.find(m => m.to === index);
  if (chosenMove) {
    makeMove(chosenMove);        // Aplica movimento
    gameState.selectedPiece = null;
    clearHighlights();
    renderBoard();
    checkGameOver();             // Verifica fim de jogo
  }
}

/* === Movimentos legais === */
function getLegalMoves(index) {
  const piece = gameState.board[index];
  if (!piece) return [];

  // Prioriza capturas (obrigatório capturar)
  const allCaptures = findAllCaptures(gameState.currentPlayer);
  if (allCaptures.length > 0) return allCaptures.filter(m => m.from === index);

  const [row, col] = toRowCol(index);
  const directions = piece.king
    ? [[1,1],[1,-1],[-1,1],[-1,-1]]       // Rainha pode mover em todas diagonais
    : piece.color === 'red'
      ? [[1,1],[1,-1]]                     // Vermelho só para frente
      : [[-1,1],[-1,-1]];                  // Branco só para frente

  const moves = [];
  directions.forEach(([dr, dc]) => {
    const newRow = row + dr, newCol = col + dc;
    if (newRow >= 0 && newRow < SIZE && newCol >= 0 && newCol < SIZE) {
      const newIndex = toIndex(newRow, newCol);
      if (!gameState.board[newIndex]) moves.push({ from: index, to: newIndex });
    }
  });
  return moves;
}

/* === Capturas possíveis === */
function getCapturesFrom(index, piece) {
  const [row, col] = toRowCol(index);
  const directions = piece.king
    ? [[1,1],[1,-1],[-1,1],[-1,-1]]
    : piece.color === 'red'
      ? [[1,1],[1,-1]]
      : [[-1,1],[-1,-1]];

  const captures = [];
  directions.forEach(([dr, dc]) => {
    const midRow = row + dr, midCol = col + dc;
    const destRow = row + 2*dr, destCol = col + 2*dc;

    if (destRow >= 0 && destRow < SIZE && destCol >= 0 && destCol < SIZE) {
      const midIndex = toIndex(midRow, midCol);
      const destIndex = toIndex(destRow, destCol);
      const middlePiece = gameState.board[midIndex];
      if (middlePiece && middlePiece.color !== piece.color && !gameState.board[destIndex]) {
        captures.push({ from: index, to: destIndex, captured: midIndex });
      }
    }
  });
  return captures;
}

function findAllCaptures(color) {
  const captures = [];
  gameState.board.forEach((p, i) => {
    if (p && p.color === color) captures.push(...getCapturesFrom(i, p));
  });
  return captures;
}

/* === Destacar movimentos possíveis === */
function highlightMoves(index) {
  clearHighlights();
  const moves = getLegalMoves(index);
  const cells = boardElem.querySelectorAll('.cell');

  moves.forEach(m => {
    if (m.captured !== undefined) cells[m.to].classList.add('capture'); // Captura
    else cells[m.to].classList.add('highlight');                          // Movimento normal
  });
  cells[index].classList.add('highlight'); // Destaca peça selecionada
}

function clearHighlights() {
  boardElem.querySelectorAll('.cell').forEach(c => c.classList.remove('highlight', 'capture'));
}

/* === Executa movimento === */
function makeMove(move) {
  // Salva estado para desfazer
  gameState.history.push({ board: cloneBoard(gameState.board), currentPlayer: gameState.currentPlayer, scores: { ...gameState.scores } });

  const piece = gameState.board[move.from];
  gameState.board[move.from] = null;
  gameState.board[move.to] = piece;

  if (move.captured !== undefined) {
    if (Array.isArray(move.captured)) move.captured.forEach(i => gameState.board[i] = null);
    else gameState.board[move.captured] = null;
    gameState.scores[piece.color]++;
  }

  // Promove a peça a king
  const [row] = toRowCol(move.to);
  if (!piece.king) {
    if ((piece.color === 'red' && row === SIZE-1) || (piece.color === 'white' && row === 0)) piece.king = true;
  }

  // Continua captura se possível
  if (move.captured) {
    const moreCaptures = getCapturesFrom(move.to, piece);
    if (moreCaptures.length > 0) {
      gameState.selectedPiece = move.to;
      highlightMoves(move.to);
      return; // Mantém vez do jogador
    }
  }

  // Troca de jogador
  gameState.currentPlayer = (gameState.currentPlayer === 'red') ? 'white' : 'red';
}

/* === Verifica fim de jogo === */
function checkGameOver() {
  const redCount = gameState.board.filter(p => p && p.color === 'red').length;
  const whiteCount = gameState.board.filter(p => p && p.color === 'white').length;

  if (redCount === 0 || whiteCount === 0) {
    setTimeout(() => alert(`${redCount === 0 ? 'Branco' : 'Vermelho'} venceu!`), 100);
    return;
  }

  const hasMoves = gameState.board.some((p, i) => p && p.color === gameState.currentPlayer && getLegalMoves(i).length > 0);
  if (!hasMoves) setTimeout(() => alert(`Sem movimentos. ${gameState.currentPlayer === 'red' ? 'Branco' : 'Vermelho'} vence!`), 100);
}

/* === Eventos de botões === */
reiniciarBtn.addEventListener('click', () => { initializeBoard(); renderBoard(); });
instrucoesBtn.addEventListener('click', () => popup.style.display = 'flex');
fecharPopup.addEventListener('click', () => popup.style.display = 'none');
undoBtn.addEventListener('click', () => {
  const lastState = gameState.history.pop();
  if (!lastState) return;
  gameState.board = lastState.board;
  gameState.currentPlayer = lastState.currentPlayer;
  gameState.scores = lastState.scores;
  gameState.selectedPiece = null;
  renderBoard();
});

/* === Inicialização do jogo === */
initializeBoard();
renderBoard();
