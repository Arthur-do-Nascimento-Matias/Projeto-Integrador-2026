import Trilha from "../components/trilhaAtividades/trilha";
import MenuEsquerda from "../components/menuEsquerda/menuEsquerda";
import MenuDireita from "../components/menuDireita/menuDireita";
import Header from "../components/header/header"
import Atividades from "../components/atividades/atividades";
import ChatBot from "../components/chatBot/chatBot"
import { useRef, useState } from 'react'

function Painel() {

    const refAtividade = useRef(null)

    const [atividadeAtual, setAtividadeAtual] = useState(null)
    const [atvLiberada, setAtvLiberada] = useState(1)

        return(
        <>
            <Header />
            <MenuEsquerda />

            <Trilha 
                refAtividade={refAtividade}
                setAtividadeAtual={setAtividadeAtual}
                atvLiberada={atvLiberada}
            />
            <Atividades 
                refAtividade={refAtividade}
                atividadeAtual={atividadeAtual}
                setAtvLiberada={setAtvLiberada}
            />
            <MenuDireita />
          {/*  <ChatBot/>  */}
        </>
    )
}

export default Painel
