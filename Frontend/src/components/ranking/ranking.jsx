import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

import { EVENTO_MISSOES } from "../utils/missoes";
import Moki from "../../assets/MOKI.png";
import "./Ranking.css";
import "./ranking-transicao.css";

const moki = "/avatares-simio/moki.png";
const zoro = "/avatares-simio/zoro.png";
const miro = "/avatares-simio/miro.png";
const bimo = "/avatares-simio/bimo.png";
const ibra = "/avatares-simio/ibra.png";
const mika = "/avatares-simio/mika.png";
const kimo = "/avatares-simio/kimo.png";
const tuki = "/avatares-simio/tuki.png";
const nala = "/avatares-simio/nala.png";

const fotosPerfil = {
  moki,
  zoro,
  miro,
  bimo,
  ibra,
  mika,
  kimo,
  tuki,
  nala
};

const numero = new Intl.NumberFormat("pt-BR");
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
let ultimoRanking;

function prefereMovimentoReduzido() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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
  const foto = fotosPerfil[
    String(amigo.foto || "moki").trim().toLowerCase()
  ] || moki;

  return (
    <span
      className={`rk-avatar${grande ? " rk-avatar--grande" : ""}`}
      style={{
        backgroundColor: amigo.cor_fundo || "#B4CFA8",
      }}
    >
      <img
        src={foto}
        alt={`Avatar de ${amigo.nome}`}
      />
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
  const { state } = useLocation();
  const tipoDeNavegacao = useNavigationType();
  const animarEntrada = tipoDeNavegacao === "PUSH" && state?.transicaoDoRanking === true;

  const [prazo, setPrazo] = useState(proximaSegunda);
  const [participantes, setParticipantes] = useState(() =>
    ultimoRanking?.prazo === prazo ? ultimoRanking.participantes : []
  );
  const [carregando, setCarregando] = useState(() => ultimoRanking?.prazo !== prazo);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [aguardandoEntrada, setAguardandoEntrada] = useState(animarEntrada);

  const [contador, setContador] = useState(() => tempoRestante(prazo));
  const paginaRef = useRef(null);
  const listaRef = useRef(null);
  const minhaLinha = useRef(null);
  const observadorDestaque = useRef(null);
  const iniciouBusca = useRef(false);
  const semanaExibida = useRef(prazo);
  const posicoesAnteriores = useRef(null);
  const animacoesDasLinhas = useRef(new WeakMap());

  useLayoutEffect(() => {
    if (!animarEntrada) return;

    const entrada = paginaRef.current.getAnimations?.().find(
      (animacao) => animacao.animationName === "rk-entrada-pela-lateral"
    );
    let ativo = true;
    function revelarPodio() {
      if (ativo) setAguardandoEntrada(false);
    }

    if (entrada) entrada.finished.then(revelarPodio, revelarPodio);
    else revelarPodio();

    return () => { ativo = false; };
  }, [animarEntrada]);

  // Busca usuários reais e seus pontos semanais no backend.
  useEffect(() => {
    let ativo = true;
    let controller;
    let temporizador;
    let atualizarDepois = false;
    let temRanking = iniciouBusca.current || ultimoRanking?.prazo === prazo;

    async function buscarRanking(mostrarCarregamento = false) {
      if (controller) {
        atualizarDepois = true;
        return;
      }

      if (mostrarCarregamento && !temRanking) {
        setCarregando(true);
        setErro("");
      }

      controller = new AbortController();
      let tempoEsgotado = false;
      temporizador = setTimeout(() => {
        tempoEsgotado = true;
        controller.abort();
      }, 20000);

      try {
        const endpoint = `${API_URL}/ranking`;

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

        const participantesFormatados = dados.participantes.map((usuario) => ({
          ...usuario,
          id: Number(usuario.id),
          nome: usuario.nome || usuario.username || "Explorador",
          xp: Number(usuario.xp) || 0,
          cor_fundo: usuario.cor_fundo || "#B4CFA8",
          foto: usuario.foto,
        }));

        if (!ativo) return;

        const semana = proximaSegunda();
        const lista = listaRef.current;
        if (lista && semana === semanaExibida.current && !prefereMovimentoReduzido()) {
          const topo = lista.getBoundingClientRect().top;
          posicoesAnteriores.current = new Map(Array.from(lista.children, (linha, indice) => [
            linha.dataset.usuarioId,
            { indice, topo: linha.getBoundingClientRect().top - topo },
          ]));
        }

        semanaExibida.current = semana;
        temRanking = true;
        iniciouBusca.current = true;
        ultimoRanking = { prazo: semana, participantes: participantesFormatados };
        setParticipantes(participantesFormatados);
        setErro("");
      } catch (error) {
        if (!ativo || temRanking) return;

        console.error("[Ranking] Erro ao carregar:", error);

        if (tempoEsgotado) {
          setErro("A API demorou demais para responder. Verifique o servidor e o banco MySQL.");
        } else if (error.name !== "AbortError") {
          setErro(`Não foi possível carregar o ranking: ${error.message}`);
        }
      } finally {
        clearTimeout(temporizador);
        controller = undefined;
        if (ativo) {
          setCarregando(false);
          if (atualizarDepois) {
            atualizarDepois = false;
            buscarRanking();
          }
        }
      }
    }

    function atualizarRanking() {
      if (!document.hidden) buscarRanking();
    }

    buscarRanking(true);
    const intervalo = setInterval(() => {
      const proximoPrazo = proximaSegunda();
      setContador(tempoRestante(proximoPrazo));
      setPrazo(proximoPrazo);
      if (proximoPrazo === prazo) atualizarRanking();
    }, 30000);
    window.addEventListener(EVENTO_MISSOES, atualizarRanking);
    window.addEventListener("focus", atualizarRanking);
    document.addEventListener("visibilitychange", atualizarRanking);

    return () => {
      ativo = false;
      clearInterval(intervalo);
      clearTimeout(temporizador);
      controller?.abort();
      window.removeEventListener(EVENTO_MISSOES, atualizarRanking);
      window.removeEventListener("focus", atualizarRanking);
      document.removeEventListener("visibilitychange", atualizarRanking);
    };
  }, [prazo, tentativa]);

  useLayoutEffect(() => {
    const anteriores = posicoesAnteriores.current;
    posicoesAnteriores.current = null;
    const lista = listaRef.current;
    if (!lista || !anteriores || prefereMovimentoReduzido()) return;

    const animacoes = animacoesDasLinhas.current;
    const topo = lista.getBoundingClientRect().top;
    const deslocamentos = Array.from(lista.children).flatMap((linha, indice) => {
      const anterior = anteriores.get(linha.dataset.usuarioId);
      if (!anterior || anterior.indice === indice || !linha.animate) return [];

      const animacaoAnterior = animacoes.get(linha);
      if (animacaoAnterior) animacaoAnterior.cancel();
      const distancia = anterior.topo - (linha.getBoundingClientRect().top - topo);
      return Math.abs(distancia) >= 1 ? [{ linha, distancia }] : [];
    });

    for (const { linha, distancia } of deslocamentos) {
      animacoes.set(linha, linha.animate(
        [{ translate: `0 ${distancia}px` }, { translate: "0 0px" }],
        { duration: 480, easing: "cubic-bezier(0.22, 0.78, 0.3, 1)" }
      ));
    }
  }, [participantes]);

  // Ordena por XP; em caso de empate, usa nome e ID.
  const ordenados = useMemo(() => [...participantes].sort(
    (a, b) => b.xp - a.xp || a.nome.localeCompare(b.nome, "pt-BR") || a.id - b.id
  ), [participantes]);
  const finalistas = ordenados.slice(0, 3);

  const minhaPosicao = ordenados.findIndex(
    (amigo) => Number(amigo.id) === Number(usuarioId)
  );

  const eu = ordenados[minhaPosicao];

  const faltam =
    minhaPosicao > 0
      ? ordenados[minhaPosicao - 1].xp - eu.xp + 1
      : 0;

  useEffect(() => () => observadorDestaque.current?.disconnect(), []);

  function encontrarPosicao() {
    const linha = minhaLinha.current;
    if (!linha) return;

    observadorDestaque.current?.disconnect();
    const reduzirMovimento = prefereMovimentoReduzido();
    const { top, bottom, height } = linha.getBoundingClientRect();
    const alturaVisivel = document.documentElement.clientHeight;

    linha.focus({ preventScroll: true });

    if (top < 16 || bottom > alturaVisivel - 16) {
      window.scrollTo({
        top: Math.max(0, window.scrollY + top - (alturaVisivel - height) / 2),
        behavior: reduzirMovimento ? "instant" : "smooth",
      });
    }

    if (reduzirMovimento) return;

    linha.classList.remove("rk-linha--destaque");
    if (!window.IntersectionObserver) {
      linha.getBoundingClientRect();
      linha.classList.add("rk-linha--destaque");
      return;
    }

    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.intersectionRatio < 0.5 || !linha.isConnected) return;

      linha.classList.add("rk-linha--destaque");
      observador.disconnect();
    }, { threshold: 0.5 });

    observadorDestaque.current = observador;
    observador.observe(linha);
  }

  return (
    <section
      ref={paginaRef}
      className={animarEntrada ? "rk-pagina rk-pagina--entrada" : "rk-pagina"}
      aria-labelledby="rk-titulo"
    >
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

            <div className={animarEntrada && aguardandoEntrada ? "rk-podio rk-podio--aguardando" : "rk-podio"}>
              {[1, 0, 2].map((indice) => {
                const amigo = finalistas[indice];

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
                    key={indice}
                    className={`rk-finalista rk-finalista--${indice + 1}`}
                    style={{
                      "--rk-espera-finalista": `${(finalistas.length - indice - 1) * 140}ms`,
                    }}
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

              <button type="button" className="rk-ir-para-posicao" onClick={encontrarPosicao}>
                Minha posição
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 4v12m-5-5 5 5 5-5" />
                </svg>
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

            <ol className="rk-lista" ref={listaRef}>
              {ordenados.map((amigo, indice) => {
                const souEu = Number(amigo.id) === Number(usuarioId);

                return (
                  <li
                    key={amigo.id}
                    data-usuario-id={amigo.id}
                    ref={souEu ? minhaLinha : undefined}
                    tabIndex={souEu ? -1 : undefined}
                    className={`rk-linha${souEu ? " rk-linha--eu" : ""}`}
                    aria-current={souEu ? "true" : undefined}
                  >
                    <span
                      className={`rk-posicao${indice < 3 ? ` rk-posicao--${indice + 1}` : ""
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
