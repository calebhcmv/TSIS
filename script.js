class Fila {
    constructor() {
        this.itens = [];
    }

    enqueue(item) {
        // adiciona o personagem no final da fila
        this.itens.push(item);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        // remove o primeiro personagem da fila
        return this.itens.shift();
    }

    isEmpty() {
        return this.itens.length === 0;
    }

    size() {
        return this.itens.length;
    }
}

const minhaFila = new Fila();
const filaContainer = document.getElementById('visualizacao-fila');
const contadorElemento = document.getElementById('contador');
let personagemSendoAtendido = null;

async function buscarDadosDaAPI() {
    const idAleatorio = Math.floor(Math.random() * 826) + 1;
    try {
        const response = await fetch(`https://rickandmortyapi.com/api/character/${idAleatorio}`);
        const data = await response.json();
        return {
            nome: data.name,
            imagem: data.image,
            especie: data.species,
            status: data.status
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function adicionarItem() {
    const personagem = await buscarDadosDaAPI();
    if (personagem) {
        minhaFila.enqueue(personagem);
        renderizarFila();
    }
}

function atenderItem() {
    if (minhaFila.isEmpty()) {
        alert("Não há ninguém na sala de espera!");
        return;
    }
    
    personagemSendoAtendido = minhaFila.dequeue();
    
    try {
        const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
        audio.play();
    } catch (e) {
        console.error("Erro ao reproduzir áudio:", e);
    }

    renderizarFila();
}

function renderizarFila() {
    contadorElemento.innerText = minhaFila.size();

    const areaAtendimento = document.getElementById('atendimento-atual');
    if (personagemSendoAtendido && areaAtendimento) {
        areaAtendimento.innerHTML = `
            <div class="card-atendimento">
                <h3>Em Atendimento</h3>
                <img src="${personagemSendoAtendido.imagem}" width="150" alt="${personagemSendoAtendido.nome}">
                <p><strong>${personagemSendoAtendido.nome}</strong></p>
                <p>${personagemSendoAtendido.especie} - ${personagemSendoAtendido.status}</p>
            </div>
        `;
    }

    filaContainer.innerHTML = '';

    if (minhaFila.isEmpty()) {
        filaContainer.innerHTML = '<p class="mensagem-vazia">A sala de espera está vazia.</p>';
        return;
    }

    minhaFila.itens.forEach((p, index) => {
        const div = document.createElement('div');
        div.className = 'item-fila';
        div.innerHTML = `
            <img src="${p.imagem}" width="80" alt="${p.nome}">
            <p>#${index + 1} - ${p.nome}</p>
        `;
        filaContainer.appendChild(div);
    });
}

document.getElementById('btn-adicionar').addEventListener('click', adicionarItem);
document.getElementById('btn-atender').addEventListener('click', atenderItem);
