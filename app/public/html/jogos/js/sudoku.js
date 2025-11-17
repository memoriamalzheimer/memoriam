let mistakesTxt = document.getElementById('mistakes');
let selectedDigit = null;
let mistakes = 0;
let tentativas = 3;
let bloqueado = false;
const reiniciarBtn = document.getElementById('reiniciar');


const selectDificuldade = document.getElementById('dificuldade');

const encodeBoard = (board) =>
    board.reduce(
        (result, row, i) =>
            result + `%5B${encodeURIComponent(row)}%5D${i === board.length - 1 ? '' : '%2C'}`,
        ''
    );

const encodeParams = (params) =>
    Object.keys(params)
        .map((key) => key + '=' + `%5B${encodeBoard(params[key])}%5D`)
        .join('&');

const fetchBoard = async (difficulty) => {
    const res = await fetch(`https://sugoku.onrender.com/board?difficulty=${difficulty}`);
    const data = await res.json();

    const fetchSolution = await fetch('https://sugoku.onrender.com/solve', {
        method: 'POST',
        body: encodeParams(data),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const solution = await fetchSolution.json();
    return [data.board, solution.solution];
};

let currentSolution = null;  

const startGame = async (difficulty = 'easy') => {
    localStorage.setItem('dificuldadeAtual', difficulty);

     const gridEl = document.getElementById('grid');
    const selectionEl = document.getElementById('selection');
    gridEl.innerHTML = '';
    selectionEl.innerHTML = '';
    mistakes = 0;
    mistakesTxt.innerHTML = '';
    mistakesTxt.style.opacity = '0';
    selectedDigit = null;
    bloqueado = false;

    const [board, solution] = await fetchBoard(difficulty);
    currentSolution = solution;

     for (let i = 1; i <= 9; i++) {
        let digits = document.createElement('div');
        digits.id = i;
        digits.innerHTML = i;
        digits.addEventListener('click', setDigit);
        digits.classList.add('digit');
        selectionEl.appendChild(digits);
    }

    for (let row = 0; row < 9; row++) {
        for (let column = 0; column < 9; column++) {
            let cell = document.createElement('div');
            cell.id = row + '-' + column;

            if (board[row][column] != 0) {
                cell.innerHTML = board[row][column];
                cell.classList.add('given-digit');
            }

            if (row === 2 || row === 5) cell.classList.add('cell-bottom-border');
            if (column === 2 || column === 5) cell.classList.add('cell-right-border');

            cell.addEventListener('click', writeDigit);
            cell.classList.add('cell');
            gridEl.append(cell);
        }
    }

    function setDigit() {
        if (bloqueado) return;
        if (selectedDigit) selectedDigit.classList.remove('selected-digit');
        selectedDigit = this;
        selectedDigit.classList.add('selected-digit');
    }

    function writeDigit(e) {
        if (bloqueado) {
            e.preventDefault();
            return;
        }

        if (!selectedDigit) return;
        if (this.innerHTML != '' || this.classList.contains('given-digit')) return;

        this.innerHTML = selectedDigit.innerHTML;

        const [rStr, cStr] = this.id.split('-');
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);

        if (currentSolution && currentSolution[r][c] == selectedDigit.id) {
            this.classList.add('correct-digit');
        } else {
            this.classList.add('wrong-digit');
            mistakes++;

            bloqueado = true;

            mistakesTxt.style.opacity = '1';
            mistakesTxt.innerHTML = `Você errou! Número de erros: ${mistakes}`;

            setTimeout(() => {
                mistakesTxt.style.opacity = '0';
                this.classList.remove('wrong-digit');
                this.innerHTML = '';
                bloqueado = false;
            }, 1500);

            if (mistakes >= tentativas) gameOver();
        }
    }

    function gameOver() {
        const gameOverBox = document.getElementById('game-over');
        gameOverBox.style.display = 'block';
        document.querySelectorAll('.cell').forEach((cell) => cell.removeEventListener('click', writeDigit));
    }
};

const restartBtn = document.getElementById('restart');
const exitBtn = document.getElementById('exit');

restartBtn.addEventListener('click', () => {
    const gameOverBox = document.getElementById('game-over');
    gameOverBox.style.display = 'none';

    mistakes = 0;
    mistakesTxt.innerHTML = '';
    mistakesTxt.style.opacity = '0';
    selectedDigit = null;
    bloqueado = false;

    startGame(localStorage.getItem('dificuldadeAtual') || 'easy');
});

exitBtn.addEventListener('click', () => {
    window.location.href = '/';
});

selectDificuldade.addEventListener('change', () => {
    const modo = selectDificuldade.value;
    startGame(modo);
});

const dificuldadeSalva = localStorage.getItem('dificuldadeAtual') || 'easy';
selectDificuldade.value = dificuldadeSalva;
startGame(dificuldadeSalva);

const params = new URLSearchParams(window.location.search);
if (params.get("instrucoes") === "true") {
    const popup = document.getElementById("popupInstrucoes");
    if (popup) popup.style.display = "flex";
}

const fecharPopupBtn = document.getElementById("fecharPopup");
if (fecharPopupBtn) {
    fecharPopupBtn.onclick = () => {
        const popup = document.getElementById("popupInstrucoes");
        if (popup) popup.style.display = "none";
    };
}
reiniciarBtn.addEventListener('click', () => {
    startGame(localStorage.getItem('dificuldadeAtual')|| 'easy');
});