import { useState } from "react";
import "./Materias.css";
import brIcon from "../../assets/materias/brasil.svg";
import enIcon from "../../assets/materias/ingles.svg";
import cienciaIcon from "../../assets/materias/ciencia.svg";
import geoIcon from "../../assets/materias/geografia.svg";
import histIcon from "../../assets/materias/historia.svg";
import matIcon from "../../assets/materias/matematica.svg";

const materias = [
  {
    id: "portugues",
    nome: "Português",
    descricao: "Língua Portuguesa",
    cor: "#ff8214",
    icon: brIcon,
  },
  {
    id: "matematica",
    nome: "Matemática",
    descricao: "Números e lógica",
    cor: "#75543c",
    icon: matIcon,
  },
  {
    id: "historia",
    nome: "História",
    descricao: "História e sociedade",
    cor: "#684936",
    icon: histIcon,
  },
  {
    id: "ciencias",
    nome: "Ciências",
    descricao: "Natureza e ciência",
    cor: "#52663c",
    icon: cienciaIcon,
  },
  {
    id: "geografia",
    nome: "Geografia",
    descricao: "Espaço e território",
    cor: "#64724a",
    icon: geoIcon,
  },
  {
    id: "ingles",
    nome: "Inglês",
    descricao: "Língua Inglesa",
    cor: "#465936",
    icon: enIcon,
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
         <img
           src={materiaAtiva.icon}
           alt={materiaAtiva.nome}
           className="materias-botao-img"
         />
      </div>

        <span className="materias-botao-nome">
            {materiaAtiva.nome}
        </span>

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
            <div className="materias-centro-icone" key={materiaExibida.id}>
             <img
               src={materiaExibida.icon}
               alt={materiaExibida.nome}
              className="materias-centro-img"
           />
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