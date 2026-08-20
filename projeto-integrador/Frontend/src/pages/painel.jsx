import Trilha from "../components/trilhaAtividades/trilha";
import MenuEsquerda from "../components/menuEsquerda/menuEsquerda";
import MenuDireita from "../components/menuDireita/menuDireita";
import Header from "../components/header/header"
import Atividades from "../components/atividades/atividades";

function Painel() {
    return(
        <>
            <Header />
            <MenuEsquerda />
            <Trilha />
          {/*  <Atividades /> */}
            <MenuDireita />
            <chatBot/>
        </>
    )
}

export default Painel
