let imagemSelecionada = null;
const grade = document.getElementById("grade");

function selecionarImagem(imgNome, elementoHTML) {
    imagemSelecionada = imgNome;

    document.querySelectorAll(".opcao-img").forEach(div => {
        div.classList.remove("selecionada");
    });
    elementoHTML.classList.add("selecionada");

    document.getElementById("btn-iniciar").disabled = false;
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

function criarPecas() {
    grade.innerHTML = "";
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 6; j++) {
            var novaPeca = document.createElement("div");
            novaPeca.id = "x" + j + "y" + i;
            novaPeca.style.top = i * 42 + "px";
            novaPeca.style.left = j * 50 + "px";
            novaPeca.style.backgroundImage = `url(${imagemSelecionada})`;
            novaPeca.style.backgroundSize = "300px 168px";
            novaPeca.style.backgroundPositionX = ((j * 25 / (6 - 1)) * 100) + "%";
            novaPeca.style.backgroundPositionY = ((i * 25 / (4 - 1)) * 100) + "%";
            novaPeca.setAttribute("onclick", "clicarPeca(this)");
            grade.appendChild(novaPeca);
        }
    }
}

var escolhido1 = null;
var escolhido2 = null;

function clicarPeca(argElemento) {
    if (escolhido1 == null) {
        escolhido1 = argElemento;
    } else if (escolhido2 == null) {
        escolhido2 = argElemento;
        trocarPeca();
    }
}

function embaralhar(argIteracoes) {
    for (var i = 0; i < argIteracoes; i++) {
        var escolhido1X = 0;
        var escolhido1Y = 0;
        var escolhido2X = 0;
        var escolhido2Y = 0;

        while (escolhido1X == escolhido2X && escolhido1Y == escolhido2Y) {
            escolhido1X = Math.round(Math.random() * (6 - 1));
            escolhido1Y = Math.round(Math.random() * (4 - 1));

            escolhido2X = Math.round(Math.random() * (6 - 1));
            escolhido2Y = Math.round(Math.random() * (4 - 1));
        }
        escolhido1 = document.getElementById("x" + escolhido1X + "y" + escolhido1Y);
        escolhido2 = document.getElementById("x" + escolhido2X + "y" + escolhido2Y);
        trocarPeca();
    }
}

function trocarPeca() {
    var escolhidoTrocadoTop = escolhido1.style.top;
    var escolhidoTrocadoLeft = escolhido1.style.left;

    escolhido1.style.top = escolhido2.style.top;
    escolhido1.style.left = escolhido2.style.left;

    escolhido2.style.top = escolhidoTrocadoTop;
    escolhido2.style.left = escolhidoTrocadoLeft;

    escolhido1 = null;
    escolhido2 = null;

    validar();
}

function validar() {
    var quebraCabecaOk = true;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 6; j++) {
            var posicaoXEsperada = j * 50 + "px";
            var posicaoYEsperada = i * 42 + "px";

            var pecaVerificada = document.getElementById("x" + j + "y" + i);
            if (pecaVerificada.style.left != posicaoXEsperada || pecaVerificada.style.top != posicaoYEsperada) {
                quebraCabecaOk = false;
            }
        }
    }
    if (quebraCabecaOk) {
        popupVence();
    }
}

function popupVence() {
    const popv = document.getElementById("popv-vitoria");
    popv.style.display = "flex";
    const btnReiniciar = document.getElementById("btn-reiniciar");
    btnReiniciar.onclick = reiniciarJogo;
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

    document.querySelectorAll(".opcao-img").forEach(div => {
        div.classList.remove("selecionada");
    });

    document.getElementById("btn-iniciar").disabled = true;

    imagemSelecionada = null;
}
