import { useEffect, useRef, useState } from "react";
import Moki from "../../assets/MOKI.png";
import "./Ranking.css";

// DADOS DE EXEMPLO
// Depois, estes participantes poderão vir do backend.
export const amigosExemplo = [
  { id: "ana", nome: "Ana", xp: 2480, cor: "menta" },
  { id: "pedro", nome: "Pedro", xp: 2210, cor: "areia" },
  { id: "bia", nome: "Bia", xp: 1960, cor: "rosa" },
  { id: "voce", nome: "Você", xp: 1840, cor: "laranja" },
  { id: "lucas", nome: "Lucas", xp: 1720, cor: "azul" },
  { id: "julia", nome: "Júlia", xp: 1540, cor: "rosa" },
  { id: "rafa", nome: "Rafa", xp: 1280, cor: "menta" },
  { id: "leo", nome: "Léo", xp: 950, cor: "areia" },
];

const numero = new Intl.NumberFormat("pt-BR");

// Próxima segunda-feira, às 00h, no horário do navegador.
function proximaSegunda() {
  const data = new Date();
  const dias = (8 - data.getDay()) % 7 || 7;

  data.setDate(data.getDate() + dias);
  data.setHours(0, 0, 0, 0);

  return data.getTime();
}

function tempoRestante(fim) {
  const minutos = Math.max(
    0,
    Math.ceil((fim - Date.now()) / 60000)
  );

  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor(minutos / 60) % 24;
  const minutosRestantes = minutos % 60;

  return `${dias}d ${horas}h ${minutosRestantes}min`;
}

function Avatar({ amigo, grande = false }) {
  return (
    <span
      className={[
        "rk-avatar",
        `rk-avatar--${amigo.cor || "menta"}`,
        grande ? "rk-avatar--grande" : "",
      ].join(" ")}
    >
      <img src={Moki} alt="" />
    </span>
  );
}

