import Moki from "../../assets/MOKI.png";
import { useEffect, useMemo, useState } from "react";
import "./RedacaoEditor.css";

// teste 
const ID_USUARIO_ATUAL = 22;

const ETAPAS_REDACAO = [
    {
        nome: "Introdução",
        dica: "Contextualize o tema, declare sua tese e indique os dois argumentos que você vai desenvolver.",
        pergunta: "Que posição eu defendo e quais dois argumentos sustentam essa posição?"
    },
    {
        nome: "Desenvolvimento 1",
        dica: "Apresente seu primeiro argumento na frase inicial. Use um exemplo, dado ou referência, explique o que ele demonstra e conecte a ideia à sua tese.",
        pergunta: "Que exemplo sustenta meu primeiro argumento? Como ele ajuda a provar meu ponto?"
    },
    {
        nome: "Desenvolvimento 2",
        dica: "Abra o parágrafo com seu segundo argumento. Aprofunde uma causa, consequência ou outro aspecto do tema e mostre como ele reforça sua tese.",
        pergunta: "Que aspecto novo este parágrafo acrescenta ao anterior?"
    },
    {
        nome: "Conclusão",
        dica: "Retome sua tese. Na proposta de intervenção, diga quem age, o que deve fazer, como e com qual finalidade. Detalhe um desses pontos e respeite os direitos humanos.",
        pergunta: "Minha proposta responde ao problema que desenvolvi ao longo do texto?"
    }
];

function RedacaoEditor({ tema, aoVoltar }) {
    const idTema = tema?.id_tema || tema?.idTema || 1;
    const tituloTema =
        tema?.titulo ||
        tema?.titulo_tema ||
        "Os impactos da tecnologia na educação contemporânea";

    const [idRedacao, setIdRedacao] = useState(null);
    const [tituloRedacao, setTituloRedacao] = useState("");
    const [textoRedacao, setTextoRedacao] = useState("");
    const [etapaSelecionada, setEtapaSelecionada] = useState(0);
    const etapa = ETAPAS_REDACAO[etapaSelecionada];

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
                <button type="button" className="simuladosBotao editorBotaoVoltar" onClick={aoVoltar}>
                    ← Voltar para temas
                </button>

                <div className="editorStatusTopo">
                    {statusSalvamento && (
                        <span className="editorBadgeSalvo" role="status">
                            <span className="pontoVerde" />
                            {statusSalvamento}
                        </span>
                    )}
                    <span className="editorBadgeXp">+150 XP</span>
                </div>
            </header>

            <div className="editorGrid">
                {/* LADO ESQUERDO: TEMA E MOKI */}
                <aside className="editorColunaApoio">
                    <div className="editorCardTema">
                        <span className="editorSubtag">
                            Proposta de redação
                        </span>
                        <h2>{tituloTema}</h2>
                        <p className="editorDescricaoTema">
                            {tema?.descricao ||
                                "A partir da leitura dos textos motivadores, redija um texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa."}
                        </p>

                        <details className="editorTextosMotivadores">
                            <summary>Textos motivadores e instruções</summary>
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
                        </details>
                    </div>

                    <details className="editorMokiCard" open>
                        <summary className="editorGuiaTitulo">
                            <span className="editorMokiAvatar">
                                <img src={Moki} alt="" className="editorMokiImagem" />
                            </span>
                            <strong>Guia de redação do Moki</strong>
                        </summary>
                        <div className="editorGuiaEtapas" role="group" aria-label="Partes da redação">
                            {ETAPAS_REDACAO.map(({ nome }, indice) => (
                                <button
                                    key={nome}
                                    type="button"
                                    aria-pressed={etapaSelecionada === indice}
                                    onClick={() => setEtapaSelecionada(indice)}
                                >
                                    {nome}
                                </button>
                            ))}
                        </div>
                        <div className="editorMokiFala" aria-live="polite">
                            <p>{etapa.dica}</p>
                            <p className="editorGuiaPergunta">{etapa.pergunta}</p>
                        </div>
                    </details>
                </aside>

                {/* LADO DIREITO: FOLHA PAUTADA */}
                <section className="editorColunaFolha">
                    <div className="folhaRedacaoContainer">
                        <div className="folhaCabecalho">
                            <div>
                                <span className="folhaMarca">Sua redação</span>
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
                                <p role="status">Buscando seu rascunho salvo…</p>
                            </div>
                        ) : (
                            <>
                                <div className="folhaTituloWrapper">
                                    <input
                                        type="text"
                                        className="folhaInputTitulo"
                                        aria-label="Título da redação"
                                        placeholder="Título da sua redação (opcional)"
                                        value={tituloRedacao}
                                        onChange={(e) => setTituloRedacao(e.target.value)}
                                    />
                                </div>

                                <div className="folhaCorpoPautado">
                                    <div className="folhaNumerosLinhas" aria-hidden="true">
                                        {Array.from({ length: 30 }, (_, idx) => (
                                            <span key={idx + 1}>
                                                {String(idx + 1).padStart(2, "0")}
                                            </span>
                                        ))}
                                    </div>

                                    <textarea
                                        className="folhaTextarea"
                                        aria-label="Texto da redação"
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
                                {erro && <span role="alert">{erro}</span>}
                            </div>

                            <div className="folhaBotoesAcao">
                                <button
                                    type="button"
                                    className="simuladosBotao botaoSalvarRascunho"
                                    onClick={salvarRascunho}
                                    disabled={salvando || carregandoRascunho}
                                >
                                    {salvando ? "Salvando..." : "Salvar rascunho"}
                                </button>

                                <button
                                    type="button"
                                    className="simuladosBotao primario botaoEnviarCorrecao"
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
