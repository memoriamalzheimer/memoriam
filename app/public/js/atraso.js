const nav = document.querySelector(".itens");
const links = nav.querySelectorAll("a");  

links.forEach(link => {
  link.addEventListener("click", (event) => {
    event.preventDefault(); 
    const destino = link.href; 
    setTimeout(() => {
      window.location.href = destino; 
    }, 300);
  });
});


