import { Link } from "react-router-dom";

import Theo from "../../assets/nos/img/luciano.jpg";
import Arthur from "../../assets/nos/img/calleri.jpg";
import Kauan from "../../assets/nos/img/lucas.jpg";
import Simao from "../../assets/nos/img/rafael.jpg";

import "./git.css";

const equipe = [
  {
    nome: "Theo",
    foto: Theo,
    funcoes: ["Front-end", "Design e identidade visual"],
    github: "USUARIO_THEO",
  },
  {
    nome: "Arthur",
    foto: Arthur,
    funcoes: ["Back-end", "Integração das funcionalidades"],
    github: "USUARIO_ARTHUR",
  },
  {
    nome: "Kauan",
    foto: Kauan,
    funcoes: ["Front-end", "Ajustes de interface"],
    github: "USUARIO_KAUAN",
  },
  {
    nome: "Guilherme Simão",
    foto: Simao,
    funcoes: ["Back-end", "Banco de dados"],
    github: "USUARIO_SIMAO",
  },
];

function Github() {
  return (
    <div className="pagina-github">
      <svg
        className="icones"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <symbol id="icone-github" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.542 0-.267-.01-.974-.015-1.912-3.13.68-3.79-1.51-3.79-1.51-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.722 2.638 1.225 3.28.937.103-.729.393-1.226.715-1.508-2.499-.284-5.126-1.25-5.126-5.565 0-1.23.44-2.234 1.16-3.022-.116-.284-.503-1.43.11-2.98 0 0 .945-.303 3.094 1.155A10.78 10.78 0 0 1 12 6.177c.956.005 1.918.13 2.816.378 2.148-1.458 3.09-1.155 3.09-1.155.616 1.55.23 2.696.113 2.98.722.788 1.158 1.792 1.158 3.022 0 4.326-2.63 5.278-5.136 5.557.404.348.766 1.034.766 2.084 0 1.505-.014 2.72-.014 3.088 0 .3.202.65.774.54A11.252 11.252 0 0 0 12 .75Z"
          />
        </symbol>

        <symbol id="icone-seta" viewBox="0 0 24 24">
          <path
            d="M7 17 17 7M7 7h10v10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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

      <main className="pagina">
        <section className="equipe" aria-labelledby="equipe-titulo">
          <h1 id="equipe-titulo">
            <svg className="titulo-github__icone" viewBox="0 0 24 24" aria-hidden="true">
              <use href="#icone-github" />
            </svg>

            Nosso GitHub
          </h1>

          <div className="cards">
            {equipe.map((pessoa) => (
              <article className="card" key={pessoa.github}>
                <div className="foto">
                  <img
                    src={pessoa.foto}
                    alt={`Foto de perfil de ${pessoa.nome}`}
                  />
                </div>

                <div className="card__conteudo">
                  <span className="card__cargo">DESENVOLVEDOR</span>

                  <h2>{pessoa.nome}</h2>

                  <ul className="card__funcoes">
                    {pessoa.funcoes.map((funcao) => (
                      <li key={funcao}>{funcao}</li>
                    ))}
                  </ul>

                  <a
                    className="github"
                    href={`https://github.com/${pessoa.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`GitHub de ${pessoa.nome} (abre em nova aba)`}
                  >
                    <svg className="github__icone" aria-hidden="true">
                      <use href="#icone-github" />
                    </svg>

                    <span>Ver GitHub</span>

                    <svg className="github__seta" aria-hidden="true">
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

export default Github;