function Coroa() {
  return (
    <svg
      className="rk-coroa"
      viewBox="0 0 64 48"
      aria-hidden="true"
    >
      <path
        d="m8 12 14 10L32 5l10 17 14-10-6 29H14Z"
        fill="#ffb238"
        stroke="#a6631e"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M17 34h30"
        stroke="#fff0b8"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Ranking({
  participantes = amigosExemplo,
  usuarioId = "voce",
}) {
  const [prazo] = useState(proximaSegunda);

  const [contador, setContador] = useState(() =>
    tempoRestante(prazo)
  );

  const minhaLinha = useRef(null);

  // Ordena por XP. Em caso de empate, usa nome e ID.
  const ordenados = [...participantes].sort(
    (a, b) =>
      b.xp - a.xp ||
      a.nome.localeCompare(b.nome, "pt-BR") ||
      String(a.id).localeCompare(String(b.id))
  );

  const minhaPosicao = ordenados.findIndex(
    (amigo) => amigo.id === usuarioId
  );

  const eu = ordenados[minhaPosicao];

  const faltam =
    minhaPosicao > 0
      ? ordenados[minhaPosicao - 1].xp - eu.xp + 1
      : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setContador(tempoRestante(prazo));
    }, 30000);

    return () => clearInterval(timer);
  }, [prazo]);

  function encontrarPosicao() {
    const reduzirMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    minhaLinha.current?.scrollIntoView({
      behavior: reduzirMovimento ? "instant" : "smooth",
      block: "center",
    });

    minhaLinha.current?.focus({
      preventScroll: true,
    });
  }

  return (
    <section
      className="rk-pagina"
      aria-labelledby="rk-titulo"
    >
      {/* CABEÇALHO */}
      <header className="rk-cabecalho">
        <div>
          <span className="rk-sobrancelha">
            APRENDER JUNTOS É MAIS DIVERTIDO
          </span>

          <h1 id="rk-titulo">
            Ranking de <em>amigos</em>
          </h1>

          <p>
            Cada descoberta te leva um galho mais alto.
          </p>
        </div>

        <div className="rk-relogio">
          <span>◷ &nbsp; FIM DA SEMANA</span>
          <strong>{contador}</strong>
          <small>Renovação às segundas</small>
        </div>
      </header>

      {/* INFORMAÇÕES DA SEMANA */}
      <div className="rk-barra">
        <span className="rk-tag">
          ● &nbsp; Desafio semanal
        </span>

        <span>
          {ordenados.length} participantes · Prévia com dados
          de exemplo
        </span>
      </div>

      {ordenados.length === 0 ? (
        <div className="rk-vazio">
          <img src={Moki} alt="Moki" />

          <h2>Uma turma, muitas conquistas!</h2>

          <p>
            Seus amigos aparecerão aqui quando a função de
            adicionar amigos estiver disponível.
          </p>
        </div>
      ) : (
        <>
          {/* PÓDIO: SEGUNDO, PRIMEIRO, TERCEIRO */}
          <section
            className="rk-arena"
            aria-label="Pódio dos três primeiros"
          >
            <span
              className="rk-folha rk-folha--um"
              aria-hidden="true"
            />

            <span
              className="rk-folha rk-folha--dois"
              aria-hidden="true"
            />

            <div className="rk-podio">
              {[1, 0, 2].map((indice) => {
                const amigo = ordenados[indice];

                if (!amigo) {
                  return (
                    <div
                      key={indice}
                      className="rk-lugar-vazio"
                    />
                  );
                }

                const frases = [
                  "NO TOPO!",
                  "MANDOU BEM!",
                  "BOA, EXPLORADOR!",
                ];

                return (
                  <article
                    key={amigo.id}
                    className={`rk-finalista rk-finalista--${
                      indice + 1
                    }`}
                    aria-label={`${
                      indice + 1
                    }º lugar: ${amigo.nome}, ${numero.format(
                      amigo.xp
                    )} XP`}
                  >
                    <div className="rk-personagem">
                      {indice === 0 && <Coroa />}

                      <Avatar amigo={amigo} grande />
                    </div>

                    <strong className="rk-nome-podio">
                      {amigo.nome}

                      {amigo.id === usuarioId &&
                      amigo.nome !== "Você"
                        ? " (Você)"
                        : ""}
                    </strong>

                    <span className="rk-xp-podio">
                      {numero.format(amigo.xp)} XP
                    </span>

                    <div className="rk-plataforma">
                      <span>{indice + 1}</span>
                      <small>{frases[indice]}</small>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* RESUMO DO USUÁRIO */}
          {eu && (
            <aside
              className="rk-meu-resumo"
              aria-label="Resumo da sua posição"
            >
              <span className="rk-minha-medalha">
                {minhaPosicao + 1}º
              </span>

              <div>
                <strong>
                  {minhaPosicao === 0
                    ? "O topo é seu. Continue explorando!"
                    : "Seu próximo galho está pertinho!"}
                </strong>

                <p>
                  {minhaPosicao === 0
                    ? "Você está liderando o desafio desta semana."
                    : `Mais ${numero.format(
                        faltam
                      )} XP para ultrapassar ${
                        ordenados[minhaPosicao - 1].nome
                      }.`}
                </p>
              </div>

              <button
                type="button"
                onClick={encontrarPosicao}
              >
                Minha posição{" "}
                <span aria-hidden="true">↓</span>
              </button>
            </aside>
          )}

          {/* LISTA COMPLETA */}
          <section
            className="rk-classificacao"
            aria-labelledby="rk-lista-titulo"
          >
            <header>
              <div>
                <h2 id="rk-lista-titulo">A turma toda</h2>

                <p>
                  Um pouco de competição. Muito aprendizado.
                </p>
              </div>

              <span>XP DA SEMANA</span>
            </header>

            <ol className="rk-lista">
              {ordenados.map((amigo, indice) => (
                <li
                  key={amigo.id}
                  ref={
                    amigo.id === usuarioId
                      ? minhaLinha
                      : undefined
                  }
                  tabIndex={
                    amigo.id === usuarioId ? -1 : undefined
                  }
                  className={`rk-linha${
                    amigo.id === usuarioId
                      ? " rk-linha--eu"
                      : ""
                  }`}
                  aria-current={
                    amigo.id === usuarioId
                      ? "true"
                      : undefined
                  }
                >
                  <span
                    className={`rk-posicao${
                      indice < 3
                        ? ` rk-posicao--${indice + 1}`
                        : ""
                    }`}
                  >
                    {indice + 1}
                    <span className="rk-sr">º lugar</span>
                  </span>

                  <Avatar amigo={amigo} />

                  <div className="rk-identidade">
                    <strong>{amigo.nome}</strong>

                    <span>
                      {amigo.id === usuarioId
                        ? "Esse é você!"
                        : indice < 5
                          ? "Entre os 5 primeiros"
                          : "Na trilha do conhecimento"}
                    </span>
                  </div>

                  {indice < 5 && (
                    <span
                      className="rk-selo"
                      title="Faixa de premiação prevista"
                    >
                      ★
                      <span className="rk-sr">
                        {" "}
                        Entre os cinco primeiros
                      </span>
                    </span>
                  )}

                  <span className="rk-pontos">
                    <strong>
                      {numero.format(amigo.xp)}
                    </strong>

                    <small>XP</small>
                  </span>
                </li>
              ))}
            </ol>

            <footer>
              Atividades, missões e estudo vão somar XP.
              Recompensas digitais previstas para os 5
              primeiros.
            </footer>
          </section>
        </>
      )}
    </section>
  );
}