/**
 * SISTEMA DE BOLÃO - COPA 2026
 * Gerenciamento de estado, agrupamento de dados e persistência local.
 */

// Chave utilizada para salvar os dados no localStorage do navegador
const STORAGE_KEY = 'bolao_copa_2026_palpites';

// Inicializa a lista carregando do localStorage ou com dados mockados se estiver vazio
let listaDePalpites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { usuario: "Alex", placarA: 2, placarB: 1 },
  { usuario: "Beatriz", placarA: 2, placarB: 1 },
  { usuario: "Carlos", placarA: 1, placarB: 0 },
  { usuario: "Daniel", placarA: 2, placarB: 1 },
  { usuario: "Eduarda", placarA: 0, placarB: 0 }
];

// Elementos do DOM mapeados
const formPalpite = document.getElementById('form-palpite');
const containerEstatisticas = document.getElementById('container-estatisticas');

/**
 * Agrupa os palpites por placar idêntico usando Array.reduce
 * @param {Array} palpites - Lista crua contendo os objetos de palpite
 * @returns {Object} Objeto com chaves únicas por placar e estatísticas mapeadas
 */
function computarFrequenciaDePlacares(palpites) {
  return palpites.reduce((acumulador, palpite) => {
    // Cria uma chave string única por placar, ex: "2x1"
    const chavePlacar = `${palpite.placarA}x${palpite.placarB}`;
    
    if (!acumulador[chavePlacar]) {
      acumulador[chavePlacar] = {
        placarExibicao: `${palpite.placarA} × ${palpite.placarB}`,
        quantidade: 0,
        apostadores: []
      };
    }
    
    // Incrementa a volumetria e insere o participante
    acumulador[chavePlacar].quantidade += 1;
    acumulador[chavePlacar].apostadores.push(palpite.usuario);
    
    return acumulador;
  }, {});
}

/**
 * Renderiza o painel de estatísticas na tela com os dados atualizados
 */
function renderizarPainel() {
  // 1. Processa e agrupa a frequência dos palpites
  const dadosAgrupados = computarFrequenciaDePlacares(listaDePalpites);
  
  // 2. Converte o objeto de grupos em um Array para ordenação decrescente
  const listaOrdenada = Object.values(dadosAgrupados).sort((a, b) => b.quantidade - a.quantidade);
  
  // 3. Identifica a maior quantidade de votos para marcar o campeão de escolha
  const maiorVotacao = listaOrdenada.length > 0 ? listaOrdenada[0].quantidade : 0;

  // Validação para estado sem dados
  if (listaOrdenada.length === 0) {
    containerEstatisticas.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Nenhum palpite computado até o momento.</p>`;
    return;
  }

  // 4. Montagem e injeção do HTML limpo
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

/**
 * Intercepta o evento de submit do formulário para tratamento e persistência
 */
formPalpite.addEventListener('submit', (event) => {
  event.preventDefault(); // Evita o reload nativo da página

  // Captura dos inputs tratados
  const usuario = document.getElementById('nome-participante').value.trim();
  const placarA = parseInt(document.getElementById('placar-a').value, 10);
  const placarB = parseInt(document.getElementById('placar-b').value, 10);

  // Inserção no Array de estado da aplicação
  listaDePalpites.push({ usuario, placarA, placarB });
  

  // Sincronização com o LocalStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaDePalpites));

  // Reset visual do formulário e re-renderização imediata do painel
  formPalpite.reset();
  renderizarPainel();
});

/**
 * Limpa todos os palpites do LocalStorage e reinicia a tela
 */
function limparTodosOsPalpites() {
  // 1. Confirma se o usuário realmente quer apagar (boa prática)
  if (confirm("Tem certeza que deseja apagar TODOS os palpites salvos?")) {
    
    // 2. Remove a chave do localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // 3. Zera o array de estado na memória do script
    listaDePalpites = [];
    
    // 4. Atualiza a interface (vai mostrar a mensagem de "Nenhum palpite")
    renderizarPainel();
    
    alert("Palpites limpos com sucesso!");
  }
}

const btnLimpar = document.getElementById('btn-limpar');
btnLimpar.addEventListener('click', limparTodosOsPalpites);
// Inicialização da interface no carregamento da página
renderizarPainel();