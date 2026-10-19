import { Link } from "react-router-dom";

import Theo from "../../assets/nos/img/luciano.jpg";
import Arthur from "../../assets/nos/img/calleri.jpg";
import Kauan from "../../assets/nos/img/lucas.jpg";
import Simao from "../../assets/nos/img/rafael.jpg";

import "./instagram.css";

const equipe = [
  {
    nome: "Theo",
    foto: Theo,
    area: "Front-end",
    funcao: "Design e identidade visual",
    instagram: "USUARIO_THEO",
  },
  {
    nome: "Arthur",
    foto: Arthur,
    area: "Back-end",
    funcao: "Integração das funcionalidades",
    instagram: "USUARIO_ARTHUR",
  },
  {
    nome: "Kauan",
    foto: Kauan,
    area: "Front-end",
    funcao: "Ajustes de interface",
    instagram: "USUARIO_KAUAN",
  },
  {
    nome: "Guilherme Simão",
    foto: Simao,
    area: "Back-end",
    funcao: "Banco de dados",
    instagram: "USUARIO_SIMAO",
  },
];

function Instagram() {
  return (
    <div className="pagina-instagram">
      <svg
        className="icones"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <symbol id="icone-instagram" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </symbol>

        <symbol id="icone-seta" viewBox="0 0 24 24">
          <path d="M7 17 17 7M7 7h10v10" />
        </symbol>
      </svg>

      <header className="cabecalho">
        <Link className="voltar" to="/#rodape">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>

          Voltar ao site
        </Link>
      </header>

      <br />
      <br />

      <main className="pagina">
        <section className="equipe" aria-labelledby="equipe-titulo">
          <h1 id="equipe-titulo">
            <svg
              className="titulo-instagram__icone"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>

            Nosso Instagram
          </h1>

          <div className="cards">
            {equipe.map((pessoa) => (
              <article className="card" key={pessoa.instagram}>
                <div className="foto">
                  <img
                    src={pessoa.foto}
                    alt={`Foto de perfil de ${pessoa.nome}`}
                  />
                </div>

                <div className="card__conteudo">
                  <span className="card__cargo">DESENVOLVEDOR</span>

                  <h2>{pessoa.nome}</h2>

                  <p>{pessoa.area}</p>
                  <p>{pessoa.funcao}</p>

                  <a
                    className="instagram"
                    href={`https://www.instagram.com/${pessoa.instagram}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram de ${pessoa.nome} (abre em nova aba)`}
                  >
                    <svg className="instagram__icone" aria-hidden="true">
                      <use href="#icone-instagram" />
                    </svg>

                    <span>Ver Instagram</span>

                    <svg className="instagram__seta" aria-hidden="true">
                      <use href="#icone-seta" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="rodape">
        <span>© 2026 SimioLab</span>
        <span>Aprenda. Explore. Evolua.</span>
      </footer>
    </div>
  );
}

export default Instagram;