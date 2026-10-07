import { useEffect, useRef, useState } from "react";

import "./MenuDireitaInferior.css";

function IconeMissao({ nome }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {nome === "bandeira" && (
        <>
          <path d="M5 21V4" />
          <path d="M5 4c5-4 9 4 14 0v10c-5 4-9-4-14 0" />
        </>
      )}

      {nome === "alvo" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </>
      )}

      {nome === "livro" && (
        <>
          <path d="M12 5v15" />
          <path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1" />
          <path d="M12 5c3-2 7-2 10-1v15c-3-1-7-1-10 1" />
        </>
      )}

      {nome === "check" && (
        <path d="m5 12 4 4L19 6" />
      )}
    </svg>
  );
}

function ListaMissoes({ missoes }) {
  return (
    <ul className="menuDireitaInferior-lista">
      {missoes.map((missao) => (
        <li
          key={missao.id}
          className={`menuDireitaInferior-missao ${
            missao.concluida
              ? "menuDireitaInferior-missao--concluida"
              : ""
          }`}
        >
          <div
            className={`menuDireitaInferior-icone menuDireitaInferior-icone--${missao.icone}`}
          >
            <IconeMissao
              nome={missao.concluida ? "check" : missao.icone}
            />
          </div>

          <div className="menuDireitaInferior-texto">
            <div className="menuDireitaInferior-missao-topo">
              <h4>{missao.titulo}</h4>

              <span>
                {missao.progresso}/{missao.meta}
              </span>
            </div>

            <p>{missao.descricao}</p>

            <progress
              className="menuDireitaInferior-progresso"
              value={missao.progresso}
              max={missao.meta}
              aria-label={missao.titulo}
            />

            {missao.concluida && (
              <span className="menuDireitaInferior-status">
                Missão concluída!
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

const ID_USUARIO_TESTE = 22;

function descobrirIcone(tipo) {
  const icones = {
    concluir_atividade: "bandeira",
    acertar_questao: "alvo",
    tempo_leitura: "livro",
    abrir_livros: "livro",
    atividade_sem_erros: "check",
    acertos_seguidos: "alvo",
  };

  return icones[tipo] || "bandeira";
}

function converterMissao(missaoBanco) {
  return {
    id: missaoBanco.id_usuario_missao,
    titulo: missaoBanco.missao,
    descricao:
      missaoBanco.descricao ||
      "Complete esta missão para ganhar XP.",
    icone: descobrirIcone(missaoBanco.tipo),
    progresso: Number(missaoBanco.progresso),
    meta: Number(missaoBanco.meta),
    concluida: Number(missaoBanco.concluida) === 1,
  };
}

function MenuDireitaInferior() {
  const [missoes, setMissoes] = useState([]);

  const modalRef = useRef(null);
  const botaoRef = useRef(null);

    useEffect(() => {
    let componenteAtivo = true;

    async function carregarMissoes() {
      try {
        const resposta = await fetch(
          `http://localhost:3000/missoes/hoje?id_usuario=${ID_USUARIO_TESTE}`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.erro || "Não foi possível carregar as missões."
          );
        }

        const novasMissoes = (dados.missoes || []).map(
          converterMissao
        );

        if (componenteAtivo) {
          setMissoes(novasMissoes);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar missões:",
          error
        );

        if (componenteAtivo) {
          setMissoes([]);
        }
      }
    }

    carregarMissoes();

    window.addEventListener(
      "focus",
      carregarMissoes
    );

    return () => {
      componenteAtivo = false;

      window.removeEventListener(
        "focus",
        carregarMissoes
      );
    };
  }, []);

  const concluidas = missoes.filter(
    (missao) => missao.concluida
  ).length;

  const todasConcluidas =
    missoes.length > 0 && concluidas === missoes.length;

  function abrirModal() {
    modalRef.current?.showModal();
  }

  function fecharModal() {
    modalRef.current?.close();
  }

  return (
    <>
      <section
        className="menuDireita-card menuDireitaInferior"
        aria-labelledby="menuDireita-missoes-titulo"
      >
        <div className="menuDireita-cabecalho">
          <h3 id="menuDireita-missoes-titulo">
            Missões do dia
          </h3>

          <button
            ref={botaoRef}
            type="button"
            className="menuDireitaInferior-verTodas"
            onClick={abrirModal}
          >
            VER TODAS
          </button>
        </div>

        <div
          className="menuDireitaInferior-resumo"
          role="status"
        >
          <span>
            {todasConcluidas
              ? "Todas concluídas! Muito bem!"
              : "Um passo por vez!"}
          </span>

          <strong>
            {concluidas}/{missoes.length}
          </strong>
        </div>

        <ListaMissoes missoes={missoes} />

        <div className="menuDireitaInferior-rodape">
          <span aria-hidden="true" />

          Renovam à meia-noite · horário local
        </div>
      </section>

      <dialog
        ref={modalRef}
        className="menuDireitaInferior-modal"
        aria-labelledby="menuDireita-missoes-modal-titulo"
        onClose={() => botaoRef.current?.focus()}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) {
            fecharModal();
          }
        }}
      >
        <div className="menuDireitaInferior-modal-conteudo">
          <div className="menuDireitaInferior-modal-topo">
            <span className="menuDireitaInferior-etiqueta">
              SUA JORNADA DIÁRIA
            </span>

            <button
              type="button"
              className="menuDireitaInferior-fechar"
              onClick={fecharModal}
              aria-label="Fechar missões"
              autoFocus
            >
              
            </button>
          </div>

          <h2 id="menuDireita-missoes-modal-titulo">
            Pequenos passos.
            <br />
            Grandes conquistas.
          </h2>

          <p className="menuDireitaInferior-modal-descricao">
            Complete as metas de hoje no seu ritmo.
            Seu progresso é atualizado conforme você estuda.
          </p>

          <div className="menuDireitaInferior-total">
            <span>Missões concluídas</span>

            <strong>
              {concluidas} de {missoes.length}
            </strong>
          </div>

          <ListaMissoes missoes={missoes} />

          <p className="menuDireitaInferior-aviso">
            Progresso salvo neste navegador, compartilhado
            por quem usa este dispositivo. Ainda sem crédito
            de XP no ranking.
          </p>

          <button
            type="button"
            className="menuDireitaInferior-voltar"
            onClick={fecharModal}
          >
            ENTENDI!
          </button>
        </div>
      </dialog>
    </>
  );
}

export default MenuDireitaInferior;