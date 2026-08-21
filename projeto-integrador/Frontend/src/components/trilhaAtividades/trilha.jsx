import { useEffect, useRef } from 'react'
import '../trilhaAtividades/trilha.css'

function Trilha({ refAtividade, setAtividadeAtual, atvLiberada }) {
    
    const refTrilha = useRef(null)

    let respostaCerta
    let atividadeAtual
    let indiceAtv = 0

    const botoes = []

    function criarTrilha() {

    refTrilha.current.innerHTML = ''

    fetch(`http://localhost:3000/nome`)
        .then(data => data.json())
        .then(resp => {
        console.log(resp)
        for(let i=0; i < resp.length; i++){
        const botao = document.createElement('button')
        botao.className = 'botaoAtividade'
        botao.id = i+1

    if(i % 2 == 0) {
        botao.classList.add('impar')
    }
    else{
        botao.classList.add('par')
    }

    botao.addEventListener('click', () => entrarAtividade(botao))

    if (i + 1 < atvLiberada) {
        botao.style.background = "green"
        botao.innerHTML = "✔"
        botao.classList.add('concluida')
    } 
    else if (i + 1 === atvLiberada) {
        botao.classList.add('atual')
    }
    else {
        botao.style.filter = 'grayscale(100%)'
    }
    refTrilha.current.appendChild(botao)
    botoes.push(botao)
    }})}


    function entrarAtividade(botao) {

    const id = Number(botao.id)

    if (atvLiberada == id) {
        setAtividadeAtual(id)
        refTrilha.current.style.opacity = '0'
        refAtividade.current.style.transform = 'translateX(0)'
    } else if (atvLiberada > id) {
        alert('Atividade já concluida')
    } else {
        alert('Atividade bloqueada')
    }
}

useEffect(() => {

    criarTrilha()

}, [atvLiberada])
    

    return(
        <>
          <div className="trilha ativo" id="trilha" ref={refTrilha}></div>
        </>
    )
}

export default Trilha
