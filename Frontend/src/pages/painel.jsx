<<<<<<< HEAD
import MenuDireita from "../components/MenuDireita/menuDireita";
import Atividades from "../components/atividades/atividades";
=======
import MenuDireita from "../components/MenuDireita/MenuDireita";
import Atividades from "../components/Atividades/Atividades";
>>>>>>> origin/theo
import Materias from "../components/SelecionarMateria/Materias";
import { useRef, useState } from 'react'


function Painel({ draft, setDraft }) {

    const refEnunciado = useRef(null)
    const refAlternativa1 = useRef(null)
    const refAlternativa2 = useRef(null)
    const refAlternativa3 = useRef(null)
    const refAlternativa4 = useRef(null)

    const [materiaAtual, setMateriaAtual] = useState(2)

    const refAtividade = useRef(null)

    const [atividadeAtual, setAtividadeAtual] = useState(0)
    const [atvLiberada, setAtvLiberada] = useState(1)

<<<<<<< HEAD
        return(
        <>

            <Materias
                draft={draft}
                setDraft={setDraft} 
=======
    return (
        <>

            <MenuDireita
                draft={draft}
            />

            <Materias
                draft={draft}
                setDraft={setDraft}
>>>>>>> origin/theo
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

<<<<<<< HEAD
            <Atividades 
                draft={draft}
                setDraft={setDraft} 
=======
            <Atividades
                draft={draft}
                setDraft={setDraft}
>>>>>>> origin/theo
                refEnunciado={refEnunciado}
                refAlternativa1={refAlternativa1}
                refAlternativa2={refAlternativa2}
                refAlternativa3={refAlternativa3}
                refAlternativa4={refAlternativa4}
                refAtividade={refAtividade}
                atividadeAtual={atividadeAtual}
                setAtividadeAtual={setAtividadeAtual}
                setAtvLiberada={setAtvLiberada}
                materiaAtual={materiaAtual}
            />

<<<<<<< HEAD
            <MenuDireita 
                draft={draft}
            />

=======
>>>>>>> origin/theo
        </>
    )
}

export default Painel
