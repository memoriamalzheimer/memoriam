const listaPacientes = document.getElementById('lista-pacientes');

const pacientes = [
  { id: 1, nome: 'João Silva' },
  { id: 2, nome: 'Maria Souza' },
  { id: 3, nome: 'Carlos Oliveira' }
];

pacientes.forEach(p => {
  const div = document.createElement('div');
  div.classList.add('paciente');
  div.textContent = p.nome;
  div.addEventListener('click', () => carregarDadosPaciente(p.id, div));
  listaPacientes.appendChild(div);
});

async function carregarDadosPaciente(id, div) {
  let existente = div.querySelector('.grafico-container');
  if (existente) {
    existente.style.display = existente.style.display === 'none' ? 'block' : 'none';
    return;
  }

  const resposta = await fetch(`/cuidador/pacientes/${id}`);
  const dados = await resposta.json();

  const container = document.createElement('div');
  container.classList.add('grafico-container');
  container.innerHTML = `<canvas id="grafico${id}" height="200"></canvas>`;
  div.appendChild(container);

  const ctx = document.getElementById(`grafico${id}`);
  const nomes = dados.jogos.map(j => j.nome);
  const tempos = dados.jogos.map(j => j.tempo);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: nomes,
      datasets: [{
        label: 'Tempo de Conclusão (s)',
        data: tempos,
        backgroundColor: 'rgba(255, 215, 0, 0.7)',
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: '#fff' } }
      },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
}
