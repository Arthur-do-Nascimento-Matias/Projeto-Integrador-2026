import { useState, useEffect, useRef } from "react";

import "./Materias.css";

import brIcon from "../../assets/materias/brasil.svg";
import enIcon from "../../assets/materias/ingles.svg";
import cienciaIcon from "../../assets/materias/ciencia.svg";
import geoIcon from "../../assets/materias/geografia.svg";
import histIcon from "../../assets/materias/historia.svg";
import matIcon from "../../assets/materias/matematica.svg";

import spriteTrilhaBimo from "../../assets/mascotes-trilha/trilha-bimo.png";
import spriteTrilhaIbra from "../../assets/mascotes-trilha/trilha-ibra.png";
import spriteTrilhaKimo from "../../assets/mascotes-trilha/trilha-kimo.png";
import spriteTrilhaMiro from "../../assets/mascotes-trilha/trilha-miro.png";
import spriteTrilhaMoki from "../../assets/mascotes-trilha/trilha-moki.png";
import spriteTrilhaNala from "../../assets/mascotes-trilha/trilha-nala.png";
import spriteTrilhaZoro from "../../assets/mascotes-trilha/trilha-zoro.png";

const materias = [
  {
    id: 2,
    nome: "Português",
    descricao: "Língua Portuguesa",
    cor: "#ff8214",
    icon: brIcon,
    mascote: spriteTrilhaMiro,
    cenario: "portugues",
  },
  {
    id: 1,
    nome: "Matemática",
    descricao: "Números e lógica",
    cor: "#75543c",
    icon: matIcon,
    mascote: spriteTrilhaBimo,
    cenario: "matematica",
  },
  {
    id: 3,
    nome: "História",
    descricao: "História e sociedade",
    cor: "#684936",
    icon: histIcon,
    mascote: spriteTrilhaIbra,
    cenario: "historia",
  },
  {
    id: 5,
    nome: "Ciências",
    descricao: "Natureza e ciência",
    cor: "#52663c",
    icon: cienciaIcon,
    mascote: spriteTrilhaKimo,
    cenario: "ciencias",
  },
  {
    id: 4,
    nome: "Geografia",
    descricao: "Espaço e território",
    cor: "#64724a",
    icon: geoIcon,
    mascote: spriteTrilhaNala,
    cenario: "geografia",
  },
  {
    id: 6,
    nome: "Inglês",
    descricao: "Língua Inglesa",
    cor: "#465936",
    icon: enIcon,
    mascote: spriteTrilhaZoro,
    cenario: "ingles",
  },
];

function pontoPolar(cx, cy, raio, angulo) {
  const radianos = ((angulo - 90) * Math.PI) / 180;

  return {
    x: cx + raio * Math.cos(radianos),
    y: cy + raio * Math.sin(radianos),
  };
}

function criarFatia(cx, cy, raioExterno, raioInterno, inicio, fim) {
  const externoInicio = pontoPolar(cx, cy, raioExterno, fim);
  const externoFim = pontoPolar(cx, cy, raioExterno, inicio);
  const internoInicio = pontoPolar(cx, cy, raioInterno, inicio);
  const internoFim = pontoPolar(cx, cy, raioInterno, fim);
  const arcoGrande = fim - inicio <= 180 ? 0 : 1;

  return [
    `M ${externoInicio.x} ${externoInicio.y}`,
    `A ${raioExterno} ${raioExterno} 0 ${arcoGrande} 0 ${externoFim.x} ${externoFim.y}`,
    `L ${internoInicio.x} ${internoInicio.y}`,
    `A ${raioInterno} ${raioInterno} 0 ${arcoGrande} 1 ${internoFim.x} ${internoFim.y}`,
    "Z",
  ].join(" ");
}

