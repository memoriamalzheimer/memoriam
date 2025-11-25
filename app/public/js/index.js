const imagens = [
    'https://images.unsplash.com/photo-1666606341560-47c022478e23?q=80&w=870&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=870&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=870&auto=format&fit=crop',
    
];
 const textos = [
    'Cuidando da sua saúde',
    'Jogue Xadrez',
    'Alois Alzheimer',
];

let indice = 0;
const fundo = document.querySelector('.fundo');
const titulo = document.querySelector('.fundo h1');

let interval;  

function mostrarImagem() {
    fundo.style.backgroundImage = `url('${imagens[indice]}')`;
    titulo.textContent = textos[indice];
}

 
document.querySelector('.prev').addEventListener('click', () => {
    clearInterval(interval);  
    indice = (indice - 1 + imagens.length) % imagens.length;
    mostrarImagem();
    iniciarAutoplay();  
});

 
document.querySelector('.next').addEventListener('click', () => {
    clearInterval(interval); 
    indice = (indice + 1) % imagens.length;
    mostrarImagem();
    iniciarAutoplay();  
});

 
function iniciarAutoplay() {
    
    interval = setInterval(() => {
        indice = (indice + 1) % imagens.length;
        mostrarImagem();
    }, 5000);
}

 
window.addEventListener('DOMContentLoaded', () => {
    mostrarImagem();    
    iniciarAutoplay();   
});

const dropdownLogin = document.getElementById('dropdown-login');
const dropdownContentLogin = document.getElementById('dropdown-content-login');

dropdownLogin.addEventListener('mouseenter', () => {
    dropdownContentLogin.style.display = 'block';
});

dropdownLogin.addEventListener('mouseleave', () => {
    dropdownContentLogin.style.display = 'none';
});

 