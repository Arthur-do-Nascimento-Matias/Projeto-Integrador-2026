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
    .then(resp => resp.text())
    .then(data => {
        enunciado.innerHTML = data
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