/* Elementos compartilhados pelos dois pequenos cenários. */
function BaseCenarioTrilha() {
  return (
    <>
      <span className="trilha-cenario-chao" />

      <span className="trilha-cenario-arbusto trilha-cenario-arbusto--esquerda">
        <i />
        <i />
        <i />
      </span>

      <span className="trilha-cenario-arbusto trilha-cenario-arbusto--direita">
        <i />
        <i />
        <i />
      </span>

      <span className="trilha-cenario-grama trilha-cenario-grama--esquerda">
        <i />
        <i />
        <i />
      </span>

      <span className="trilha-cenario-grama trilha-cenario-grama--direita">
        <i />
        <i />
        <i />
      </span>

      <span className="trilha-cenario-pedra trilha-cenario-pedra--grande" />
      <span className="trilha-cenario-pedra trilha-cenario-pedra--pequena" />

      <span className="trilha-cenario-folha trilha-cenario-folha--primeira" />
      <span className="trilha-cenario-folha trilha-cenario-folha--segunda" />

      <span className="trilha-cenario-caminho">
        <i />
        <i />
        <i />
      </span>
    </>
  );
}

function LivroCenario({ aberto = false, letras = false }) {
  return (
    <span
      className={`trilha-objeto-livro ${
        aberto ? "trilha-objeto-livro--aberto" : ""
      }`}
    >
      <span className="trilha-livro-pagina trilha-livro-pagina--esquerda">
        {letras ? "A" : <i />}
      </span>

      <span className="trilha-livro-pagina trilha-livro-pagina--direita">
        {letras ? "B" : <i />}
      </span>
    </span>
  );
}

/* Os objetos mudam junto com o representante da matéria. */
function ObjetosMateriaTrilha({ materia }) {
  switch (materia.cenario) {
    case "matematica":
      return (
        <div className="trilha-cenario-objetos trilha-cenario-objetos--matematica">
          <LivroCenario aberto />

          <span className="trilha-objeto-cubo">
            <i className="trilha-cubo-frente" />
            <i className="trilha-cubo-topo" />
            <i className="trilha-cubo-lado" />
          </span>

          <span className="trilha-objeto-piramide" />
          <span className="trilha-objeto-regua">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      );

    case "portugues":
      return (
        <div className="trilha-cenario-objetos trilha-cenario-objetos--portugues">
          <span className="trilha-objeto-pilha-livros">
            <i />
            <i />
            <i />
          </span>

          <LivroCenario aberto letras />
          <span className="trilha-objeto-lapis" />
        </div>
      );

    case "historia":
      return (
        <div className="trilha-cenario-objetos trilha-cenario-objetos--historia">
          <span className="trilha-objeto-pergaminho">
            <i />
            <i />
            <i />
          </span>

          <span className="trilha-objeto-vaso">
            <i />
          </span>

          <span className="trilha-objeto-coluna">
            <i />
            <i />
            <i />
          </span>
        </div>
      );

    case "ciencias":
      return (
        <div className="trilha-cenario-objetos trilha-cenario-objetos--ciencias">
          <span className="trilha-objeto-frasco">
            <i className="trilha-frasco-liquido" />
            <i className="trilha-frasco-brilho" />
          </span>

          <span className="trilha-objeto-muda">
            <i className="trilha-muda-caule" />
            <i className="trilha-muda-folha trilha-muda-folha--esquerda" />
            <i className="trilha-muda-folha trilha-muda-folha--direita" />
            <i className="trilha-muda-vaso" />
          </span>

          <LivroCenario />
        </div>
      );

    case "geografia":
      return (
        <div className="trilha-cenario-objetos trilha-cenario-objetos--geografia">
          <span className="trilha-objeto-globo">
            <i className="trilha-globo-esfera">
              <i />
            </i>
            <i className="trilha-globo-suporte" />
            <i className="trilha-globo-base" />
          </span>

          <span className="trilha-objeto-mapa">
            <i />
            <i />
            <i />
          </span>
        </div>
      );

    case "ingles":
      return (
        <div className="trilha-cenario-objetos trilha-cenario-objetos--ingles">
          <LivroCenario aberto letras />

          <span className="trilha-objeto-bloco trilha-objeto-bloco--a">
            A
          </span>

          <span className="trilha-objeto-bloco trilha-objeto-bloco--b">
            B
          </span>

          <span className="trilha-objeto-lapis" />
        </div>
      );

    default:
      return null;
  }
}

