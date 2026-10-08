import Biblioteca from "../components/Biblioteca/Biblioteca"
import {registrarVisitaBiblioteca,} from "../components/utils/missoes";
import { useEffect } from "react";

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
