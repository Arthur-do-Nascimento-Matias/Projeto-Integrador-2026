const atividades = [
    'introducao',
    'pg1',
    'pg2',
    'pg3',
    'pg4'
]

const trilha = document.querySelector('.trilha')
const telaAtividade = document.querySelector('.atividade')
const enunciado = document.querySelector('.enunciado')
const burguer = document.querySelector('#burger')
const menu = document.querySelector('.menuLateralEsquerda')
const alternativa1 = document.querySelector('.alternativa1')
const alternativa2 = document.querySelector('.alternativa2')
const alternativa3 = document.querySelector('.alternativa3')
const alternativa4 = document.querySelector('.alternativa4')
let respostaCerta
let embaralhado

for(let i=0; i < atividades.length; i++){
    const botao = document.createElement('button')
    botao.className = 'botaoAtividade'
    botao.textContent = atividades[i]
    botao.id = i+1
    if(i % 2 == 0) {
        botao.classList.add('impar')
    }
    else{
        botao.classList.add('par')
    }
    botao.addEventListener('click', () => entrarAtividade(botao.id))
    trilha.appendChild(botao)
}

function entrarAtividade(id) {
    trilha.style.opacity = '0'
    telaAtividade.style.transform = 'translateX(0)'
    fetch(`http://localhost:3000/atividades?id=${id}`)
    .then(resp => resp.json())
    .then(data => {
        enunciado.innerHTML = data.pergunta
        respostaCerta = data.certa
        embaralhado = aleatorio(data.alternativa1, data.alternativa2, data.certa, data.alternativa4)
            alternativa1.innerHTML = embaralhado[0]
            alternativa2.innerHTML = embaralhado[1]
            alternativa3.innerHTML = embaralhado[2]
            alternativa4.innerHTML = embaralhado[3]
    })
}

function sairAtividade() {
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

function verificar(id){
    if(embaralhado[id] == respostaCerta) {
        console.log('concluido')
    } else {
        console.log('errado')
    }
}
