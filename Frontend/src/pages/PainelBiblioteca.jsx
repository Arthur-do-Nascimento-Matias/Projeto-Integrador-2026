import Biblioteca from "../components/Biblioteca/Biblioteca"
import MenuEsquerda from "../components/MenuEsquerda/MenuEsquerda"
import {registrarVisitaBiblioteca,} from "../components/utils/missoes";


function PainelBiblioteca() {
  useEffect(() => {
    registrarVisitaBiblioteca();
  }, [])

    return(

        <>


            <Biblioteca />

        </>
    )
}

export default PainelBiblioteca
