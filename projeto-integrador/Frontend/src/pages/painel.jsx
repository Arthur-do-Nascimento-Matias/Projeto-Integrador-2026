import Trilha from "../components/trilhaAtividades/trilha";
import MenuEsquerda from "../components/menuEsquerda/menuEsquerda";
import MenuDireita from "../components/menuDireita/menuDireita";

function Painel() {
    return(
        <>
        <MenuEsquerda />
        <Trilha />
        <MenuDireita />
        </>
    )
}

export default Painel
