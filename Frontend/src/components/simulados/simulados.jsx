import { useEffect, useMemo, useState } from "react";
import "./simulados.css";
import RedacaoEditor from "./RedacaoEditor";
import { apiFetch } from "../utils/api";
const FILTROS = [
    { valor: "portugues", nome: "Português" },
    { valor: "matematica", nome: "Matemática" },
    { valor: "historia", nome: "História" },
    { valor: "geografia", nome: "Geografia" },
    { valor: "ciencias", nome: "Ciências" },
    { valor: "ingles", nome: "Inglês" }
];

const MASCOTES_MATERIAS = {
    portugues: Miro,
    matematica: Bimo,
    historia: Ibra,
    geografia: Nala,
    ciencias: Kimo,
    ingles: Zoro
};

const ICONES_MATERIAS = {
    portugues: portuguesIcone,
    matematica: matematicaIcone,
    historia: historiaIcone,
    geografia: geografiaIcone,
    ciencias: cienciasIcone,
    ingles: inglesIcone
};

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
    const [filtro, setFiltro] = useState("matematica");
    const [anoSelecionado, setAnoSelecionado] = useState(6);
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
            const resposta = await apiFetch("/provas");
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
            const resposta = await apiFetch("/temasRedacao");
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

    const provasFiltradas = useMemo(() => provas.filter((prova) => {
        const materia = prova.materia || "geral";
        return (filtro === "todas" || materia === filtro)
            && Number(prova.anoProva) === anoSelecionado;
    }), [provas, filtro, anoSelecionado]);

    function abrirProva(idProva) {
        window.open(`/abrirProva?id=${idProva}`, "_blank", "noopener");
    }

    function baixarProva(idProva) {
        window.open(`/baixarProva?id=${idProva}`, "_blank", "noopener");
    }

    function obterCapa(prova) {
        if (!prova.temCapa) return null;
        return `/capaProva?id=${prova.idProva}`;
    }

    function formatarTipo(tipo) {
        if (tipo === "enem") return "ENEM";
        if (tipo === "vestibular") return "Vestibular";
        if (tipo === "simulado") return "Simulado";
        return "Prova";
    }

    function abrirTema(tema) {
        setTemaEmEscrita(tema);
        window.scrollTo(0, 0);
    }

    const naAbaProvas = abaAtiva === "provas";
    const temaDestaque = temas[0];

    return (
        <main className="simulados">
            <div className="simuladosLayout">
                {temaEmEscrita ? (
                    <RedacaoEditor
                        tema={temaEmEscrita}
                        aoVoltar={() => setTemaEmEscrita(null)}
                    />
                ) : (
                    <>
                        <header className="simuladosCabecalho">
                            <div>
                                <h1>
                                    {naAbaProvas ? <>Provas e <em>Simulados</em></> : <>Laboratório de <em>Redação</em></>}
                                </h1>
                                <p>
                                    {naAbaProvas
                                        ? "Encontre provas em PDF para praticar por matéria e ano."
                                        : "Escolha um tema, organize seus argumentos e salve seu rascunho."}
                                </p>
                            </div>

                            <div className="simuladosAbas" role="group" aria-label="Seções de prática">
                                <button type="button" aria-pressed={naAbaProvas} onClick={() => setAbaAtiva("provas")}>
                                    Provas
                                </button>
                                <button type="button" aria-pressed={!naAbaProvas} onClick={() => setAbaAtiva("redacoes")}>
                                    Redações
                                </button>
                            </div>
                        </header>

                        {naAbaProvas ? (
                            <>
                                <section className="simuladosPainel" aria-label="Filtros das provas">
                                    <div className="simuladosFiltrosPainel">
                                        <div className="simuladosGrupo" role="group" aria-labelledby="simulados-materia">
                                            <span id="simulados-materia">Matéria</span>
                                            <div className="simuladosFiltros">
                                                {FILTROS.map(({ valor, nome }) => (
                                                    <button
                                                        key={valor}
                                                        type="button"
                                                        className="simuladosFiltro"
                                                        data-materia={valor}
                                                        aria-pressed={filtro === valor}
                                                        onClick={() => {
                                                            setFiltro(valor);
                                                            setAnoSelecionado(6);
                                                        }}
                                                    >
                                                        {nome}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="simuladosGrupo" role="group" aria-labelledby="simulados-ano">
                                            <span id="simulados-ano">Ano escolar</span>
                                            <div className="simuladosFiltros simuladosAnos">
                                                {[6, 7, 8].map((ano) => (
                                                    <button
                                                        key={ano}
                                                        type="button"
                                                        className="simuladosFiltro"
                                                        aria-pressed={anoSelecionado === ano}
                                                        onClick={() => setAnoSelecionado(ano)}
                                                    >
                                                        {ano}º ano
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="simuladosMoki" aria-hidden="true">
                                        <img src={MASCOTES_MATERIAS[filtro] ?? Moki} alt="" />
                                    </div>
                                </section>

                                <section className="simuladosCatalogo" aria-labelledby="simulados-disponiveis">
                                    <div className="simuladosTituloSecao">
                                        <h2 id="simulados-disponiveis">Provas disponíveis</h2>
                                        {!carregando && !erro && (
                                            <span className="simuladosContagem" role="status">
                                                {provasFiltradas.length} {provasFiltradas.length === 1 ? "PDF" : "PDFs"}
                                            </span>
                                        )}
                                    </div>

                                    {carregando ? (
                                        <>
                                            <p className="simuladosLeitor" role="status">Carregando provas…</p>
                                            <div className="simuladosGrade" aria-hidden="true">
                                                {[1, 2, 3].map((item) => (
                                                    <div className="simuladosCard catalogo-card-vazio" key={item}>
                                                        <div className="simuladosCardCapa catalogo-esqueleto" />
                                                        <div className="simuladosCardConteudo">
                                                            <div className="catalogo-esqueleto catalogo-linha" />
                                                            <div className="catalogo-esqueleto catalogo-linha" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : erro ? (
                                        <div className="simuladosEstado">
                                            <p role="alert">{erro}</p>
                                            <button type="button" className="simuladosBotao" onClick={carregarProvas}>Tentar novamente</button>
                                        </div>
                                    ) : provasFiltradas.length === 0 ? (
                                        <div className="simuladosEstado">
                                            <p role="status">
                                                {filtro === "todas"
                                                    ? `Ainda não há provas para o ${anoSelecionado}º ano.`
                                                    : `Ainda não há provas de ${NOMES_MATERIAS[filtro]} para o ${anoSelecionado}º ano.`}
                                            </p>
                                            {filtro !== "todas" && (
                                                <button type="button" className="simuladosBotao" onClick={() => setFiltro("todas")}>
                                                    Ver todas as matérias
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="simuladosGrade">
                                            {provasFiltradas.map((prova) => {
                                                const capa = obterCapa(prova);
                                                const materia = prova.materia || "geral";
                                                const icone = ICONES_MATERIAS[materia];

                                                return (
                                                    <article className="simuladosCard" data-materia={materia} key={prova.idProva}>
                                                        <div className="simuladosCardCapa">
                                                            {capa && (
                                                                <img
                                                                    src={capa}
                                                                    alt=""
                                                                    className="simuladosCapaImagem"
                                                                    loading="lazy"
                                                                    onError={(evento) => { evento.currentTarget.hidden = true; }}
                                                                />
                                                            )}
                                                            <span className="simuladosCardSimbolo" aria-hidden="true">
                                                                {icone ? <img src={icone} alt="" /> : "PDF"}
                                                            </span>
                                                            <span className="simuladosCardTipo">{formatarTipo(prova.tipoProva)}</span>
                                                        </div>
                                                        <div className="simuladosCardConteudo">
                                                            <p className="simuladosCardMateria">
                                                                {NOMES_MATERIAS[materia] || "Geral"} · {prova.anoProva}º ano
                                                            </p>
                                                            <h3>{prova.NomeProva}</h3>
                                                            <div className="simuladosCardAcoes">
                                                                <button type="button" className="simuladosBotao primario" onClick={() => abrirProva(prova.idProva)}>
                                                                    Abrir PDF <span aria-hidden="true">↗</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="simuladosBotao simuladosBotaoBaixar"
                                                                    aria-label={`Baixar ${prova.NomeProva}`}
                                                                    title="Baixar PDF"
                                                                    onClick={() => baixarProva(prova.idProva)}
                                                                >
                                                                    <span aria-hidden="true">↓</span>
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
                        ) : (
                            <section className="redacoes" aria-label="Temas de redação">
                                {carregandoTemas ? (
                                    <div className="simuladosEstado"><p role="status">Carregando temas…</p></div>
                                ) : erroTemas ? (
                                    <div className="simuladosEstado">
                                        <p role="alert">{erroTemas}</p>
                                        <button type="button" className="simuladosBotao" onClick={carregarTemasRedacao}>Tentar novamente</button>
                                    </div>
                                ) : !temaDestaque ? (
                                    <div className="simuladosEstado"><p role="status">Ainda não há temas disponíveis.</p></div>
                                ) : (
                                    <>
                                        <article className="simuladosPainel redacaoDestaque">
                                            <div className="redacaoDestaqueConteudo">
                                                <span className="redacaoDestaqueEtiqueta">Tema em destaque</span>
                                                <h2>{temaDestaque.titulo || temaDestaque.titulo_tema || "Tema de redação"}</h2>
                                                {temaDestaque.descricao && <p>{temaDestaque.descricao}</p>}
                                                <div className="redacaoDestaqueAcoes">
                                                    <button type="button" className="simuladosBotao primario" onClick={() => abrirTema(temaDestaque)}>
                                                        Começar redação <span aria-hidden="true">→</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="simuladosMoki" aria-hidden="true">
                                                <img src={Moki} alt="" />
                                            </div>
                                        </article>

                                        <div className="redacoesListaTemas">
                                            <div className="simuladosTituloSecao"><h2>Temas para praticar</h2></div>
                                            <div className="simuladosGrade">
                                                {temas.map((tema) => (
                                                    <article key={tema.id_tema ?? tema.idTema ?? tema.titulo ?? tema.titulo_tema} className="simuladosCard redacaoCardTema">
                                                        <h3>{tema.titulo || tema.titulo_tema || "Tema de redação"}</h3>
                                                        {tema.descricao && <p>{tema.descricao}</p>}
                                                        <button type="button" className="simuladosBotao" onClick={() => abrirTema(tema)}>
                                                            Abrir tema <span aria-hidden="true">→</span>
                                                        </button>
                                                    </article>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </section>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

export default Simulados;
