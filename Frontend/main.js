const trilha = document.getElementById('trilha')
const telaAtividade = document.getElementById('atividade')
const enunciado = document.getElementById('enunciado')
const burguer = document.getElementById('burger')
const menu = document.getElementById('menuLateralEsquerda')
const menuAprender = document.getElementById('aprender')
const menuIA = document.getElementById('iaEstudos')
const alternativa1 = document.getElementById('alternativa1')
const alternativa2 = document.getElementById('alternativa2')
const alternativa3 = document.getElementById('alternativa3')
const alternativa4 = document.getElementById('alternativa4')
const atividadesConcluidas = [];
const botoes = []

const telas = [
    document.getElementById('trilha'),
    document.getElementById('telaSimulados'),
    document.getElementById('telaRanking'),
    document.getElementById('telaBiblioteca'),
    document.getElementById('chatIA')
]

const chatMensagens = document.getElementById("chatMensagens");
const chatInput = document.getElementById("chatInput");
const botaoEnviar = document.getElementById("botaoEnviar");

let atvAtual = 1
let respostaCerta
let embaralhado
let atividadeAtual
let indiceAtv = 0

function criarTrilha() {
fetch(`http://localhost:3000/nome`)
.then(data => data.json())
.then(resp => {
    console.log(resp)
    for(let i=0; i < resp.length; i++){
    const botao = document.createElement('button')
    botao.className = 'botaoAtividade'
    botao.textContent = resp[i].nome
    botao.id = i+1
    if(i % 2 == 0) {
        botao.classList.add('impar')
    }
    else{
        botao.classList.add('par')
    }
    botao.addEventListener('click', () => entrarAtividade(botao.id))
    console.log(atvAtual)   
    if(i+1 > atvAtual) {
        botao.style.filter = 'grayscale(100%)'
    } else if (i+1 == atvAtual){
        botao.style.filter = 'grayscale(40%)'
    }
    trilha.appendChild(botao)
    botoes.push(botao)
}
}
)
}
criarTrilha()

function entrarAtividade(id) {
    if(atvAtual == id) {
    atividadeAtual = id;
    trilha.style.opacity = '0'
    telaAtividade.style.transform = 'translateX(0)'
    criarAtividade(atividadeAtual)
    } else if(atvAtual > id) {
        alert('Atividade já concluida')
    } else {
        alert('Atividade bloqueada')
    }
}

function sairAtividade() {
    indiceAtv = 0
    document.querySelectorAll('.botaoAtividade').forEach(elemento => {
        elemento.remove()
    })
    criarTrilha()
    telaAtividade.style.transform = 'translateX(100%)'
    trilha.style.opacity = '1'
}

burguer.addEventListener('change', () => {
    document.getElementById('menuAdicionarAtividade').classList.remove('ativo')
    if(burguer.checked) {
    menu.classList.add('ativo')
    document.getElementById('options').classList.add('ativo')
    } else {
    menu.classList.remove('ativo')
    document.getElementById('options').classList.remove('ativo')
    }   
})

document.addEventListener('click', (event) => {

    // Se o menu estiver aberto
    if (menu.classList.contains('ativo')) {

        // Verifica se o clique foi fora do menu
        if (!menu.contains(event.target)) {

            menu.classList.remove('ativo');
            document.getElementById('options').classList.remove('ativo');

            // Desmarca o checkbox do hamburguer
            burguer.checked = false;
        }
    }
});

function aleatorio(alternativa1, alternativa2, certa, alternativa4){
      let arr = [alternativa1, alternativa2, certa, alternativa4]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    return arr
}

function fecharParabens(){
    ganharXp('xpBonus', 10)

    document.getElementById("parabens").style.display = "none";

    const botao = document.getElementById(atividadeAtual);
    botao.style.background = "green";
    botao.innerHTML = "✔";

    sairAtividade();
}
function verificar(id, resp){
    if(embaralhado[id] == respostaCerta) {
        console.log('i', indiceAtv)
        if(indiceAtv < 2){
            criarAtividade('aleatorio')
            indiceAtv += 1
        }
        else{
            indiceAtv = 0
            console.log('concluido')
            document.getElementById("parabens").style.display = "flex";
            atividadesConcluidas.push(id);
            atvAtual += 1
            const botao = document.getElementById(id);
        }
    } else {
        resp.style.animation = 'chacualhar 200ms ease-in-out alternate'
        setTimeout(() => {
            resp.style.animation = ''}, 200)
    }

        //pra que serve
        //tantos códigos?
        //se a vida
        //não é programada
        //e as melhores coisas
        //não tem lógica

}
function AbrirAdicionarAtividade(){
    document.getElementById('menuAdicionarAtividade').classList.toggle('ativo')
}

function adicionarAtividade(){
    event.preventDefault()
    let nome = document.getElementById('novoNome').value
    let enunciado = document.getElementById('novoEnunciado').value
    let resposta = document.getElementById('novaResposta').value
    let alternativa1 = document.getElementById('novaAlternativa1').value
    let alternativa2 = document.getElementById('novaAlternativa2').value
    let alternativa3 = document.getElementById('novaAlternativa3').value
    document.querySelectorAll('.botaoAtividade').forEach(elemento => {
        elemento.remove()
    })
    fetch(`http://localhost:3000/adicionar?nome=${nome}&enunciado=${enunciado}&resposta=${resposta}&alternativa1=${alternativa1}&alternativa2=${alternativa2}&alternativa3=${alternativa3}`)
    criarTrilha()
    document.getElementById('menuAdicionarAtividade').classList.toggle('ativo')
}

