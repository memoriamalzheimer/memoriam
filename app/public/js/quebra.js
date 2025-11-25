let imagemSelecionada = null;
const grade = document.getElementById("grade");
let linhas = 4;   
let colunas = 6;  

 function selecionarImagem(imgNome, elementoHTML) {
    imagemSelecionada = imgNome;

    document.querySelectorAll(".opcao-img").forEach(div => {
        div.classList.remove("selecionada");
    });
    elementoHTML.classList.add("selecionada");

    document.getElementById("btn-iniciar").disabled = false;

    ajustarReferencia(imgNome);  
}

function definirDificuldade(nivel) {
    if (nivel === "facil") {
        linhas = 3;
        colunas = 4;
    } else if (nivel === "medio") {
        linhas = 4;
        colunas = 6;
    } else if (nivel === "dificil") {
        linhas = 6;
        colunas = 8;
    }
}

 function abrirPopupInicio() {
    if (!imagemSelecionada) return;

    document.getElementById("preview-img").src = imagemSelecionada;
    document.getElementById("popv-iniciar").style.display = "flex";
}

document.getElementById("btn-confirmar-inicio").onclick = function () {
    document.getElementById("popv-iniciar").style.display = "none";
    iniciarJogo();
};

document.getElementById("btn-cancelar-inicio").onclick = function () {
    document.getElementById("popv-iniciar").style.display = "none";
};

 function iniciarJogo() {
    if (!imagemSelecionada) return;

    document.getElementById("tela-selecao").style.display = "none";
    document.getElementById("tela-jogo").style.display = "block";

    document.getElementById("img-referencia").src = imagemSelecionada;

    criarPecas();

    document.getElementById("popv-como-jogar").style.display = "flex";
}

document.getElementById("btn-fechar-como-jogar").onclick = function () {
    document.getElementById("popv-como-jogar").style.display = "none";
    embaralhar(100);
};

 const imgRef = document.getElementById('img-referencia');
const containerRef = imgRef.parentElement;

function ajustarReferencia(src) {
    imgRef.src = src;
    imgRef.onload = () => {
         containerRef.style.aspectRatio = `${imgRef.naturalWidth} / ${imgRef.naturalHeight}`;
         imgRef.style.objectFit = "cover";
        imgRef.style.objectPosition = "center";
    }
}

 function criarPecas() {
    grade.innerHTML = "";
    for (let i = 0; i < linhas; i++) {
        for (let j = 0; j < colunas; j++) {
            const novaPeca = document.createElement("div");
            novaPeca.id = `x${j}y${i}`;
            novaPeca.style.top = `${(i * 100) / linhas}%`;
            novaPeca.style.left = `${(j * 100) / colunas}%`;
            novaPeca.style.width = `${100 / colunas}%`;
            novaPeca.style.height = `${100 / linhas}%`;
            novaPeca.style.backgroundImage = `url(${imagemSelecionada})`;
            novaPeca.style.backgroundSize = `${colunas * 100}% ${linhas * 100}%`;
            novaPeca.style.backgroundPosition = `${(j / (colunas - 1)) * 100}% ${(i / (linhas - 1)) * 100}%`;
            novaPeca.setAttribute("onclick", "clicarPeca(this)");
            grade.appendChild(novaPeca);
        }
    }
}

 let escolhido1 = null;
let escolhido2 = null;

function clicarPeca(argElemento) {
    if (!escolhido1) {
        escolhido1 = argElemento;
    } else if (!escolhido2) {
        escolhido2 = argElemento;
        trocarPeca();
    }
}

function embaralhar(argIteracoes) {
    for (let i = 0; i < argIteracoes; i++) {
        let escolhido1X = 0;
        let escolhido1Y = 0;
        let escolhido2X = 0;
        let escolhido2Y = 0;

        while (escolhido1X === escolhido2X && escolhido1Y === escolhido2Y) {
            escolhido1X = Math.floor(Math.random() * colunas);
            escolhido1Y = Math.floor(Math.random() * linhas);

            escolhido2X = Math.floor(Math.random() * colunas);
            escolhido2Y = Math.floor(Math.random() * linhas);
        }

        escolhido1 = document.getElementById(`x${escolhido1X}y${escolhido1Y}`);
        escolhido2 = document.getElementById(`x${escolhido2X}y${escolhido2Y}`);
        trocarPeca();
    }
}

function trocarPeca() {
    const tempTop = escolhido1.style.top;
    const tempLeft = escolhido1.style.left;

    escolhido1.style.top = escolhido2.style.top;
    escolhido1.style.left = escolhido2.style.left;

    escolhido2.style.top = tempTop;
    escolhido2.style.left = tempLeft;

    escolhido1 = null;
    escolhido2 = null;

    validar();
}

 function validar() {
    for (let i = 0; i < linhas; i++) {
        for (let j = 0; j < colunas; j++) {
            const peca = document.getElementById(`x${j}y${i}`);
            
            const leftEsperado = (j * 100) / colunas;
            const topEsperado = (i * 100) / linhas;

            const leftAtual = parseFloat(peca.style.left);
            const topAtual = parseFloat(peca.style.top);

             if (Math.abs(leftEsperado - leftAtual) > 0.1 || Math.abs(topEsperado - topAtual) > 0.1) {
                return;  
            }
        }
    }

    popupVence();
}

function popupVence() {
    const popv = document.getElementById("popv-vitoria");
    popv.style.display = "flex";
    document.getElementById("btn-reiniciar").onclick = reiniciarJogo;
}

function reiniciarJogo() {
    document.getElementById("popv-vitoria").style.display = "none";
    voltarParaTelaInicial();
}

 document.getElementById("btn-voltar").onclick = function () {
    document.getElementById("popv-sair").style.display = "flex";
};

document.getElementById("btn-confirmar-sair").onclick = function () {
    document.getElementById("popv-sair").style.display = "none";
    voltarParaTelaInicial();
};

document.getElementById("btn-cancelar-sair").onclick = function () {
    document.getElementById("popv-sair").style.display = "none";
};

function voltarParaTelaInicial() {
    grade.innerHTML = "";
    document.getElementById("tela-jogo").style.display = "none";
    document.getElementById("tela-selecao").style.display = "block";

    document.querySelectorAll(".opcao-img").forEach(div => div.classList.remove("selecionada"));
    document.getElementById("btn-iniciar").disabled = true;

    imagemSelecionada = null;
}

 window.onload = () => {
    document.getElementById("popupInicio").style.display = "flex";
};

document.getElementById("fecharPopupInicio").onclick = () => {
    document.getElementById("popupInicio").style.display = "none";
};
