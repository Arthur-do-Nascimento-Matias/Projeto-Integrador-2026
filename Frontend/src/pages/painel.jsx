import MenuDireita from "../components/MenuDireita/MenuDireita";
import Atividades from "../components/Atividades/Atividades";
import Materias from "../components/SelecionarMateria/Materias";
import { useRef, useState } from 'react'


function Painel() {

    const [materiaAtual, setMateriaAtual] = useState(1)

    const refAtividade = useRef(null)

    const [atividadeAtual, setAtividadeAtual] = useState(0)
    const [atvLiberada, setAtvLiberada] = useState(1)

        return(
        <>

            <Materias 
                refAtividade={refAtividade}
                atividadeAtual={atividadeAtual}
                setAtividadeAtual={setAtividadeAtual}
                atvLiberada={atvLiberada}
                setMateriaAtual={setMateriaAtual}
            />

            <Atividades 
                refAtividade={refAtividade}
                atividadeAtual={atividadeAtual}
                setAtvLiberada={setAtvLiberada}
                materiaAtual={materiaAtual}
            />

            <MenuDireita />

        </>
    )
}

export default Painel