function criarAtividade(id) {
    fetch(`http://localhost:3000/atividades?id=${id}`)
    .then(resp => resp.json())
    .then(data => {
        enunciado.innerHTML = data.pergunta
        respostaCerta = data.certa
        embaralhado = aleatorio(data.alternativa1, data.alternativa2, data.certa, data.alternativa3)
            alternativa1.innerHTML = embaralhado[0]
            alternativa2.innerHTML = embaralhado[1]
            alternativa3.innerHTML = embaralhado[2]
            alternativa4.innerHTML = embaralhado[3]
    })
}

function trocarTela(indice) {
    for(let i=0; i < telas.length; i++){
        telas[i].classList.remove('ativo')
        console.log(telas[i])
    }
    telas[indice].classList.add('ativo')
    console.log(telas[indice])
}



const missaoLista = document.getElementById('missaoLista')

const missoes = [
    { id: 'xp',        titulo: 'Ganhe 10 XP',              icone: '⚡', atual: 0, meta: 10 },
    { id: 'xpBonus',   titulo: 'Ganhe 10 XP de superbônus', icone: '⚡', atual: 0, meta: 10 },
    { id: 'exercicios',titulo: 'Faça 7 exercícios',         icone: '📘', atual: 0, meta: 7  }
]

function renderMissoes(){
    missaoLista.innerHTML = ''
    missoes.forEach(missao => {
        const concluida = missao.atual >= missao.meta
        const porcentagem = Math.min(100, Math.round((missao.atual / missao.meta) * 100))

        const item = document.createElement('div')
        item.className = 'missao-item' + (concluida ? ' concluida' : '')
        item.innerHTML = `
            <div class="missao-icone">${missao.icone}</div>
            <div class="missao-info">
                <p class="missao-titulo">${missao.titulo}</p>
                <div class="barra-progresso">
                    <div class="barra-progresso-preenchimento" style="width:${porcentagem}%"></div>
                </div>
                <p class="missao-progresso-texto">${Math.min(missao.atual, missao.meta)} / ${missao.meta}</p>
            </div>
        `
        missaoLista.appendChild(item)
    })
}

function ganharXp(id, quantidade){
    const missao = missoes.find(m => m.id === id)
    if(!missao || missao.atual >= missao.meta) return
    missao.atual += quantidade
    renderMissoes()
}

renderMissoes()

function adicionarMensagem(texto, tipo) {

    const mensagem = document.createElement("div");

    mensagem.classList.add(
        "mensagem",
        tipo === "usuario"
            ? "mensagem-usuario"
            : "mensagem-ia"
    );

    const avatar = document.createElement("div");

    avatar.className = "avatar-mensagem";

    avatar.textContent =
        tipo === "usuario"
            ? "👤"
            : "🐒";


    const balao = document.createElement("div");

    balao.className = "balao-mensagem";

    balao.innerHTML = marked.parse(texto);


    mensagem.appendChild(avatar);

    mensagem.appendChild(balao);

    chatMensagens.appendChild(mensagem);

    chatMensagens.scrollTop =
        chatMensagens.scrollHeight;

    return mensagem;
}


async function enviarMensagem() {

    const texto = chatInput.value.trim();

    if (!texto) return;


    // mensagem do usuário
    adicionarMensagem(texto, "usuario");


    chatInput.value = "";

    botaoEnviar.disabled = true;


    // mensagem temporária
    const mensagemCarregando =
        adicionarMensagem(
            "🐒 Estou pensando...",
            "ia"
        );


    try {

        const resposta = await fetch(
            "http://localhost:4000/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    mensagem: texto
                })
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro na comunicação com o servidor."
            );

        }


        const dados = await resposta.json();


    const balao = mensagemCarregando.querySelector(".balao-mensagem");

    digitarResposta(
        balao,
        dados.resposta
    );

    } catch (erro) {

        mensagemCarregando
            .querySelector(".balao-mensagem")
            .innerHTML =
                "❌ Não consegui falar com o servidor. " +
                "Verifique se o Ollama e o backend estão funcionando.";

        console.error(erro);

    } finally {

        botaoEnviar.disabled = false;

        chatInput.focus();

    }

}


function enviarSugestao(texto) {

    chatInput.value = texto;

    enviarMensagem();

}


chatInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            enviarMensagem();

        }

    }
);

function digitarResposta(elemento, texto, velocidade = 1) {
    let indice = 0;

    elemento.innerHTML = "";

    function digitar() {
        if (indice < texto.length) {
            elemento.textContent += texto.charAt(indice);
            indice++;

            elemento.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });

            setTimeout(digitar, velocidade);
        } else {
            // Quando terminar, transforma Markdown em HTML
            elemento.innerHTML = marked.parse(texto);

            chatMensagens.scrollTop = chatMensagens.scrollHeight;
        }
    }

    digitar();
}
