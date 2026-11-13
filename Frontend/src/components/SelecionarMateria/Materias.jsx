
import { useState, useEffect, useRef } from "react";
import "./Materias.css";

import { apiFetch } from "../utils/api";
import brIcon from "../../assets/materias/brasil.svg";
import enIcon from "../../assets/materias/ingles.svg";
import cienciaIcon from "../../assets/materias/ciencia.svg";
import geoIcon from "../../assets/materias/geografia.svg";
import histIcon from "../../assets/materias/historia.svg";
import matIcon from "../../assets/materias/matematica.svg";

const materias = [
    { id: 2, nome: "Português", descricao: "Língua Portuguesa", cor: "#ff8214", icon: brIcon },
    { id: 1, nome: "Matemática", descricao: "Números e lógica", cor: "#75543c", icon: matIcon },
    { id: 3, nome: "História", descricao: "História e sociedade", cor: "#684936", icon: histIcon },
    { id: 5, nome: "Ciências", descricao: "Natureza e ciência", cor: "#52663c", icon: cienciaIcon },
    { id: 4, nome: "Geografia", descricao: "Espaço e território", cor: "#64724a", icon: geoIcon },
    { id: 6, nome: "Inglês", descricao: "Língua Inglesa", cor: "#465936", icon: enIcon }
];

function pontoPolar(cx, cy, raio, angulo) {
    const radianos = ((angulo - 90) * Math.PI) / 180;

    return {
        x: cx + raio * Math.cos(radianos),
        y: cy + raio * Math.sin(radianos)
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
        "Z"
    ].join(" ");
}

function Materias({
    draft,
    refAtividade,
    atividadeAtual,
    setAtividadeAtual,
    atvLiberada,
    setMateriaAtual,
    onChange
}) {
    const [aberto, setAberto] = useState(false);
    const [materiaAtiva, setMateriaAtiva] = useState(materias[0]);
    const [materiaHover, setMateriaHover] = useState(null);

    const [trilha, setTrilha] = useState({
        materiaId: materias[0].id,
        total: 0,
        concluidas: 0,
        carregando: true
    });

    const refTrilha = useRef(null);

    // Identifica requisições antigas e impede atualizações fora de ordem.
    const requisicaoAtual = useRef(0);

    // Fecha a atividade.
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

    // Sincroniza a matéria com o componente pai.
    useEffect(() => {
        setMateriaAtual(materiaAtiva.id);
    }, [materiaAtiva.id, setMateriaAtual]);

    // Busca o progresso salvo no banco.
    useEffect(() => {
        const idMateria = materiaAtiva.id;
        const idUser = draft?.id;

        const numeroRequisicao = ++requisicaoAtual.current;

        if (!idUser) {
            setTrilha({
                materiaId: idMateria,
                total: 0,
                concluidas: 0,
                carregando: false
            });
            return;
        }

        const controller = new AbortController();

        setTrilha(anterior => ({
            ...anterior,
            materiaId: idMateria,
            carregando: true
        }));

        async function carregarTrilha() {
            try {
                const resposta = await apiFetch(
                    "/criarTrilha",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id: idMateria,
                            idUser
                        }),
                        cache: "no-store",
                        signal: controller.signal
                    }
                );

                if (!resposta.ok) {
                    throw new Error(`Erro HTTP ${resposta.status}`);
                }

                const dados = await resposta.json();

                // Ignora respostas de requisições anteriores.
                if (
                    controller.signal.aborted ||
                    numeroRequisicao !== requisicaoAtual.current
                ) {
                    return;
                }

                const perguntas = Array.isArray(dados.nome)
                    ? dados.nome
                    : [];

                const total = Math.ceil(perguntas.length / 3);

                const valorBanco = Number(
                    perguntas[0]?.atividades_concluidas ?? 0
                );

                const concluidasBanco = Number.isFinite(valorBanco)
                    ? Math.max(0, Math.trunc(valorBanco))
                    : 0;

                console.log("PROGRESSO DA TRILHA:", {
                    materia: idMateria,
                    usuario: idUser,
                    total,
                    concluidas: concluidasBanco
                });

                setTrilha({
                    materiaId: idMateria,
                    total,
                    concluidas: Math.min(total, concluidasBanco),
                    carregando: false
                });

            } catch (erro) {
                if (
                    erro.name !== "AbortError" &&
                    numeroRequisicao === requisicaoAtual.current
                ) {
                    console.error("Erro ao carregar trilha:", erro);

                    setTrilha(anterior => ({
                        ...anterior,
                        carregando: false
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
                carregando: true
            });
        }

        if (onChange) {
            onChange(materia);
        }

        setTimeout(() => setAberto(false), 220);
    }

    function entrarAtividade(id) {
        if (
            trilha.materiaId !== materiaAtiva.id ||
            trilha.carregando
        ) {
            return;
        }

        const proximaAtividade = trilha.concluidas + 1;

        console.log("ABRINDO ATIVIDADE:", {
            clicada: id,
            concluidas: trilha.concluidas,
            proxima: proximaAtividade
        });

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

                <div className={`materias-roda-container ${aberto ? "visivel" : ""}`}>
                    <div className="materias-roda">

                        <svg viewBox="0 0 360 360" className="materias-svg">

                            {materiasRenderizadas.map(({ materia, index }) => {
                                const tamanho = 360 / materias.length;
                                const inicio = index * tamanho + 2;
                                const fim = (index + 1) * tamanho - 2;

                                const caminho = criarFatia(
                                    180, 180, 165, 91, inicio, fim
                                );

                                const meio = index * tamanho + tamanho / 2;

                                const posicaoTexto = pontoPolar(
                                    180, 180, 128, meio
                                );

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

            <div
                className="trilha ativo"
                id="trilha"
                ref={refTrilha}
            >
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
                                    concluida
                                        ? "concluida"
                                        : atual
                                            ? "atual"
                                            : ""
                                }`}
                                style={
                                    !concluida && !atual
                                        ? { filter: "grayscale(100%)" }
                                        : undefined
                                }
                                onClick={() => entrarAtividade(id)}
                            />
                        );
                    })}
            </div>
        </>
    );
}

export default Materias;
