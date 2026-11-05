import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Atividades.css";
import LicaoConcluida from "./LicaoConcluida";
import { resumirLicao } from "./resultadoLicao.js";
import { registrarResposta, registrarAtividadeConcluida } from "../utils/missoes";
// indiceQuestao é a ordem da pergunta dentro da matéria (começa em 1).
export async function criarAtividade(
    refAtividade, refEnunciado, indiceQuestao, materiaAtual,
    refAlternativa1, refAlternativa2, refAlternativa3, refAlternativa4,
    controle = {}
) {
    const parametros = new URLSearchParams({
        materia: String(materiaAtual),
        atividadeAtual: String(indiceQuestao)
    });
    const resposta = await fetch(`http://localhost:3000/atividades?${parametros}`, {
        cache: "no-store",
        signal: controle.signal
    });
    if (!resposta.ok) throw new Error(`Erro ao carregar pergunta: HTTP ${resposta.status}`);
    const dados = await resposta.json();
    if (dados.concluido || !dados.pergunta) {
        throw new Error("O backend não retornou uma pergunta para esta atividade.");
    }
    const alternativas = [dados.alternativa1, dados.alternativa2, dados.alternativa3, dados.alternativa4];
    if (alternativas.some(alternativa => !alternativa)) {
        throw new Error("O backend retornou alternativas incompletas.");
    }
    for (let i = alternativas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [alternativas[i], alternativas[j]] = [alternativas[j], alternativas[i]];
    }
    if (controle.signal?.aborted) return alternativas;
    if (refEnunciado.current) refEnunciado.current.innerHTML = dados.pergunta;
    const refs = [refAlternativa1, refAlternativa2, refAlternativa3, refAlternativa4];
    refs.forEach((ref, indice) => {
        if (ref.current) ref.current.innerHTML = alternativas[indice].texto;
    });
    return alternativas;
}
function sairAtividade(refAtividade) {
    if (refAtividade.current) refAtividade.current.style.transform = "translateX(100%)";
    const trilha = document.getElementById("trilha");
    if (trilha) trilha.style.opacity = "1";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
}
function Atividades({
    draft, refAtividade, atividadeAtual, setAtvLiberada, materiaAtual,
    refEnunciado, refAlternativa1, refAlternativa2, refAlternativa3, refAlternativa4
}) {
    const indiceAtv = useRef(1);
    const cliques = useRef(0);
    const alternativas = useRef([]);
    const respostaBloqueada = useRef(true);
    const finalizando = useRef(false);
    const atividadeSalva = useRef(false);
    const respostas = useRef([]);
    const sessao = useRef(0);
    const requisicao = useRef(null);
    const [resultado, setResultado] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [erroSalvar, setErroSalvar] = useState("");
    const refsAlternativas = [refAlternativa1, refAlternativa2, refAlternativa3, refAlternativa4];
    async function carregarPergunta(indice, versao = sessao.current) {
        respostaBloqueada.current = true;
        requisicao.current?.abort();
        const controle = new AbortController();
        requisicao.current = controle;
        if (refEnunciado.current) refEnunciado.current.textContent = "Carregando pergunta...";
        try {
            const resposta = await criarAtividade(
                refAtividade, refEnunciado, indice, materiaAtual,
                ...refsAlternativas, { signal: controle.signal }
            );
            if (versao !== sessao.current || controle.signal.aborted) return;
            alternativas.current = resposta;
            respostaBloqueada.current = false;
        } catch (erro) {
            if (erro.name === "AbortError" || versao !== sessao.current) return;
            console.error("Erro ao carregar atividade:", erro);
            if (refEnunciado.current) {
                refEnunciado.current.textContent = "Não foi possível carregar a pergunta. Saia e tente novamente.";
            }
        }
    }
    // Mantém a lógica da trilha: a atividade recebida define o primeiro índice.
    useEffect(() => {
        const numeroAtividade = Number(atividadeAtual);
        if (!Number.isInteger(numeroAtividade) || numeroAtividade < 1 || !materiaAtual) return;
        const versao = ++sessao.current;
        cliques.current = 0;
        indiceAtv.current = (numeroAtividade - 1) * 3 + 1;
        alternativas.current = [];
        respostas.current = [];
        atividadeSalva.current = false;
        finalizando.current = false;
        setResultado(null);
        setSalvando(false);
        setErroSalvar("");
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        carregarPergunta(indiceAtv.current, versao);
        return () => {
            sessao.current++;
            requisicao.current?.abort();
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        };
    }, [atividadeAtual, materiaAtual]);
    function sair() {
        if (finalizando.current) return;
        sessao.current++;
        requisicao.current?.abort();
        respostaBloqueada.current = true;
        sairAtividade(refAtividade);
        setResultado(null);
        window.dispatchEvent(new Event("simio:atividade-fechada"));
    }
    async function verificar(id, botao) {
        if (respostaBloqueada.current) return;
        const alternativa = alternativas.current[id];
        if (!alternativa) return;
        respostaBloqueada.current = true;
        const versao = sessao.current;
        try {
            // Registra também as respostas erradas, usando o ID da alternativa.
            await registrarResposta(alternativa.id_alternativa);
            if (versao !== sessao.current) return;
            const correta = Number(alternativa.verdadeira) === 1;
            respostas.current.push({ questao: indiceAtv.current, correta });
            if (!correta) {
                botao.style.animation = "chacualhar 200ms ease-in-out alternate";
                setTimeout(() => { botao.style.animation = ""; }, 200);
                respostaBloqueada.current = false;
                return;
            }
            if (cliques.current < 2) {
                cliques.current += 1;
                indiceAtv.current += 1;
                await carregarPergunta(indiceAtv.current, versao);
            } else {
                // Como no fluxo original, salva ao pressionar Continuar.
                sairAtividade(refAtividade);
                setResultado(resumirLicao(respostas.current, 3, 50));
            }
        } catch (erro) {
            if (versao !== sessao.current) return;
            console.error("Erro ao registrar resposta:", erro);
            respostaBloqueada.current = false;
            alert(erro.message || "Não foi possível registrar a resposta. Tente novamente.");
        }
    }
    async function fecharParabens() {
        if (finalizando.current || atividadeSalva.current) return;
        finalizando.current = true;
        setSalvando(true);
        setErroSalvar("");
        const token = localStorage.getItem("token");
        try {
            if (!token || !draft?.id) throw new Error("Faça login novamente para salvar a atividade.");
            const resposta = await fetch("http://localhost:3000/concluirAtividade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    materia: materiaAtual,
                    atividade: Number(atividadeAtual),
                    id: draft.id,
                    atividadesConcluidas: draft.atividadesConcluidas,
                    xp: 50
                })
            });
            if (!resposta.ok) throw new Error(`Erro ao salvar atividade: HTTP ${resposta.status}`);
            const texto = await resposta.text();
            const dados = texto ? JSON.parse(texto) : {};
            if (dados.ok === false) throw new Error(dados.message || dados.erro || "Não foi possível salvar a atividade.");
            atividadeSalva.current = true;
            setResultado(null);
            sairAtividade(refAtividade);
            // Exatamente o gatilho usado pela trilha original para reler o banco.
            setAtvLiberada(anterior => anterior + 1);
            window.dispatchEvent(new Event("simio:atividade-fechada"));
            // Falhas nas missões não repetem o salvamento do progresso.
            Promise.resolve()
                .then(() => registrarAtividadeConcluida(materiaAtual, atividadeAtual))
                .catch(erro => console.error("Atividade salva, mas houve erro ao atualizar missões:", erro));
            // Preserva a atualização de sequência do código original.
            fetch("http://localhost:3000/sequencia", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ idUser: draft.id })
            })
                .then(res => {
                    if (!res.ok) console.error("Erro ao atualizar sequência: HTTP", res.status);
                })
                .catch(erro => console.error("Erro na sequência:", erro));
        } catch (erro) {
            console.error("Erro ao concluir atividade:", erro);
            setErroSalvar(erro.message || "Não foi possível salvar a atividade. Tente novamente.");
        } finally {
            finalizando.current = false;
            setSalvando(false);
        }
    }
    return createPortal(
        <>
            <div className="atividade" id="atividade" ref={refAtividade}>
                <button onClick={sair}>Sair</button>
                <h1 className="enunciado" id="enunciado" ref={refEnunciado} />
                <button className="alternativa1" id="alternativa1" onClick={e => verificar(0, e.currentTarget)} ref={refAlternativa1} />
                <button className="alternativa2" id="alternativa2" onClick={e => verificar(1, e.currentTarget)} ref={refAlternativa2} />
                <button className="alternativa3" id="alternativa3" onClick={e => verificar(2, e.currentTarget)} ref={refAlternativa3} />
                <button className="alternativa4" id="alternativa4" onClick={e => verificar(3, e.currentTarget)} ref={refAlternativa4} />
            </div>
            {resultado && <LicaoConcluida
                resultado={resultado}
                atividade={atividadeAtual}
                onContinuar={fecharParabens}
                onInicio={fecharParabens}
            />}
            {resultado && (salvando || erroSalvar) && <div
                role={erroSalvar ? "alert" : "status"}
                style={{ position: "fixed", bottom: 16, left: "5%", right: "5%", zIndex: 2147483647, background: "#fff4d6", color: "#493600", padding: 12, borderRadius: 8 }}
            >
                {salvando ? "Salvando atividade..." : erroSalvar}
                {erroSalvar && !salvando && <button onClick={fecharParabens}>Tentar salvar novamente</button>}
            </div>}
        </>,
        document.body
    );
}
export default Atividades;
