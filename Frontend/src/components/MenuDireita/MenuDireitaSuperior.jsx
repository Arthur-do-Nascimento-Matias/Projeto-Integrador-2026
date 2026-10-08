import { Link } from "react-router-dom";

import simio from "../../assets/simio.png";

import "./MenuDireitaSuperior.css";

function MenuDireitaSuperior() {
  return (
    <section
      className="menuDireita-card menuDireitaSuperior"
      aria-labelledby="menuDireita-divisao-titulo"
    >
      <div className="menuDireita-cabecalho">
        <h3 id="menuDireita-divisao-titulo">
          Divisão Ouro
        </h3>
      </div>

      <div className="menuDireitaSuperior-conteudo">
        <img
          src={simio}
          alt="Mascote Simio"
        />

        <p>
          Faça uma lição pra entrar no ranking dessa semana
          e competir com as outras pessoas.
        </p>
      </div>

      <Link
        to="/Ranking"
        className="menuDireitaSuperior-botao"
      >
        VER DIVISÃO
      </Link>
    </section>
  );
}

export default MenuDireitaSuperior;