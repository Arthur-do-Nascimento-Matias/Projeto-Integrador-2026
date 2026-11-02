import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./Atividades.css";

// Busca uma pergunta no backend e preenche os elementos da atividade.
// indiceQuestao é a ordem da pergunta dentro da matéria (começa em 1).
export async function criarAtividade(
    refAtividade,
    refEnunciado,
    indiceQuestao,
    materiaAtual,
    refAlternativa1,
    refAlternativa2,
    refAlternativa3,
    refAlternativa4
) {
    const parametros = new URLSearchParams({
        materia: String(materiaAtual),
        atividadeAtual: String(indiceQuestao)
    });

    const resposta = await fetch(`http://localhost:3000/atividades?${parametros}`, {
        cache: "no-store"
    });

    if (!resposta.ok) {
        throw new Error(`Erro ao carregar pergunta: HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();

    if (dados.concluido || !dados.pergunta) {
        throw new Error("O backend não retornou uma pergunta para esta atividade.");
    }

    const alternativas = [
        dados.alternativa1,
        dados.alternativa2,
        dados.alternativa3,
        dados.alternativa4
    ];

    if (alternativas.some(alternativa => !alternativa)) {
        throw new Error("O backend retornou alternativas incompletas.");
    }

    for (let i = alternativas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [alternativas[i], alternativas[j]] = [alternativas[j], alternativas[i]];
    }

    refEnunciado.current.innerHTML = dados.pergunta;

    const refs = [
        refAlternativa1,
        refAlternativa2,
        refAlternativa3,
        refAlternativa4
    ];

    refs.forEach((ref, indice) => {
        ref.current.innerHTML = alternativas[indice].texto;
    });

    return alternativas;
}

function sairAtividade(refAtividade) {
    if (refAtividade.current) {
        refAtividade.current.style.transform = "translateX(100%)";
    }

    const trilha = document.getElementById("trilha");
    if (trilha) trilha.style.opacity = "1";

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
}

function Atividades({
    draft,
    refAtividade,
    atividadeAtual,
    setAtvLiberada,
    materiaAtual,
    refEnunciado,
    refAlternativa1,
    refAlternativa2,
    refAlternativa3,
    refAlternativa4
}) {
    const refParabens = useRef(null);
    const indiceAtv = useRef(1);
    const cliques = useRef(0);
    const alternativas = useRef([]);
    const respostaBloqueada = useRef(true);
    const finalizando = useRef(false);
    const atividadeSalva = useRef(false);

    const refsAlternativas = [
        refAlternativa1,
        refAlternativa2,
        refAlternativa3,
        refAlternativa4
    ];

    async function carregarPergunta(indice) {
        respostaBloqueada.current = true;
        if (refEnunciado.current) {
            refEnunciado.current.textContent = "Carregando pergunta...";
        }

        try {
            const resposta = await criarAtividade(
                refAtividade,
                refEnunciado,
                indice,
                materiaAtual,
                ...refsAlternativas
            );

            alternativas.current = resposta;
            respostaBloqueada.current = false;
        } catch (erro) {
            console.error("Erro ao carregar atividade:", erro);
            if (refEnunciado.current) {
                refEnunciado.current.textContent =
                    "Não foi possível carregar a pergunta. Saia e tente novamente.";
            }
        }
    }

    // O número da atividade vem da trilha, que lê o progresso no banco.
    useEffect(() => {
        const numeroAtividade = Number(atividadeAtual);

        if (!Number.isInteger(numeroAtividade) || numeroAtividade < 1 || !materiaAtual) {
            return;
        }

        cliques.current = 0;
        indiceAtv.current = (numeroAtividade - 1) * 3 + 1;
        alternativas.current = [];
        atividadeSalva.current = false;
        finalizando.current = false;

        if (refParabens.current) {
            refParabens.current.style.display = "none";
        }

        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        carregarPergunta(indiceAtv.current);
    }, [atividadeAtual, materiaAtual]);

    async function verificar(id, botao) {
        if (respostaBloqueada.current) return;

        const alternativa = alternativas.current[id];
        if (!alternativa) return;

        if (Number(alternativa.verdadeira) !== 1) {
            botao.style.animation = "chacualhar 200ms ease-in-out alternate";
            setTimeout(() => {
                botao.style.animation = "";
            }, 200);
            return;
        }

        respostaBloqueada.current = true;

        if (cliques.current < 2) {
            cliques.current += 1;
            indiceAtv.current += 1;
            await carregarPergunta(indiceAtv.current);
        } else {
            sairAtividade(refAtividade);
            if (refParabens.current) {
                refParabens.current.style.display = "flex";
            }
        }
    }

    async function fecharParabens() {
        if (finalizando.current || atividadeSalva.current) return;
        finalizando.current = true;

        const token = localStorage.getItem("token");

        try {
            const resposta = await fetch("http://localhost:3000/concluirAtividade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    materia: materiaAtual,
                    id: draft.id,
                    atividadesConcluidas: draft.atividadesConcluidas,
                    xp: 50
                })
            });

            if (!resposta.ok) {
                throw new Error(`Erro ao salvar atividade: HTTP ${resposta.status}`);
            }

            atividadeSalva.current = true;
            if (refParabens.current) refParabens.current.style.display = "none";
            sairAtividade(refAtividade);

            // Sinaliza a Materias.jsx para buscar novamente o progresso no banco.
            setAtvLiberada(anterior => anterior + 1);

            // Sequência não impede o fechamento da atividade se falhar.
            fetch("http://localhost:3000/sequencia", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ idUser: draft.id })
            })
                .then(res => {
                    if (!res.ok) {
                        console.error("Erro ao atualizar sequência: HTTP", res.status);
                    }
                })
                .catch(erro => console.error("Erro na sequência:", erro));

        } catch (erro) {
            console.error("Erro ao concluir atividade:", erro);
            alert("Não foi possível salvar a atividade. Tente novamente.");
        } finally {
            finalizando.current = false;
        }
    }

    return createPortal(
        <>
            <div className="atividade" id="atividade" ref={refAtividade}>
                <button onClick={() => sairAtividade(refAtividade)}>
                    Sair
                </button>

                <h1 className="enunciado" id="enunciado" ref={refEnunciado} />

                <button
                    className="alternativa1"
                    id="alternativa1"
                    onClick={e => verificar(0, e.currentTarget)}
                    ref={refAlternativa1}
                />
                <button
                    className="alternativa2"
                    id="alternativa2"
                    onClick={e => verificar(1, e.currentTarget)}
                    ref={refAlternativa2}
                />
                <button
                    className="alternativa3"
                    id="alternativa3"
                    onClick={e => verificar(2, e.currentTarget)}
                    ref={refAlternativa3}
                />
                <button
                    className="alternativa4"
                    id="alternativa4"
                    onClick={e => verificar(3, e.currentTarget)}
                    ref={refAlternativa4}
                />
            </div>

            <div className="parabens" id="parabens" ref={refParabens}>
                <h1>🎉 Parabéns!</h1>
                <p>Você concluiu esta atividade.</p>
                <button onClick={fecharParabens}>Continuar</button>
            </div>
        </>,
        document.body
    );
}

export default Atividades;
