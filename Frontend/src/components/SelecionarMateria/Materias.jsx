import { useState } from "react";
import "./Materias.css";

const materias = [
  {
    id: "portugues",
    nome: "Português",
    icone: "Aa",
    descricao: "Língua Portuguesa",
    cor: "#ff7a0b",
  },
  {
    id: "matematica",
    nome: "Matemática",
    icone: "÷",
    descricao: "Números e lógica",
    cor: "#9b724d",
  },
  {
    id: "historia",
    nome: "História",
    icone: "H",
    descricao: "História e sociedade",
    cor: "#a85f43",
  },
  {
    id: "ciencias",
    nome: "Ciências",
    icone: "⚗",
    descricao: "Natureza e ciência",
    cor: "#66784d",
  },
  {
    id: "geografia",
    nome: "Geografia",
    icone: "◎",
    descricao: "Espaço e território",
    cor: "#868252",
  },
  {
    id: "ingles",
    nome: "Inglês",
    icone: "EN",
    descricao: "Língua Inglesa",
    cor: "#607250",
  },
];

function pontoPolar(cx, cy, raio, angulo) {
  const radianos = ((angulo - 90) * Math.PI) / 180;

  return {
    x: cx + raio * Math.cos(radianos),
    y: cy + raio * Math.sin(radianos),
  };
}

function criarFatia(
  cx,
  cy,
  raioExterno,
  raioInterno,
  inicio,
  fim
) {
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

function Materias({ onChange }) {
  const [aberto, setAberto] = useState(false);
  const [materiaAtiva, setMateriaAtiva] = useState(materias[0]);
  const [materiaHover, setMateriaHover] = useState(null);

  const materiaExibida = materiaHover || materiaAtiva;

  function selecionarMateria(materia) {
    setMateriaAtiva(materia);
    setMateriaHover(null);

    if (onChange) {
      onChange(materia);
    }

    setTimeout(() => {
      setAberto(false);
    }, 220);
  }

  const materiasRenderizadas = materias
  .map((materia, index) => ({
    materia,
    index,
  }))
  .sort((a, b) => {
    const prioridade = (item) => {
      // HOVER SEMPRE POR CIMA
      if (item.materia.id === materiaHover?.id) {
        return 2;
      }

      // MATÉRIA ATIVA FICA ACIMA DAS NORMAIS
      if (item.materia.id === materiaAtiva.id) {
        return 1;
      }

      return 0;
    };

    return prioridade(a) - prioridade(b);
  });

  return (
    <div className="materias-container">

        {aberto && (
  <div
    className="materias-overlay"
    onClick={() => setAberto(false)}
  />
)}

      {/* BOTÃO PRINCIPAL */}
      <button
        className={`materias-botao ${aberto ? "aberto" : ""}`}
        onClick={() => setAberto(!aberto)}
      >
        <div className="materias-botao-icone">
          {materiaAtiva.icone}
        </div>

        <span>{materiaAtiva.nome}</span>

        <span className="materias-seta">
          ▼     
        </span>
      </button>

      {/* RODA */}
      <div
        className={`materias-roda-container ${
          aberto ? "visivel" : ""
        }`}
      >
        <div className="materias-roda">

          <svg
            viewBox="0 0 360 360"
            className="materias-svg"
          >
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

              const posicaoTexto = pontoPolar(
                180,
                180,
                128,
                meio
              );

              const ativa =
                materia.id === materiaAtiva.id;

              return (
                <g
                  key={materia.id}
                  className={`materia-fatia ${
                    ativa ? "ativa" : ""
                  }`}
                  onClick={() =>
                    selecionarMateria(materia)
                  }
                  onMouseEnter={() =>
                    setMateriaHover(materia)
                  }
                  onMouseLeave={() =>
                    setMateriaHover(null)
                  }
                >
                  <path
                    d={caminho}
                    fill={materia.cor}
                  />

                  <text
                    x={posicaoTexto.x}
                    y={posicaoTexto.y - 8}
                    className="materia-icone-svg"
                  >
                    {materia.icone}
                  </text>

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

          {/* CENTRO DA RODA */}
          <div className="materias-centro">
            <div
              className="materias-centro-icone"
              key={materiaExibida.id}
            >
              {materiaExibida.icone}
            </div>

            <strong>
              {materiaExibida.nome}
            </strong>

            <span>
              {materiaExibida.descricao}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Materias;