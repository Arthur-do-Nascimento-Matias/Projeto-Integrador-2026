import MenuDireita from "../components/MenuDireita/MenuDireita";
import Atividades from "../components/Atividades/Atividades";
import Materias from "../components/SelecionarMateria/Materias";
import { useRef, useState } from 'react'


function Painel() {

    const refEnunciado = useRef(null)
    const refAlternativa1 = useRef(null)
    const refAlternativa2 = useRef(null)
    const refAlternativa3 = useRef(null)
    const refAlternativa4 = useRef(null)

    const [materiaAtual, setMateriaAtual] = useState(2)

    const refAtividade = useRef(null)

    const [atividadeAtual, setAtividadeAtual] = useState(0)
    const [atvLiberada, setAtvLiberada] = useState(1)

        return(
        <>

            <Materias 
                refEnunciado={refEnunciado}
                refAlternativa1={refAlternativa1}
                refAlternativa2={refAlternativa2}
                refAlternativa3={refAlternativa3}
                refAlternativa4={refAlternativa4}
                refAtividade={refAtividade}
                atividadeAtual={atividadeAtual}
                setAtividadeAtual={setAtividadeAtual}
                atvLiberada={atvLiberada}
                setMateriaAtual={setMateriaAtual}
                materiaAtual={materiaAtual}
            />

            <Atividades 
                refEnunciado={refEnunciado}
                refAlternativa1={refAlternativa1}
                refAlternativa2={refAlternativa2}
                refAlternativa3={refAlternativa3}
                refAlternativa4={refAlternativa4}
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
