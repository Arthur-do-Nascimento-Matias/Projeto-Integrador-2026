import { useEffect, useMemo, useState } from "react";
import "./simulados.css";
import RedacaoEditor from "./RedacaoEditor";
import RedacoesReferencia from "./RedacoesReferencia";


const FILTROS = [
    { valor: "todos", nome: "Todos" },
    { valor: "portugues", nome: "Português" },
    { valor: "matematica", nome: "Matemática" },
    { valor: "historia", nome: "História" },
    { valor: "geografia", nome: "Geografia" },
    { valor: "ciencias", nome: "Ciências" },
    { valor: "ingles", nome: "Inglês" },
    { valor: "geral", nome: "Geral" }
];

const NOMES_MATERIAS = {
    portugues: "Português",
    matematica: "Matemática",
    historia: "História",
    geografia: "Geografia",
    ciencias: "Ciências",
    ingles: "Inglês",
    geral: "Geral"
};

function Simulados() {
    const [abaAtiva, setAbaAtiva] = useState("provas");

    const [provas, setProvas] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [filtro, setFiltro] = useState("todos");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [temas, setTemas] = useState([]);
    const [carregandoTemas, setCarregandoTemas] = useState(false);
    const [erroTemas, setErroTemas] = useState("");
    const [temaEmEscrita, setTemaEmEscrita] = useState(null);

    useEffect(() => {
        carregarProvas();
        carregarTemasRedacao();
    }, []);

    async function carregarProvas() {
        try {
            setCarregando(true);
            setErro("");
            const resposta = await fetch("http://localhost:3000/provas");
            if (!resposta.ok) throw new Error("Erro ao carregar provas.");
            const dados = await resposta.json();
            setProvas(Array.isArray(dados) ? dados : []);
        } catch (erro) {
            console.error("Erro ao carregar provas:", erro);
            setErro("Não foi possível carregar as provas.");
        } finally {
            setCarregando(false);
        }
    }

    async function carregarTemasRedacao() {
        try {
            setCarregandoTemas(true);
            setErroTemas("");
            const resposta = await fetch("http://localhost:3000/temasRedacao");
            if (!resposta.ok) throw new Error("Erro ao carregar temas.");
            const dados = await resposta.json();
            setTemas(Array.isArray(dados) ? dados : []);
        } catch (erro) {
            console.error("Erro ao carregar temas:", erro);
            setErroTemas("Não foi possível carregar os temas de redação.");
        } finally {
            setCarregandoTemas(false);
        }
    }

    const provasFiltradas = useMemo(() => {
        return provas.filter((prova) => {
            const materia = prova.materia || "geral";
            const nome = prova.NomeProva || "";
            const fonte = prova.fonteProva || "";
            const tipo = prova.tipoProva || "";

            const correspondeMateria = filtro === "todos" || materia === filtro;
            const textoPesquisa = pesquisa.toLowerCase().trim();

            const correspondePesquisa =
                nome.toLowerCase().includes(textoPesquisa) ||
                fonte.toLowerCase().includes(textoPesquisa) ||
                tipo.toLowerCase().includes(textoPesquisa) ||
                (NOMES_MATERIAS[materia] || "").toLowerCase().includes(textoPesquisa);

            return correspondeMateria && correspondePesquisa;
        });
    }, [provas, pesquisa, filtro]);

    function abrirProva(idProva) {
        window.open(`http://localhost:3000/abrirProva?id=${idProva}`, "_blank");
    }

    function baixarProva(idProva) {
        window.open(`http://localhost:3000/baixarProva?id=${idProva}`, "_blank");
    }

    function obterCapa(prova) {
        if (!prova.temCapa) return null;
        return `http://localhost:3000/capaProva?id=${prova.idProva}`;
    }

    function formatarTipo(tipo) {
        if (tipo === "enem") return "ENEM";
        if (tipo === "vestibular") return "Vestibular";
        if (tipo === "simulado") return "Simulado";
        return "Prova";
    }

    function iniciarRedacao(tema) {
        setTemaEmEscrita(tema);
    }

    return (
        <main className="simulados">
            <section className="simuladosCabecalho">
                <div className="simuladosCabecalhoTopo">
                    <div>
                        <span className="simuladosSubtitulo">SIMIOLAB</span>
                        <h1>
                            {abaAtiva === "provas"
                                ? "Provas e Simulados"
                                : "Laboratório de Redação"}
                        </h1>
                        <p>
                            {abaAtiva === "provas"
                                ? "Explore provas, simulados e materiais em PDF para praticar seus conhecimentos e se preparar para novos desafios."
                                : "Desenvolva sua argumentação em um ambiente focado, salve seus rascunhos e acompanhe sua evolução na escrita."}
                        </p>
                    </div>

                    <div className="simuladosAbas">
                        <button
                            className={
                                abaAtiva === "provas"
                                    ? "simuladosAbaBotao ativo"
                                    : "simuladosAbaBotao"
                            }
                            onClick={() => {
                                setAbaAtiva("provas");
                                setTemaEmEscrita(null);
                            }}
                        >
                            Provas
                        </button>

                        <button
                            className={
                                abaAtiva === "redacoes"
                                    ? "simuladosAbaBotao ativoRedacao"
                                    : "simuladosAbaBotao"
                            }
                            onClick={() => setAbaAtiva("redacoes")}
                        >
                            Redações
                        </button>
                    </div>
                </div>
            </section>

            {/* ABA 1: PROVAS */}
            {abaAtiva === "provas" && (
                <>
                    <section className="simuladosPesquisa">
                        <div className="simuladosCampoPesquisa">
                            <input
                                type="text"
                                placeholder="Pesquisar provas e simulados..."
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                            />
                        </div>

                        <div className="simuladosFiltros">
                            {FILTROS.map((item) => (
                                <button
                                    key={item.valor}
                                    className={
                                        filtro === item.valor
                                            ? "simuladosFiltro ativo"
                                            : "simuladosFiltro"
                                    }
                                    onClick={() => setFiltro(item.valor)}
                                >
                                    {item.nome}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="simuladosCatalogo">
                        {!carregando && !erro && provasFiltradas.length > 0 && (
                            <div className="simuladosGrade">
                                {provasFiltradas.map((prova) => {
                                    const capa = obterCapa(prova);
                                    const materia = prova.materia || "geral";

                                    return (
                                        <article className="simuladosCard" key={prova.idProva}>
                                            <div className="simuladosCardCapa">
                                                {capa ? (
                                                    <img src={capa} alt={prova.NomeProva} />
                                                ) : (
                                                    <div className="simuladosCardSemCapa">
                                                        <span>PDF</span>
                                                        <strong>{NOMES_MATERIAS[materia]}</strong>
                                                    </div>
                                                )}
                                                <span className="simuladosCardTipo">
                                                    {formatarTipo(prova.tipoProva)}
                                                </span>
                                            </div>

                                            <div className="simuladosCardConteudo">
                                                <span className="simuladosCardMateria">
                                                    {NOMES_MATERIAS[materia]}
                                                </span>
                                                <h3>{prova.NomeProva}</h3>
                                                <div className="simuladosCardAcoes">
                                                    <button
                                                        className="simuladosBotaoAbrir"
                                                        onClick={() => abrirProva(prova.idProva)}
                                                    >
                                                        <span>Abrir</span>
                                                    </button>
                                                    <button
                                                        className="simuladosBotaoBaixar"
                                                        onClick={() => baixarProva(prova.idProva)}
                                                    >
                                                        ↓
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* ABA 2: REDAÇÕES — SE CLICOU EM UM TEMA, ABRE A FOLHA DE REDAÇÃO */}
            {abaAtiva === "redacoes" && temaEmEscrita && (
                <RedacaoEditor
                    tema={temaEmEscrita}
                    aoVoltar={() => setTemaEmEscrita(null)}
                />
            )}

            {/* ABA 2: REDAÇÕES — SE NÃO CLICOU EM TEMA, MOSTRA O PAINEL */}
            {abaAtiva === "redacoes" && !temaEmEscrita && (
                <section className="redacoes SejaBemVindoRedacoes">
                    <div className="redacoesConteudo">
                        <article className="redacaoDestaque">
                            <div className="redacaoDestaqueTopo">
                                <span>TEMA EM DESTAQUE</span>
                                <div className="redacaoNivel">ENEM • +150 XP</div>
                            </div>

                            <div className="redacaoDestaqueConteudo">
                                <span className="redacaoTipo">Dissertativo-argumentativo</span>
                                <h3>
                                    {temas[0]?.titulo ||
                                        "Os impactos da tecnologia na educação contemporânea"}
                                </h3>
                                <p>
                                    {temas[0]?.descricao ||
                                        "Reflita sobre como o avanço das tecnologias digitais tem transformado a forma de ensinar, aprender e acessar conhecimento."}
                                </p>
                            </div>

                            <div className="redacaoDestaqueRodape">
                                <div>
                                    <span>RECOMPENSA</span>
                                    <strong>+150 XP</strong>
                                </div>

                                <button
                                    onClick={() =>
                                        iniciarRedacao(
                                            temas[0] || {
                                                id_tema: 1,
                                                titulo: "Os impactos da tecnologia na educação contemporânea"
                                            }
                                        )
                                    }
                                >
                                    Começar redação
                                </button>
                            </div>
                        </article>

                        <div className="redacoesResumo">
                            <article className="redacaoResumoCard">
                                <div>
                                    <span>MINHAS REDAÇÕES</span>
                                    <h3>Seu histórico de escrita</h3>
                                    <p>Consulte redações enviadas, notas e feedbacks.</p>
                                </div>
                            </article>

                            <article className="redacaoResumoCard">
                                <div>
                                    <span>RASCUNHOS SALVOS</span>
                                    <h3>Continue de onde parou</h3>
                                    <p>Seu rascunho é recuperado automaticamente.</p>
                                </div>
                                <button
                                    onClick={() =>
                                        iniciarRedacao(
                                            temas[0] || {
                                                id_tema: 1,
                                                titulo: "Os impactos da tecnologia na educação contemporânea"
                                            }
                                        )
                                    }
                                >
                                    Continuar rascunho →
                                </button>
                            </article>
                        </div>
                    </div>

                    <div id="secao-temas" className="redacoesListaTemas">
                        <div className="simuladosTituloSecao">
                            <div>
                                <span>PROPOSTAS DISPONÍVEIS</span>
                                <h2>Escolha um tema para praticar</h2>
                            </div>
                        </div>

                        {!carregandoTemas && !erroTemas && temas.length > 0 && (
                            <div className="redacoesGradeTemas">
                                {temas.map((tema) => {
                                    const id = tema.id_tema || tema.idTema || 1;
                                    const titulo = tema.titulo || tema.titulo_tema || "Tema";
                                    return (
                                        <article key={id} className="redacaoCardTema">
                                            <h3>{titulo}</h3>
                                            <p>{tema.descricao}</p>
                                            <button
                                                className="redacaoBotaoEscrever"
                                                onClick={() => iniciarRedacao(tema)}
                                            >
                                                Escrever redação →
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <RedacoesReferencia />
                </section>
            )}
        </main>
    );
}

export default Simulados;