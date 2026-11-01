import { useState, useEffect, useRef } from "react";
import "./Materias.css";

import brIcon from "../../assets/materias/brasil.svg";
import enIcon from "../../assets/materias/ingles.svg";
import cienciaIcon from "../../assets/materias/ciencia.svg";
import geoIcon from "../../assets/materias/geografia.svg";
import histIcon from "../../assets/materias/historia.svg";
import matIcon from "../../assets/materias/matematica.svg";

import { criarAtividade } from "../atividades/atividades";

const materias = [
  { id: 2, nome: "Português", descricao: "Língua Portuguesa", cor: "#ff8214", icon: brIcon },
  { id: 1, nome: "Matemática", descricao: "Números e lógica", cor: "#75543c", icon: matIcon },
  { id: 3, nome: "História", descricao: "História e sociedade", cor: "#684936", icon: histIcon },
  { id: 5, nome: "Ciências", descricao: "Natureza e ciência", cor: "#52663c", icon: cienciaIcon },
  { id: 4, nome: "Geografia", descricao: "Espaço e território", cor: "#64724a", icon: geoIcon },
  { id: 6, nome: "Inglês", descricao: "Língua Inglesa", cor: "#465936", icon: enIcon },
];

function pontoPolar(cx, cy, raio, angulo) {
  const radianos = ((angulo - 90) * Math.PI) / 180;
  return { x: cx + raio * Math.cos(radianos), y: cy + raio * Math.sin(radianos) };
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

function Materias({
  draft,
  refAtividade,
  atividadeAtual,
  setAtividadeAtual,
  atvLiberada,
  setMateriaAtual,
  materiaAtual,
  onChange,
  refEnunciado,
  refAlternativa1,
  refAlternativa2,
  refAlternativa3,
  refAlternativa4,
}) {
  const [aberto, setAberto] = useState(false);
  const [materiaAtiva, setMateriaAtiva] = useState(materias[0]);
  const [materiaHover, setMateriaHover] = useState(null);
  const [trilha, setTrilha] = useState({ materiaId: 2, total: 0, concluidas: 0 });

  const refTrilha = useRef(null);
  const sinalAnteriorRef = useRef({ materiaId: null, liberada: null });
  const progressoPendenteRef = useRef({ materiaId: null, concluidas: 0 });
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

  useEffect(() => {
    const idMateria = materiaAtiva.id;
    const idUser = draft?.id;
    if (!idUser) return;

    // Mesma lógica do código antigo: ao mudar atvLiberada, atualizamos a trilha.
    // atvLiberada é o número (base 1) da próxima atividade permitida.
    const novaLiberada = Number(atvLiberada);
    const sinalAnterior = sinalAnteriorRef.current;
    const avancouNestaMateria =
      sinalAnterior.materiaId === idMateria &&
      sinalAnterior.liberada !== null &&
      Number.isFinite(novaLiberada) &&
      novaLiberada > sinalAnterior.liberada;

    sinalAnteriorRef.current = {
      materiaId: idMateria,
      liberada: Number.isFinite(novaLiberada) ? novaLiberada : null,
    };

    if (avancouNestaMateria) {
      const concluidasLocal = Math.max(0, novaLiberada - 1);
      progressoPendenteRef.current = { materiaId: idMateria, concluidas: concluidasLocal };
      // Atualização visual imediata (mesmo se a consulta acontecer antes do UPDATE).
      setTrilha((anterior) =>
        anterior.materiaId === idMateria
          ? { ...anterior, concluidas: Math.min(anterior.total, Math.max(anterior.concluidas, concluidasLocal)) }
          : anterior
      );
    }

    const controller = new AbortController();
    let ativo = true;

    async function carregarTrilha() {
      try {
        const resposta = await fetch("http://localhost:3000/criarTrilha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: idMateria, idUser }),
          cache: "no-store",
          signal: controller.signal,
        });
        if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

        const dados = await resposta.json();
        const perguntas = Array.isArray(dados.nome) ? dados.nome : [];
        const total = Math.ceil(perguntas.length / 3);
        // O banco já conta ATIVIDADES concluídas; não dividir este valor por três.
        const progressoBanco = Number(perguntas[0]?.atividades_concluidas ?? 0);
        const concluidasBanco = Number.isFinite(progressoBanco)
          ? Math.max(0, Math.trunc(progressoBanco))
          : 0;
        const progressoLocal = progressoPendenteRef.current.materiaId === idMateria
          ? progressoPendenteRef.current.concluidas
          : 0;

        // Quando o banco alcançar o progresso local, ele volta a ser a única fonte.
        if (concluidasBanco >= progressoLocal) {
          progressoPendenteRef.current = { materiaId: idMateria, concluidas: 0 };
        }

        if (!ativo) return;
        setTrilha({
          materiaId: idMateria,
          total,
          concluidas: Math.min(total, Math.max(concluidasBanco, progressoLocal)),
        });
      } catch (erro) {
        if (erro.name !== "AbortError") console.error("Erro ao criar trilha:", erro);
      }
    }

    carregarTrilha();
    return () => {
      ativo = false;
      controller.abort();
    };
  }, [draft?.id, materiaAtiva.id, atvLiberada]);

  function selecionarMateria(materia) {
    setMateriaAtiva(materia);
    setMateriaHover(null);
    setMateriaAtual(materia.id);
    setAtividadeAtual(0);

    // Nunca usar o avanço de uma matéria para liberar outra.
    // Só limpa a trilha quando a matéria realmente mudar.
    if (materia.id !== materiaAtiva.id) {
      progressoPendenteRef.current = { materiaId: null, concluidas: 0 };
      setTrilha({ materiaId: materia.id, total: 0, concluidas: 0 });
    }

    if (onChange) onChange(materia);

    criarAtividade(
      refAtividade,
      refEnunciado,
      0,
      materia.id,
      refAlternativa1,
      refAlternativa2,
      refAlternativa3,
      refAlternativa4
    );

    setTimeout(() => setAberto(false), 220);
  }

  function entrarAtividade(id) {
    if (trilha.materiaId !== materiaAtiva.id) return;
    const proximaAtividade = trilha.concluidas + 1;

    if (id === proximaAtividade) {
      setAtividadeAtual(id);
      if (refTrilha.current) refTrilha.current.style.opacity = "0";
      if (refAtividade.current) refAtividade.current.style.transform = "translateX(0)";
    } else if (id < proximaAtividade) {
      alert("Atividade já concluída");
    } else {
      alert("Atividade bloqueada");
    }
  }

  return (
    <>
      <div className="materias-container">
        {aberto && <div className="materias-overlay" onClick={() => setAberto(false)} />}

        <button type="button" className={`materias-botao ${aberto ? "aberto" : ""}`} onClick={() => setAberto(!aberto)}>
          <div className="materias-botao-icone">
            <img src={materiaAtiva.icon} alt={materiaAtiva.nome} className="materias-botao-img" />
          </div>
          <span className="materias-botao-nome">{materiaAtiva.nome}</span>
          <span className="materias-seta">▼</span>
        </button>

        <div className={`materias-roda-container ${aberto ? "visivel" : ""}`}>
          <div className="materias-roda">
            <svg viewBox="0 0 360 360" className="materias-svg">
              {materiasRenderizadas.map(({ materia, index }) => {
                const tamanho = 360 / materias.length;
                const inicio = index * tamanho + 2;
                const fim = (index + 1) * tamanho - 2;
                const caminho = criarFatia(180, 180, 165, 91, inicio, fim);
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
                    <text x={posicaoTexto.x} y={posicaoTexto.y + 17} className="materia-nome-svg">
                      {materia.nome}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="materias-centro">
              <div className="materias-centro-icone" key={materiaExibida.id}>
                <img src={materiaExibida.icon} alt={materiaExibida.nome} className="materias-centro-img" />
              </div>
              <strong>{materiaExibida.nome}</strong>
              <span>{materiaExibida.descricao}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="trilha ativo" id="trilha" ref={refTrilha}>
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
                className={`botaoAtividade ${i % 2 === 0 ? "impar" : "par"} ${concluida ? "concluida" : atual ? "atual" : ""}`}
                style={!concluida && !atual ? { filter: "grayscale(100%)" } : undefined}
                onClick={() => entrarAtividade(id)}
              />
            );
          })}
      </div>
    </>
  );
}

export default Materias;
