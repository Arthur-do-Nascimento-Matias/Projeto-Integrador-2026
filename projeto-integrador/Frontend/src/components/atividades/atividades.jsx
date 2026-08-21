import { useEffect, useRef } from 'react'
import '../atividades/atividades.css'

let embaralhado
let respostaCerta
let indiceAtv = 0

function aleatorio(alternativa1, alternativa2, certa, alternativa4){
      let arr = [alternativa1, alternativa2, certa, alternativa4]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    return arr
}

function atividades({ refAtividade, atividadeAtual, setAtvLiberada }) {

    const atividadesConcluidas = [];

    const refParabens = useRef(null)
    const refEnunciado = useRef(null)
    const refAlternativa1 = useRef(null)
    const refAlternativa2 = useRef(null)
    const refAlternativa3 = useRef(null)
    const refAlternativa4 = useRef(null)
    
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

function sairAtividade() {
    indiceAtv = 0
    refAtividade.current.style.transform = 'translateX(100%)'
    trilha.style.opacity = '1'
}

function fecharParabens() {

    refParabens.current.style.display = "none"

    const botao = document.getElementById(atividadeAtual)

    sairAtividade()
}

function verificar(id, resp){
if (embaralhado[id] == respostaCerta) {

    if (indiceAtv < 2) {
        indiceAtv += 1
        criarAtividade('aleatorio')
    } else {
        indiceAtv = 0
        console.log('concluido')
        refParabens.current.style.display = 'flex'
        setAtvLiberada(prev => prev + 1)
    }

} else {
    resp.style.animation = 'chacualhar 200ms ease-in-out alternate'

    setTimeout(() => {
        resp.style.animation = ''
    }, 200)
    }

        //pra que serve
        //tantos códigos?
        //se a vida
        //não é programada
        //e as melhores coisas
        //não tem lógica
}

useEffect(() => {

    if (!atividadeAtual) return

    criarAtividade(atividadeAtual)

}, [atividadeAtual])

    return(
        <>
            <div className="atividade" id="atividade" ref={refAtividade}>
                    <button onClick={sairAtividade}>Sair</button>
                     <h1 className="enunciado" id="enunciado" ref={refEnunciado}></h1>
                        <button className="alternativa1" id="alternativa1" onClick={(e) => verificar(0, e.currentTarget)} ref={refAlternativa1}></button>
                        <button className="alternativa2" id="alternativa2" onClick={(e) => verificar(1, e.currentTarget)} ref={refAlternativa2}></button>
                        <button className="alternativa3" id="alternativa3" onClick={(e) => verificar(2, e.currentTarget)} ref={refAlternativa3}></button>
                        <button className="alternativa4" id="alternativa4" onClick={(e) => verificar(3, e.currentTarget)} ref={refAlternativa4}></button>
                    </div>
                    
                    <div className="parabens" id="parabens" ref={refParabens}>
                    <h1>🎉 Parabéns!</h1>
                    <p>Você concluiu esta atividade.</p>
                    <button onClick={fecharParabens}>Continuar</button>
                </div>
        </>
    )
}

export default atividades
