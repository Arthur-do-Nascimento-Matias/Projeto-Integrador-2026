import { useEffect, useMemo, useState } from "react";
import "./RedacaoEditor.css";

// teste 
const ID_USUARIO_ATUAL = 22;

function RedacaoEditor({ tema, aoVoltar }) {
    const idTema = tema?.id_tema || tema?.idTema || 1;
    const tituloTema =
        tema?.titulo ||
        tema?.titulo_tema ||
        "Os impactos da tecnologia na educação contemporânea";

    const [idRedacao, setIdRedacao] = useState(null);
    const [tituloRedacao, setTituloRedacao] = useState("");
    const [textoRedacao, setTextoRedacao] = useState("");

    const [carregandoRascunho, setCarregandoRascunho] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [statusSalvamento, setStatusSalvamento] = useState("");
    const [erro, setErro] = useState("");

    const [enviandoCorrecao, setEnviandoCorrecao] = useState(false);

    useEffect(() => {
        carregarRascunhoExistente();
    }, [idTema]);

    async function carregarRascunhoExistente() {
        try {
            setCarregandoRascunho(true);
            setErro("");

            const url = `http://localhost:3000/redacoes/rascunho?id_usuario=${ID_USUARIO_ATUAL}&id_tema=${idTema}`;
            const resposta = await fetch(url);

            if (!resposta.ok) return;

            const dados = await resposta.json();
            const rascunho = dados?.rascunho || dados;

            if (rascunho && (rascunho.conteudo || rascunho.titulo)) {
                setIdRedacao(rascunho.id_redacao || rascunho.id || null);
                setTituloRedacao(rascunho.titulo || "");
                setTextoRedacao(rascunho.conteudo || "");
                setStatusSalvamento("Rascunho recuperado do banco");
            }
        } catch (err) {
            console.error("Erro ao buscar rascunho:", err);
        } finally {
            setCarregandoRascunho(false);
        }
    }

    async function salvarRascunho() {
        if (!textoRedacao.trim() && !tituloRedacao.trim()) {
            setErro("Escreva pelo menos algumas palavras antes de salvar.");
            return null;
        }

        try {
            setSalvando(true);
            setErro("");
            setStatusSalvamento("Salvando...");

            const resposta = await fetch(
                "http://localhost:3000/redacoes/rascunho",
                {
                 method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_usuario: ID_USUARIO_ATUAL,
                        id_tema: idTema,
                        titulo: tituloRedacao,
                        conteudo: textoRedacao
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados?.mensagem || "Erro ao salvar.");
            }

            if (dados.id_redacao) {
                setIdRedacao(dados.id_redacao);
            }

            const horario = new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });
            setStatusSalvamento(`Salvo às ${horario}`);

            return dados.id_redacao || idRedacao;
        } catch (err) {
            console.error("Erro ao salvar rascunho:", err);
            setErro("Erro ao salvar no servidor. Verifique o backend.");
            setStatusSalvamento("");
            return null;
        } finally {
            setSalvando(false);
        }
    }

    // Parte q vai conectar ao Ollama depois
    async function enviarParaCorrecao() {
        const idAtual = await salvarRascunho();
        if (!idAtual) return;

        alert(
            `Rascunho #${idAtual} salvo! A correção com IA (Ollama) será conectada aqui pelo seu amigo.`
        );
    }

    const estatisticas = useMemo(() => {
        const textoLimpo = textoRedacao.trim();
        const palavras = textoLimpo ? textoLimpo.split(/\s+/).length : 0;
        const caracteres = textoRedacao.length;
        const quebras = textoLimpo ? textoRedacao.split("\n").length : 0;
        const linhasEstimadas = Math.max(quebras, Math.ceil(caracteres / 70));

        return {
            palavras,
            linhas: Math.min(30, linhasEstimadas)
        };
    }, [textoRedacao]);

    return (
        <div className="editorRedacaoAmbiente">
            <header className="editorTopo">
                <button className="editorBotaoVoltar" onClick={aoVoltar}>
                    ← Voltar para temas
                </button>

                <div className="editorStatusTopo">
                    {statusSalvamento && (
                        <span className="editorBadgeSalvo">
                            <span className="pontoVerde" />
                            {statusSalvamento}
                        </span>
                    )}
                    <span className="editorBadgeXp">VALE +150 XP</span>
                </div>
            </header>

            <div className="editorGrid">
                {/* LADO ESQUERDO: TEMA E MOKI */}
                <aside className="editorColunaApoio">
                    <div className="editorCardTema">
                        <span className="editorSubtag">
                            PROPOSTA DE REDAÇÃO • TEMA #{idTema}
                        </span>
                        <h2>{tituloTema}</h2>
                        <p className="editorDescricaoTema">
                            {tema?.descricao ||
                                "A partir da leitura dos textos motivadores, redija um texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa."}
                        </p>

                        <div className="editorTextosMotivadores">
                            <h4>Textos motivadores e instruções</h4>
                            <div className="editorTextoBloco">
                                <strong>Texto de apoio</strong>
                                <p>
                                    {tema?.texto_apoio ||
                                        tema?.textos_motivadores ||
                                        "O avanço das tecnologias digitais transformou a forma de ensinar, aprender e acessar conhecimento. Entretanto, desafios como a desigualdade de acesso e a necessidade de uso pedagógico ainda precisam ser superados."}
                                </p>
                            </div>

                            <ul className="editorRegrasLista">
                                <li>Defenda um ponto de vista com argumentos claros.</li>
                                <li>Apresente uma proposta de intervenção no final.</li>
                                <li>Escreva entre <strong>7 e 30 linhas</strong>.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="editorMokiCard">
                        <div className="editorMokiAvatar">🐵</div>
                        <div className="editorMokiFala">
                            <strong>Dica do Moki</strong>
                            <p>
                                {estatisticas.palavras < 50
                                    ? "Comece apresentando o tema no 1º parágrafo!"
                                    : "Ótimo ritmo! Lembre-se de salvar seu rascunho."}
                            </p>
                        </div>
                    </div>
                </aside>

                {/* LADO DIREITO: FOLHA PAUTADA */}
                <section className="editorColunaFolha">
                    <div className="folhaRedacaoContainer">
                        <div className="folhaCabecalho">
                            <div>
                                <span className="folhaMarca">FOLHA OFICIAL • SIMIOLAB</span>
                                <small>
                                    {idRedacao ? `Rascunho #${idRedacao}` : "Novo rascunho"}
                                </small>
                            </div>

                            <div className="folhaContadores">
                                <span>
                                    <strong>{estatisticas.palavras}</strong> palavras
                                </span>
                                <span>•</span>
                                <span>
                                    <strong>~{estatisticas.linhas}</strong>/30 linhas
                                </span>
                            </div>
                        </div>

                        {carregandoRascunho ? (
                            <div className="folhaCarregando">
                                <p>Buscando seu rascunho salvo...</p>
                            </div>
                        ) : (
                            <>
                                <div className="folhaTituloWrapper">
                                    <input
                                        type="text"
                                        className="folhaInputTitulo"
                                        placeholder="Título da sua redação (opcional)"
                                        value={tituloRedacao}
                                        onChange={(e) => setTituloRedacao(e.target.value)}
                                    />
                                </div>

                                <div className="folhaCorpoPautado">
                                    <div className="folhaNumerosLinhas">
                                        {Array.from({ length: 30 }, (_, idx) => (
                                            <span key={idx + 1}>
                                                {String(idx + 1).padStart(2, "0")}
                                            </span>
                                        ))}
                                    </div>

                                    <textarea
                                        className="folhaTextarea"
                                        placeholder="Comece a escrever sua redação aqui..."
                                        value={textoRedacao}
                                        onChange={(e) => setTextoRedacao(e.target.value)}
                                        rows={30}
                                    />
                                </div>
                            </>
                        )}

                        <footer className="folhaRodape">
                            <div className="folhaMensagemErro">
                                {erro && <span>⚠️ {erro}</span>}
                            </div>

                            <div className="folhaBotoesAcao">
                                <button
                                    type="button"
                                    className="botaoSalvarRascunho"
                                    onClick={salvarRascunho}
                                    disabled={salvando || carregandoRascunho}
                                >
                                    {salvando ? "Salvando..." : "Salvar rascunho"}
                                </button>

                                <button
                                    type="button"
                                    className="botaoEnviarCorrecao"
                                    onClick={enviarParaCorrecao}
                                    disabled={enviandoCorrecao || salvando || carregandoRascunho}
                                >
                                    Enviar para correção
                                </button>
                            </div>
                        </footer>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default RedacaoEditor;