const trilha = document.querySelector('.trilha')
const telaAtividade = document.querySelector('.atividade')
const enunciado = document.querySelector('.enunciado')
const burguer = document.querySelector('#burger')
const menu = document.querySelector('.menuLateralEsquerda')
const alternativa1 = document.querySelector('.alternativa1')
const alternativa2 = document.querySelector('.alternativa2')
const alternativa3 = document.querySelector('.alternativa3')
const alternativa4 = document.querySelector('.alternativa4')
const atividadesConcluidas = [];
const botoes = []
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
    if(burguer.checked) {
    menu.classList.add('ativo')
    } else {
    menu.classList.remove('ativo')
    }   
})

function aleatorio(alternativa1, alternativa2, certa, alternativa4){
      let arr = [alternativa1, alternativa2, certa, alternativa4]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    return arr
}

function fecharParabens(){

    document.querySelector(".parabens").style.display = "none";

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
            document.querySelector(".parabens").style.display = "flex";
            atividadesConcluidas.push(id);
            atvAtual += 1
            const botao = document.getElementById(id);
        }
    } else {
        console.log('errado')
        console.log(resp.className)
        resp.style.animation = 'chacualhar 200ms ease-in-out alternate'
        setTimeout(() => {
            resp.style.animation = ''}, 200)
        console.log(resp.className);
    }

        //pra que serve
        //tantos códigos?
        //se a vida
        //não é programada
        //e as melhores coisas
        //não tem lógica

}
function AbrirAdicionarAtividade(){
    document.querySelector('.menuAdicionarAtividade').classList.toggle('ativo')
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
    document.querySelector('.menuAdicionarAtividade').classList.toggle('ativo')
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
