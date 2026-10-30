import MenuEsquerda from "../components/MenuEsquerda/MenuEsquerda"
import Perfil from "../components/Perfil/Perfil"

function PainelPerfil({ draft, setDraft }) {
    return(

        <>


            <Perfil 
                draft={draft}
                setDraft={setDraft} 
            />

        </>
    )
}

export default PainelPerfil
