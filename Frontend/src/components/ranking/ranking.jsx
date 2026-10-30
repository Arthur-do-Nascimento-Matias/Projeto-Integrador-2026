import { useEffect, useRef, useState } from "react";

import Moki from "../../assets/MOKI.png";
import "./Ranking.css";

const numero = new Intl.NumberFormat("pt-BR");
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
const cores = ["menta", "areia", "rosa", "laranja", "azul"];

// Próxima segunda-feira, às 00h, no horário do navegador.
function proximaSegunda() {
  const data = new Date();
  const dias = (8 - data.getDay()) % 7 || 7;

  data.setDate(data.getDate() + dias);
  data.setHours(0, 0, 0, 0);

  return data.getTime();
}

function tempoRestante(fim) {
  const minutos = Math.max(0, Math.ceil((fim - Date.now()) / 60000));
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
    <svg className="rk-coroa" viewBox="0 0 64 48" aria-hidden="true">
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

export default function Ranking({ usuarioId }) {
  const [participantes, setParticipantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  const [prazo] = useState(proximaSegunda);
  const [contador, setContador] = useState(() => tempoRestante(prazo));
  const minhaLinha = useRef(null);

  // Busca usuários reais e seus pontos semanais no backend.
  useEffect(() => {
    const controller = new AbortController();
    let ativo = true;
    let tempoEsgotado = false;

    // Evita manter "Carregando ranking..." indefinidamente.
    const temporizador = setTimeout(() => {
      tempoEsgotado = true;
      controller.abort();
    }, 20000);

    async function buscarRanking() {
      setCarregando(true);
      setErro("");

      try {
        const endpoint = `${API_URL}/ranking`;
        console.log("[Ranking] Buscando:", endpoint);

        const resposta = await fetch(endpoint, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!resposta.ok) {
          throw new Error(`Servidor retornou HTTP ${resposta.status}.`);
        }

        const dados = await resposta.json();

        if (!dados.ok || !Array.isArray(dados.participantes)) {
          throw new Error(dados.message || "Resposta inválida do servidor.");
        }

        const participantesFormatados = dados.participantes.map((usuario, indice) => ({
          ...usuario,
          id: Number(usuario.id),
          nome: usuario.nome || usuario.username || "Explorador",
          xp: Number(usuario.xp) || 0,
          cor: cores[indice % cores.length],
        }));

        if (ativo) setParticipantes(participantesFormatados);
      } catch (error) {
        if (!ativo) return;

        console.error("[Ranking] Erro ao carregar:", error);

        if (tempoEsgotado) {
          setErro("A API demorou demais para responder. Verifique o servidor e o banco MySQL.");
        } else if (error.name !== "AbortError") {
          setErro(`Não foi possível carregar o ranking: ${error.message}`);
        }
      } finally {
        clearTimeout(temporizador);
        if (ativo) setCarregando(false);
      }
    }

    buscarRanking();

    return () => {
      ativo = false;
      clearTimeout(temporizador);
      controller.abort();
    };
  }, [tentativa]);

  // Ordena por XP; em caso de empate, usa nome e ID.
  const ordenados = [...participantes].sort(
    (a, b) =>
      b.xp - a.xp ||
      a.nome.localeCompare(b.nome, "pt-BR") ||
      a.id - b.id
  );

  const minhaPosicao = ordenados.findIndex(
    (amigo) => Number(amigo.id) === Number(usuarioId)
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
    if (!minhaLinha.current) return;

    const reduzirMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    minhaLinha.current.scrollIntoView({
      behavior: reduzirMovimento ? "auto" : "smooth",
      block: "center",
    });

    minhaLinha.current.focus({ preventScroll: true });
  }

  return (
    <section className="rk-pagina" aria-labelledby="rk-titulo">
{/* CABEÇALHO */}
<header className="rk-cabecalho">
  <div className="rk-titulo-bloco">
    <span className="rk-sobrancelha">
      APRENDER JUNTOS É MAIS DIVERTIDO
    </span>

    <h1 id="rk-titulo">
      Ranking de <em>amigos</em>
    </h1>

    <p className="rankingIntro">Cada descoberta te leva um galho mais alto.</p>

    <div className="rk-info-semana">
      <span>
        {ordenados.length} participantes · Ranking semanal
      </span>
    </div>
  </div>

  <div className="rk-relogio">
    <span>◷ &nbsp; FIM DA SEMANA</span>
    <strong>{contador}</strong>
    <small>Renovação às segundas</small>
  </div>
</header>


      {carregando ? (
        <div className="rk-vazio" role="status">
          <img src={Moki} alt="Moki" />
          <h2>Carregando ranking...</h2>
          <p>Buscando os exploradores da semana.</p>
        </div>
      ) : erro ? (
        <div className="rk-vazio" role="alert">
          <img src={Moki} alt="Moki" />
          <h2>Ops! Algo deu errado.</h2>
          <p>{erro}</p>
          <button type="button" onClick={() => setTentativa((n) => n + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : ordenados.length === 0 ? (
        <div className="rk-vazio">
          <img src={Moki} alt="Moki" />
          <h2>Uma turma, muitas conquistas!</h2>
          <p>Os participantes aparecerão aqui quando houver usuários cadastrados.</p>
        </div>
      ) : (
        <>
          {/* PÓDIO: SEGUNDO, PRIMEIRO, TERCEIRO */}
          <section className="rk-arena" aria-label="Pódio dos três primeiros">
            <span className="rk-folha rk-folha--um" aria-hidden="true" />
            <span className="rk-folha rk-folha--dois" aria-hidden="true" />

            <div className="rk-podio">
              {[1, 0, 2].map((indice) => {
                const amigo = ordenados[indice];

                if (!amigo) {
                  return (
                    <div key={indice} className="rk-lugar-vazio" />
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
                    className={`rk-finalista rk-finalista--${indice + 1}`}
                    aria-label={`${indice + 1}º lugar: ${amigo.nome}, ${numero.format(amigo.xp)} XP`}
                  >
                    <div className="rk-personagem">
                      {indice === 0 && <Coroa />}
                      <Avatar amigo={amigo} grande />
                    </div>

                    <strong className="rk-nome-podio">
                      {amigo.nome}
                      {Number(amigo.id) === Number(usuarioId) &&
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
            <aside className="rk-meu-resumo" aria-label="Resumo da sua posição">
              <span className="rk-minha-medalha">{minhaPosicao + 1}º</span>

              <div>
                <strong>
                  {minhaPosicao === 0
                    ? "O topo é seu. Continue explorando!"
                    : "Seu próximo galho está pertinho!"}
                </strong>

                <p>
                  {minhaPosicao === 0
                    ? "Você está liderando o desafio desta semana."
                    : `Mais ${numero.format(faltam)} XP para ultrapassar ${ordenados[minhaPosicao - 1].nome}.`}
                </p>
              </div>

              <button type="button" onClick={encontrarPosicao}>
                Minha posição <span aria-hidden="true">↓</span>
              </button>
            </aside>
          )}

          {/* LISTA COMPLETA */}
          <section className="rk-classificacao" aria-labelledby="rk-lista-titulo">
            <header>
              <div>
                <h2 id="rk-lista-titulo">A turma toda</h2>
                <p>Um pouco de competição. Muito aprendizado.</p>
              </div>

              <span>XP DA SEMANA</span>
            </header>

            <ol className="rk-lista">
              {ordenados.map((amigo, indice) => {
                const souEu = Number(amigo.id) === Number(usuarioId);

                return (
                  <li
                    key={amigo.id}
                    ref={souEu ? minhaLinha : undefined}
                    tabIndex={souEu ? -1 : undefined}
                    className={`rk-linha${souEu ? " rk-linha--eu" : ""}`}
                    aria-current={souEu ? "true" : undefined}
                  >
                    <span
                      className={`rk-posicao${
                        indice < 3 ? ` rk-posicao--${indice + 1}` : ""
                      }`}
                    >
                      {indice + 1}
                      <span className="rk-sr">º lugar</span>
                    </span>

                    <Avatar amigo={amigo} />

                    <div className="rk-identidade">
                      <strong>{amigo.nome}</strong>
                      <span>
                        {souEu
                          ? "Esse é você!"
                          : indice < 5
                            ? "Entre os 5 primeiros"
                            : "Na trilha do conhecimento"}
                      </span>
                    </div>

                    {indice < 5 && (
                      <span className="rk-selo" title="Faixa de premiação prevista">
                        ★
                        <span className="rk-sr"> Entre os cinco primeiros</span>
                      </span>
                    )}

                    <span className="rk-pontos">
                      <strong>{numero.format(amigo.xp)}</strong>
                      <small>XP</small>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}
    </section>
  );
}
