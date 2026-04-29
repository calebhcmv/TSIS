class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }

  front() {
    return this.isEmpty() ? null : this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  clear() {
    this.items = [];
  }

  values() {
    return [...this.items];
  }
}

const queue = new Queue();
const history = [];
const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
let characterCountCache = null;

const addButton = document.getElementById("add-customer-btn");
const serveButton = document.getElementById("serve-customer-btn");
const clearButton = document.getElementById("clear-queue-btn");
const queueList = document.getElementById("queue-list");
const historyList = document.getElementById("history-list");
const currentCustomer = document.getElementById("current-customer");
const statusArea = document.getElementById("status");

function renderCharacter(character) {
  return `
    <div class="character">
      <img src="${character.image}" alt="${character.name}">
      <div>
        <h3>${character.name}</h3>
        <p><strong>Espécie:</strong> ${character.species}</p>
        <p><strong>Status:</strong> ${character.status}</p>
      </div>
    </div>
  `;
}

function renderQueue() {
  const items = queue.values();

  if (items.length === 0) {
    queueList.innerHTML = '<li class="placeholder">Fila vazia.</li>';
    serveButton.disabled = true;
    return;
  }

  queueList.innerHTML = items
    .map((person, index) => {
      return `
        <li class="queue-item">
          <strong>#${index + 1}</strong>
          ${renderCharacter(person)}
        </li>
      `;
    })
    .join("");

  serveButton.disabled = false;
}

function renderCurrent(customer) {
  if (!customer) {
    currentCustomer.classList.add("placeholder");
    currentCustomer.textContent = "Nenhum personagem em atendimento.";
    return;
  }

  currentCustomer.classList.remove("placeholder");
  currentCustomer.innerHTML = renderCharacter(customer);
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<li class="placeholder">Nenhum atendimento realizado.</li>';
    return;
  }

  historyList.innerHTML = history
    .map((person, index) => {
      return `
        <li class="history-item">
          <strong>Atendimento ${index + 1}:</strong> ${person.name} (${person.species})
        </li>
      `;
    })
    .join("");
}

function setStatus(message, type = "ok") {
  statusArea.textContent = message;
  statusArea.className = `status ${type}`;
}

async function getCharacterCount() {
  if (characterCountCache !== null) {
    return characterCountCache;
  }

  const response = await fetch("https://rickandmortyapi.com/api/character");
  if (!response.ok) {
    throw new Error("Não foi possível consultar o total de personagens na API.");
  }

  const payload = await response.json();
  characterCountCache = payload.info.count;
  return characterCountCache;
}

async function fetchRandomCharacter() {
  const characterCount = await getCharacterCount();
  const randomId = Math.floor(Math.random() * characterCount) + 1;
  const response = await fetch(`https://rickandmortyapi.com/api/character/${randomId}`);

  if (!response.ok) {
    throw new Error("Falha ao buscar personagem na API.");
  }

  return response.json();
}

async function addCharacterToQueue() {
  addButton.disabled = true;
  setStatus("Buscando personagem...");

  try {
    const character = await fetchRandomCharacter();

    queue.enqueue({
      id: character.id,
      name: character.name,
      image: character.image,
      species: character.species,
      status: character.status
    });

    renderQueue();
    setStatus(`${character.name} entrou na fila.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao adicionar personagem.";
    setStatus(message, "error");
  } finally {
    addButton.disabled = false;
  }
}

function serveCharacter() {
  const nextCharacter = queue.dequeue();

  if (!nextCharacter) {
    setStatus("Não há personagens para atender.", "error");
    renderQueue();
    return;
  }

  renderCurrent(nextCharacter);
  history.unshift(nextCharacter);
  audio.currentTime = 0;
  audio.play().catch(() => {
    setStatus("Atendido, mas o navegador bloqueou o som automático.");
  });

  renderQueue();
  renderHistory();
  setStatus(`${nextCharacter.name} foi atendido(a).`);
}

function clearQueue() {
  queue.clear();
  renderQueue();
  setStatus("Fila limpa com sucesso.");
}

addButton.addEventListener("click", addCharacterToQueue);
serveButton.addEventListener("click", serveCharacter);
clearButton.addEventListener("click", clearQueue);

renderQueue();
renderHistory();
renderCurrent(queue.front());
