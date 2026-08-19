import { useEffect, useRef } from 'react'
import '../trilhaAtividades/trilha.css'

function Trilha() {
    
    const trilha = document.getElementById('trilha')
    let atvAtual = 1
    const botoes = []

    useEffect(() => {
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

    refTrilha.current.appendChild(botao)
    botoes.push(botao)
    }})}

criarTrilha()

}, [])
    

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

    const refTrilha = useRef(null)

    return(
        <>
          <div className="trilha ativo" id="trilha" ref={refTrilha}></div>
        </>
    )
}

export default Trilha
