import { use, useRef } from 'react'
import '../menuEsquerda/menuEsquerda.css'

function MenuEsquerda() {

    const refAprender = useRef(null)
    const refBiblioteca = useRef(null)
    const refIaEstudos = useRef(null)
    const refSimulados = useRef(null)
    const refRanking = useRef(null)
    const refFeed = useRef(null)

    const refNovoNome = useRef(null)
    const refNovoEnunciado = useRef(null)
    const refNovaResposta = useRef(null)
    const refNovaAlternativa1 = useRef(null)
    const refNovaAlternativa2 = useRef(null)
    const refNovaAlternativa3 = useRef(null)

    const menuAdicionarAtividade = useRef(null)

    function AbrirAdicionarAtividade(){
        menuAdicionarAtividade.current.classList.toggle('ativo')
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

    function trocarTela(url){
        window.location.href = url
    }
    

   /* function trocarTela(indice) {
        for(let i=0; i < telas.length; i++){
            telas[i].classList.remove('ativo')
            console.log(telas[i])
        }
        telas[indice].classList.add('ativo')
        console.log(telas[indice])
    } */


    return(
        <>
        <div className="menuLateralEsquerda" id="menuLateralEsquerda">

            <div className="options" id="options">
                <a id="aprender" className="linkTrocarTela" onClick={() => trocarTela('/')} ref={refAprender}>Aprender</a>
                <a id="simulados" className="linkTrocarTela"/* onclick={trocarTela(1)}*/ ref={refSimulados}>Simulados</a>
                <a id="ranking" className="linkTrocarTela" /*onclick={trocarTela(2)}*/ ref={refRanking}>Ranking</a>
                <a id="biblioteca" className="linkTrocarTela" /*onclick={trocarTela(3)}*/ ref={refBiblioteca}>Biblioteca</a>
                <a id="iaEstudos" className="linkTrocarTela" onClick={() => trocarTela('/chatBot')} ref={refIaEstudos}>IA para estudos</a>
                <a id="fees" className="linkFeed" ref={refFeed}>Feed</a>
                <div className="adicionarAtividade">
                <button onClick={AbrirAdicionarAtividade}>Adicione uma atividade na trilha</button>
            </div>
            <form className="menuAdicionarAtividade" id="menuAdicionarAtividade" onSubmit={adicionarAtividade} ref={menuAdicionarAtividade}>
                <p>Nome: <input type="text" name="" id="novoNome" ref={refNovoNome}/></p>
                <p>Enunciado: <input type="text" name="" id="novoEnunciado" required ref={refNovoEnunciado}/></p>
                <p>Resposta: <input type="text" id="novaResposta" required ref={refNovaResposta}/></p>
                <p>alternativa 1 <input type="text" name="" id="novaAlternativa1" required ref={refNovaAlternativa1}/></p>
                <p>alternativa 2 <input type="text" name="" id="novaAlternativa2" required ref={refNovaAlternativa2}/></p>
                <p>alternativa 3 <input type="text" name="" id="novaAlternativa3" required ref={refNovaAlternativa3}/></p>
                <button type="submit">Adicionar atividade</button>
        </form>
            </div>
        </div>
    </>
        )
}

export default MenuEsquerda