function CenarioMascoteTrilha({ moki = false, materia }) {
  return (
    <div
      className={
        moki
          ? "trilha-mascote trilha-mascote--moki trilha-cenario"
          : `trilha-mascote trilha-mascote--materia trilha-cenario trilha-cenario--${materia.cenario}`
      }
      aria-hidden="true"
    >
      <BaseCenarioTrilha />

      {moki ? (
        <span className="trilha-cenario-placa">
          <span className="trilha-placa-poste" />
          <span className="trilha-placa-madeira">
            <span className="trilha-placa-seta">→</span>
          </span>
        </span>
      ) : (
        <ObjetosMateriaTrilha materia={materia} />
      )}

      {/* A sombra sob os pés continua no ::before do mascote. */}
      <img
        className="trilha-cenario-personagem"
        src={moki ? spriteTrilhaMoki : materia.mascote}
        alt=""
        draggable={false}
      />
    </div>
  );
}

function Materias({
  draft,
  refAtividade,
  atividadeAtual,
  setAtividadeAtual,
  atvLiberada,
  setMateriaAtual,
  onChange,
}) {
  const [aberto, setAberto] = useState(false);
  const [materiaAtiva, setMateriaAtiva] = useState(materias[0]);
  const [materiaHover, setMateriaHover] = useState(null);

  const [trilha, setTrilha] = useState({
    materiaId: materias[0].id,
    total: 0,
    concluidas: 0,
    carregando: true,
  });

  const refTrilha = useRef(null);

  // Permite reabrir a mesma lição depois de sair.
  useEffect(() => {
    function aoFechar() {
      setAtividadeAtual(null);

      if (refTrilha.current) {
        refTrilha.current.style.opacity = "1";
      }
    }

    window.addEventListener("simio:atividade-fechada", aoFechar);

    return () => {
      window.removeEventListener("simio:atividade-fechada", aoFechar);
    };
  }, [setAtividadeAtual]);

  const materiaExibida = materiaHover || materiaAtiva;

  const materiasRenderizadas = materias
    .map((materia, index) => ({ materia, index }))
    .sort((a, b) => {
      const prioridade = (item) => {
        if (item.materia.id === materiaHover?.id) return 2;
        if (item.materia.id === materiaAtiva.id) return 1;
        return 0;
      };

      return prioridade(a) - prioridade(b);
    });

  // Mantém a matéria do componente pai sincronizada.
  useEffect(() => {
    setMateriaAtual(materiaAtiva.id);
  }, [materiaAtiva.id, setMateriaAtual]);

  // Busca o progresso persistido.
  useEffect(() => {
    const idMateria = materiaAtiva.id;
    const idUser = draft?.id;

    if (!idUser) return;

    const controller = new AbortController();

    async function carregarTrilha() {
      try {
        const resposta = await fetch("http://localhost:3000/criarTrilha", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: idMateria,
            idUser,
          }),
          cache: "no-store",
          signal: controller.signal,
        });

        if (!resposta.ok) {
          throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();
        const perguntas = Array.isArray(dados.nome) ? dados.nome : [];
        const total = Math.ceil(perguntas.length / 3);

        const valorBanco = Number(
          perguntas[0]?.atividades_concluidas ?? 0
        );

        const concluidasBanco = Number.isFinite(valorBanco)
          ? Math.max(0, Math.trunc(valorBanco))
          : 0;

        setTrilha({
          materiaId: idMateria,
          total,
          concluidas: Math.min(total, concluidasBanco),
          carregando: false,
        });
      } catch (erro) {
        if (erro.name !== "AbortError") {
          console.error("Erro ao carregar trilha:", erro);

          setTrilha((anterior) => ({
            ...anterior,
            carregando: false,
          }));
        }
      }
    }

    carregarTrilha();

    return () => {
      controller.abort();
    };
  }, [draft?.id, materiaAtiva.id, atvLiberada]);

  function selecionarMateria(materia) {
    setMateriaAtiva(materia);
    setMateriaHover(null);
    setMateriaAtual(materia.id);
    setAtividadeAtual(null);

    if (materia.id !== materiaAtiva.id) {
      setTrilha({
        materiaId: materia.id,
        total: 0,
        concluidas: 0,
        carregando: true,
      });
    }

    if (onChange) {
      onChange(materia);
    }

    setTimeout(() => setAberto(false), 220);
  }

  function entrarAtividade(id) {
    if (trilha.materiaId !== materiaAtiva.id || trilha.carregando) {
      return;
    }

    const proximaAtividade = trilha.concluidas + 1;

    if (id === proximaAtividade) {
      if (draft.energia <= 0) {
        alert("Energia insuficiente");
        return;
      }

      setAtividadeAtual(id);

      if (refTrilha.current) {
        refTrilha.current.style.opacity = "0";
      }

      if (refAtividade.current) {
        refAtividade.current.style.transform = "translateX(0)";
      }
    } else if (id < proximaAtividade) {
      alert("Atividade já concluída");
    } else {
      alert("Atividade bloqueada");
    }
  }

  return (
    <>
      <div className="materias-container">
        {aberto && (
          <div
            className="materias-overlay"
            onClick={() => setAberto(false)}
          />
        )}

        <button
          type="button"
          className={`materias-botao ${aberto ? "aberto" : ""}`}
          onClick={() => setAberto(!aberto)}
        >
          <div className="materias-botao-icone">
            <img
              src={materiaAtiva.icon}
              alt={materiaAtiva.nome}
              className="materias-botao-img"
            />
          </div>

          <span className="materias-botao-nome">
            {materiaAtiva.nome}
          </span>

          <span className="materias-seta">▼</span>
        </button>

        <div
          className={`materias-roda-container ${
            aberto ? "visivel" : ""
          }`}
        >
          <div className="materias-roda">
            <svg viewBox="0 0 360 360" className="materias-svg">
              {materiasRenderizadas.map(({ materia, index }) => {
                const tamanho = 360 / materias.length;
                const inicio = index * tamanho + 2;
                const fim = (index + 1) * tamanho - 2;

                const caminho = criarFatia(
                  180,
                  180,
                  165,
                  91,
                  inicio,
                  fim
                );

                const meio = index * tamanho + tamanho / 2;
                const posicaoTexto = pontoPolar(180, 180, 128, meio);
                const ativa = materia.id === materiaAtiva.id;

                return (
                  <g
                    key={materia.id}
                    className={`materia-fatia ${ativa ? "ativa" : ""}`}
                    onClick={() => selecionarMateria(materia)}
                    onMouseEnter={() => setMateriaHover(materia)}
                    onMouseLeave={() => setMateriaHover(null)}
                  >
                    <path d={caminho} fill={materia.cor} />

                    <image
                      href={materia.icon}
                      x={posicaoTexto.x - 19}
                      y={posicaoTexto.y - 32}
                      width="38"
                      height="38"
                      className="materia-icone-img-svg"
                    />

                    <text
                      x={posicaoTexto.x}
                      y={posicaoTexto.y + 17}
                      className="materia-nome-svg"
                    >
                      {materia.nome}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="materias-centro">
              <div
                className="materias-centro-icone"
                key={materiaExibida.id}
              >
                <img
                  src={materiaExibida.icon}
                  alt={materiaExibida.nome}
                  className="materias-centro-img"
                />
              </div>

              <strong>{materiaExibida.nome}</strong>
              <span>{materiaExibida.descricao}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="trilha ativo" id="trilha" ref={refTrilha}>
        {trilha.materiaId === materiaAtiva.id && trilha.total > 0 && (
          <>
            <CenarioMascoteTrilha moki />
            <CenarioMascoteTrilha materia={materiaAtiva} />
          </>
        )}

        {trilha.materiaId === materiaAtiva.id &&
          Array.from({ length: trilha.total }, (_, i) => {
            const id = i + 1;
            const concluida = i < trilha.concluidas;
            const atual = i === trilha.concluidas;

            return (
              <button
                type="button"
                key={`${materiaAtiva.id}-${id}`}
                id={String(id)}
                className={`botaoAtividade ${
                  i % 2 === 0 ? "impar" : "par"
                } ${
                  concluida ? "concluida" : atual ? "atual" : ""
                }`}
                style={
                  !concluida && !atual
                    ? { filter: "grayscale(100%)" }
                    : undefined
                }
                aria-label={
                  atual
                    ? "Começar atividade " + id
                    : "Atividade " + id
                }
                onClick={() => entrarAtividade(id)}
              >
                {atual && (
                  <span className="trilha-comecar" aria-hidden="true">
                    Começar
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </>
  );
}

export default Materias;