import { useEffect } from 'react'
import '../atividades/atividades.css'

function atividades() {

    
function sairAtividade() {
    indiceAtv = 0
    document.querySelectorAll('.botaoAtividade').forEach(elemento => {
        elemento.remove()
    })
    criarTrilha()
    telaAtividade.style.transform = 'translateX(100%)'
    trilha.style.opacity = '1'
}


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

useEffect(() => {
    embaralhado()
})

    return(
        <>
            <div className="atividade" id="atividade">
                    <button onClick={sairAtividade}>Sair</button>
                    <h1 className="enunciado" id="enunciado"></h1>
                    <button className="alternativa1" id="alternativa1" onClick={(e) => verificar(0, e.currentTarget)}></button>
                    <button className="alternativa2" id="alternativa2" onClick={(e) => verificar(1, e.currentTarget)}></button>
                    <button className="alternativa3" id="alternativa3" onClick={(e) => verificar(2, e.currentTarget)}></button>
                    <button className="alternativa4" id="alternativa4" onClick={(e) => verificar(3, e.currentTarget)}></button>
                    </div>
                    
                    <div className="parabens" id="parabens">
                    <h1>🎉 Parabéns!</h1>
                    <p>Você concluiu esta atividade.</p>
                    <button onClick={fecharParabens}>Continuar</button>
                </div>
        </>
    )
}

export default atividades
