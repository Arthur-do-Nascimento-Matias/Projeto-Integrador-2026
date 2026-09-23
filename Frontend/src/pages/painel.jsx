import MenuDireita from "../components/MenuDireita/MenuDireita";
import Atividades from "../components/Atividades/Atividades";
import Materias from "../components/SelecionarMateria/Materias";
import { useRef, useState } from 'react'


function Painel() {


    const refAtividade = useRef(null)

    const [atividadeAtual, setAtividadeAtual] = useState(null)
    const [atvLiberada, setAtvLiberada] = useState(1)

        return(
        <>

            <Materias />

            <Atividades 
                refAtividade={refAtividade}
                atividadeAtual={atividadeAtual}
                setAtvLiberada={setAtvLiberada}
            />
            <MenuDireita />
        </>
    )
}

export default Painel
