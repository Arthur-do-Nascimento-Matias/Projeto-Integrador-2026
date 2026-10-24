import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import simio from "../../assets/simio.png";

import "./MenuDireitaSuperior.css";

function MenuDireitaSuperior({ draft }) {

  const [posicao, setPosicao] = useState(null);

  useEffect(() => {
      if (!draft?.id) return;

      fetch(`http://localhost:3000/posicao?idUser=${draft.id}`)
          .then(resp => resp.json())
          .then(data => setPosicao(data.posicao))
          .catch(error => console.error(error));

  }, [draft?.id]);

    return (
        <section
            className="menuDireita-card menuDireitaSuperior"
            aria-labelledby="menuDireita-divisao-titulo"
        >
            <div className="menuDireita-cabecalho">
                <h3 id="menuDireita-divisao-titulo">
                    Sua posição no ranking
                </h3>
            </div>

            <div className="menuDireitaSuperior-conteudo">

                <h3>{posicao !== null ? `${posicao}º lugar` : "Carregando..."}</h3>

                <p>
                    Faça uma lição pra subir no ranking dessa semana
                    e competir com as outras pessoas.
                </p>
            </div>

            <Link
                to="/Ranking"
                className="menuDireitaSuperior-botao"
            >
                VER RANKING
            </Link>
        </section>
    );
}

export default MenuDireitaSuperior;
