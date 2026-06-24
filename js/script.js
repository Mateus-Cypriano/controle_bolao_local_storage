/**
 * SISTEMA DE BOLÃO - COPA 2026
 * Gerenciamento de estado, agrupamento de dados e persistência local.
 */

// 1. CHAVES DO LOCALSTORAGE E ESTADO DA APLICAÇÃO
const STORAGE_KEY = 'bolao_copa_2026_palpites';
const MATCH_KEY = 'bolao_copa_2026_partida_atual';

let partidaAtual = JSON.parse(localStorage.getItem(MATCH_KEY)) || {
  timeA: "Brasil",
  timeB: "França"
};

let listaDePalpites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// 2. MAPEAMENTO DOS ELEMENTOS DO DOM (Sempre no topo antes das funções!)
const formPalpite = document.getElementById('form-palpite');
const containerEstatisticas = document.getElementById('container-estatisticas');
const btnLimpar = document.getElementById('btn-limpar');

// 3. FUNÇÕES DE MANIPULAÇÃO DA INTERFACE E LÓGICA
function alterarSelecoes() {
  const nomeA = document.getElementById('novo-time-a').value.trim();
  const nomeB = document.getElementById('novo-time-b').value.trim();

  if (!nomeA || !nomeB) {
    alert("Por favor, digite o nome das duas seleções.");
    return;
  }

  partidaAtual = {
    timeA: nomeA,
    timeB: nomeB
  };

  localStorage.setItem(MATCH_KEY, JSON.stringify(partidaAtual));

  document.getElementById('novo-time-a').value = '';
  document.getElementById('novo-time-b').value = '';

  atualizarInterfaceDaPartida();
}

function atualizarInterfaceDaPartida() {
  if (document.getElementById('nome-time-a')) {
    document.getElementById('nome-time-a').textContent = partidaAtual.timeA;
  }
  if (document.getElementById('nome-time-b')) {
    document.getElementById('nome-time-b').textContent = partidaAtual.timeB;
  }
  
  const flagA = document.getElementById('flag-a');
  const flagB = document.getElementById('flag-b');
  if (flagA) flagA.textContent = '🏳️';
  if (flagB) flagB.textContent = '🏳️';

  const labelA = document.querySelector('.label-time-a');
  const labelB = document.querySelector('.label-time-b');
  if (labelA) labelA.textContent = partidaAtual.timeA.substring(0, 3).toUpperCase();
  if (labelB) labelB.textContent = partidaAtual.timeB.substring(0, 3).toUpperCase();
}

function computarFrequenciaDePlacares(palpites) {
  return Array.isArray(palpites) ? palpites.reduce((acumulador, palpite) => {
    const chavePlacar = `${palpite.placarA}x${palpite.placarB}`;
    
    if (!acumulador[chavePlacar]) {
      acumulador[chavePlacar] = {
        placarExibicao: `${palpite.placarA} × ${palpite.placarB}`,
        quantidade: 0,
        apostadores: []
      };
    }
    
    acumulador[chavePlacar].quantidade += 1;
    acumulador[chavePlacar].apostadores.push(palpite.usuario);
    
    return acumulador;
  }, {}) : {};
}

function renderizarPainel() {
  if (!containerEstatisticas) return;

  const dadosAgrupados = computarFrequenciaDePlacares(listaDePalpites);
  const listaOrdenada = Object.values(dadosAgrupados).sort((a, b) => b.quantidade - a.quantidade);
  const maiorVotacao = listaOrdenada.length > 0 ? listaOrdenada[0].quantidade : 0;

  if (listaOrdenada.length === 0) {
    containerEstatisticas.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Nenhum palpite computado até o momento.</p>`;
    return;
  }

  containerEstatisticas.innerHTML = listaOrdenada.map((grupo) => {
    const ehLider = grupo.quantidade === maiorVotacao && maiorVotacao > 0;
    const classeCss = ehLider ? 'group-row leader' : 'group-row';
    const tagDestaque = ehLider ? `<span class="badge-pop">⭐ Mais Escolhido</span>` : '';

    return `
      <div class="${classeCss}">
        <div class="group-header">
          <span class="badge-score">${grupo.placarExibicao}</span>
          ${tagDestaque}
          <span class="badge-count">${grupo.quantidade} ${grupo.quantidade === 1 ? 'apostador' : 'apostadores'}</span>
        </div>
        <div class="group-details">
          <strong>Participantes:</strong> ${grupo.apostadores.join(', ')}
        </div>
      </div>
    `;
  }).join('');
}

function limparTodosOsPalpites() {
  if (confirm("Tem certeza que deseja apagar TODOS os palpites salvos?")) {
    localStorage.removeItem(STORAGE_KEY);
    listaDePalpites = [];
    renderizarPainel();
    alert("Palpites limpos com sucesso!");
  }
}

// 4. EVENT LISTENERS (OUVINTES DE EVENTOS)
if (formPalpite) {
  formPalpite.addEventListener('submit', (event) => {
    event.preventDefault();

    const usuario = document.getElementById('nome-participante').value.trim();
    const placarA = parseInt(document.getElementById('placar-a').value, 10);
    const placarB = parseInt(document.getElementById('placar-b').value, 10);

    // Salva no estado local
    listaDePalpites.push({ usuario, placarA, placarB });
    
    // Salva no LocalStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listaDePalpites));

    formPalpite.reset();
    renderizarPainel();
  });
}

// Proteção para o botão de limpar (evita quebrar se o id não existir no HTML)
if (btnLimpar) {
  btnLimpar.addEventListener('click', limparTodosOsPalpites);
}

// 5. INICIALIZAÇÃO DA TELA (Executada apenas quando tudo já foi lido)
atualizarInterfaceDaPartida();
renderizarPainel();