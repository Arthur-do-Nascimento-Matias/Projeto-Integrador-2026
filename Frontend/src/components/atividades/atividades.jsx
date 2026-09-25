import { useEffect, useRef } from 'react'
import './Atividades.css'

let embaralhado
let respostaCerta
let indiceAtv = 1
let cliques = 0

function sairAtividade(refAtividade, trilha) {
    refAtividade.current.style.transform = 'translateX(100%)'
    trilha.style.opacity = '1'
}

export function criarAtividade(refEnunciado, atividadeAtual, materiaAtual, refAlternativa1, refAlternativa2, refAlternativa3, refAlternativa4, refParabens) {

        console.log("materias em atividades.jsx", materiaAtual)
        fetch(`http://localhost:3000/atividades?materia=${materiaAtual}&atividadeAtual=${atividadeAtual}`)
        .then(resp => resp.json())
        .then(data => {

            if(data.concluido) {
                sairAtividade(refAtividade, trilha)
                refParabens.current.style.display = 'flex'
            }

            refEnunciado.current.innerHTML = data.pergunta
            embaralhado = aleatorio(data.alternativa1, data.alternativa2, data.alternativa3, data.alternativa4)
                refAlternativa1.current.innerHTML = embaralhado[0].texto
                refAlternativa2.current.innerHTML = embaralhado[1].texto
                refAlternativa3.current.innerHTML = embaralhado[2].texto
                refAlternativa4.current.innerHTML = embaralhado[3].texto
        })
    }

function aleatorio(alternativa1, alternativa2, certa, alternativa4){
      let arr = [alternativa1, alternativa2, certa, alternativa4]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    return arr
}

function atividades({ refAtividade, atividadeAtual, setAtvLiberada, materiaAtual, refEnunciado, refAlternativa1, refAlternativa2, refAlternativa3, refAlternativa4}) {

    const atividadesConcluidas = [];

    const refParabens = useRef(null)

function fecharParabens() {

    refParabens.current.style.display = "none"

    const botao = document.getElementById(atividadeAtual)

    sairAtividade(refAtividade, trilha)
}

function verificar(id, resp){
    console.log(embaralhado[id].verdadeira)
    console.log(embaralhado[id].verdadeira == 1)
    if (embaralhado[id].verdadeira == 1) {

    if (cliques < 2) {
        cliques += 1
        indiceAtv += 1
        console.log('indice' + indiceAtv)
        criarAtividade(refEnunciado, indiceAtv, materiaAtual, refAlternativa1, refAlternativa2, refAlternativa3, refAlternativa4, refParabens)
    } else {
        cliques = 0
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

    criarAtividade(refEnunciado, atividadeAtual, materiaAtual, refAlternativa1, refAlternativa2, refAlternativa3, refAlternativa4, refParabens)

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
