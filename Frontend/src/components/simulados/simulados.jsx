import { useEffect, useMemo, useState } from "react";

import "./simulados.css";

const FILTROS = [
    { valor: "todos", nome: "Todos" },
    { valor: "portugues", nome: "Português" },
    { valor: "matematica", nome: "Matemática" },
    { valor: "historia", nome: "História" },
    { valor: "geografia", nome: "Geografia" },
    { valor: "ciencias", nome: "Ciências" },
    { valor: "ingles", nome: "Inglês" },
    { valor: "geral", nome: "Geral" },
];

const NOMES_MATERIAS = {
    portugues: "Português",
    matematica: "Matemática",
    historia: "História",
    geografia: "Geografia",
    ciencias: "Ciências",
    ingles: "Inglês",
    geral: "Geral",
};

function Simulados() {

    const [provas, setProvas] = useState([]);

    const [pesquisa, setPesquisa] = useState("");

    const [filtro, setFiltro] = useState("todos");

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState("");

    useEffect(() => {

        carregarProvas();

    }, []);

    async function carregarProvas() {

        try {

            setCarregando(true);

            setErro("");

            /*
                DEPOIS VAMOS TROCAR ESSA URL
                PELA URL EXATA DO SEU BACKEND.
            */

            const resposta = await fetch(
                "http://localhost/Projeto-Integrador-2026/Backend/provas/listarProvas.php"
            );

            if (!resposta.ok) {

                throw new Error("Não foi possível carregar as provas.");

            }

            const dados = await resposta.json();

            if (Array.isArray(dados)) {

                setProvas(dados);

            } else {

                setProvas([]);

            }

        } catch (erro) {

            console.error("Erro ao carregar provas:", erro);

            setErro(
                "Não foi possível carregar as provas."
            );

        } finally {

            setCarregando(false);

        }

    }

    const provasFiltradas = useMemo(() => {

        return provas.filter((prova) => {

            const materia = prova.materia || "geral";

            const nome = prova.NomeProva || "";

            const fonte = prova.fonteProva || "";

            const correspondeMateria =
                filtro === "todos" ||
                materia === filtro;

            const textoPesquisa =
                pesquisa
                    .toLowerCase()
                    .trim();

            const correspondePesquisa =
                nome
                    .toLowerCase()
                    .includes(textoPesquisa) ||
                fonte
                    .toLowerCase()
                    .includes(textoPesquisa) ||
                (NOMES_MATERIAS[materia] || "")
                    .toLowerCase()
                    .includes(textoPesquisa);

            return (
                correspondeMateria &&
                correspondePesquisa
            );

        });

    }, [provas, pesquisa, filtro]);

    function abrirProva(idProva) {

        window.open(
            `http://localhost/Projeto-Integrador-2026/Backend/provas/abrirProva.php?id=${idProva}`,
            "_blank"
        );

    }

    function obterCapa(prova) {

        if (!prova.temCapa) {

            return null;

        }

        return `http://localhost/Projeto-Integrador-2026/Backend/provas/capaProva.php?id=${prova.idProva}`;

    }

    return (
        <main className="simulados">

            <section className="simuladosCabecalho">

                <div>

                    <span className="simuladosSubtitulo">
                        SIMIOLAB
                    </span>

                    <h1>
                        Provas e Simulados
                    </h1>

                    <p>
                        Encontre provas para estudar e se preparar
                        para os próximos desafios.
                    </p>

                </div>

            </section>


            <section className="simuladosPesquisa">

                <div className="simuladosCampoPesquisa">

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle
                            cx="11"
                            cy="11"
                            r="8"
                        />

                        <path
                            d="m21 21-4.35-4.35"
                        />
                    </svg>

                    <input
                        type="text"
                        placeholder="Pesquisar provas e simulados..."
                        value={pesquisa}
                        onChange={(evento) => setPesquisa(evento.target.value)}
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

                <div className="simuladosTituloSecao">

                    <div>

                        <span>
                            ACERVO
                        </span>

                        <h2>
                            Provas para estudar
                        </h2>

                        <p>
                            Escolha uma prova e abra o material
                            para começar seus estudos.
                        </p>

                    </div>


                    {!carregando && !erro && (

                        <strong>
                            {provasFiltradas.length}

                            {provasFiltradas.length === 1
                                ? " prova"
                                : " provas"}
                        </strong>

                    )}

                </div>


                {carregando && (

                    <div className="simuladosEstado">

                        <div className="simuladosLoader" />

                        <h3>
                            Carregando provas...
                        </h3>

                        <p>
                            Buscando os materiais disponíveis.
                        </p>

                    </div>

                )}


                {!carregando && erro && (

                    <div className="simuladosEstado">

                        <div className="simuladosIconeEstado">
                            !
                        </div>

                        <h3>
                            Não conseguimos carregar as provas
                        </h3>

                        <p>
                            Verifique se o backend está funcionando.
                        </p>

                        <button
                            onClick={carregarProvas}
                        >
                            Tentar novamente
                        </button>

                    </div>

                )}


                {!carregando &&
                    !erro &&
                    provasFiltradas.length === 0 && (

                        <div className="simuladosEstado">

                            <div className="simuladosIconeEstado">
                                PDF
                            </div>

                            <h3>
                                Nenhuma prova encontrada
                            </h3>

                            <p>
                                Ainda não há nenhuma prova com
                                esses filtros.
                            </p>

                        </div>

                    )}


                {!carregando &&
                    !erro &&
                    provasFiltradas.length > 0 && (

                        <div className="simuladosGrade">

                            {provasFiltradas.map((prova) => {

                                const capa = obterCapa(prova);

                                const materia =
                                    prova.materia || "geral";

                                return (

                                    <article
                                        className="simuladosCard"
                                        key={prova.idProva}
                                    >

                                        <div className="simuladosCardCapa">

                                            {capa ? (

                                                <img
                                                    src={capa}
                                                    alt={prova.NomeProva}
                                                />

                                            ) : (

                                                <div className="simuladosCardSemCapa">

                                                    <span>
                                                        PDF
                                                    </span>

                                                    <strong>
                                                        {NOMES_MATERIAS[materia]}
                                                    </strong>

                                                </div>

                                            )}


                                            <span className="simuladosCardTipo">
                                                {prova.tipoProva}
                                            </span>

                                        </div>


                                        <div className="simuladosCardConteudo">

                                            <span className="simuladosCardMateria">
                                                {NOMES_MATERIAS[materia]}
                                            </span>


                                            <h3>
                                                {prova.NomeProva}
                                            </h3>


                                            <div className="simuladosCardInformacoes">

                                                {prova.fonteProva && (

                                                    <span>
                                                        {prova.fonteProva}
                                                    </span>

                                                )}


                                                {prova.fonteProva &&
                                                    prova.anoProva && (

                                                        <span className="simuladosPonto" />

                                                    )}


                                                {prova.anoProva && (

                                                    <span>
                                                        {prova.anoProva}
                                                    </span>

                                                )}

                                            </div>


                                            <button
                                                className="simuladosBotaoAbrir"
                                                onClick={() => abrirProva(prova.idProva)}
                                            >

                                                <span>
                                                    Abrir prova
                                                </span>

                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path
                                                        d="M5 12h14"
                                                    />

                                                    <path
                                                        d="m13 6 6 6-6 6"
                                                    />
                                                </svg>

                                            </button>

                                        </div>

                                    </article>

                                );

                            })}

                        </div>

                    )}

            </section>


            <section className="simuladosEmBreve">

                <div>

                    <span>
                        PRÓXIMA ETAPA
                    </span>

                    <h2>
                        Simulados interativos
                    </h2>

                    <p>
                        Depois das provas em PDF, aqui vamos
                        colocar os simulados que poderão ser
                        respondidos diretamente pelo SimioLab.
                    </p>

                </div>

            </section>


            <section className="simuladosRedacao">

                <div>

                    <span>
                        REDAÇÕES
                    </span>

                    <h2>
                        Pratique sua escrita
                    </h2>

                    <p>
                        Em seguida vamos adicionar temas,
                        redações enviadas, notas e evolução
                        do aluno.
                    </p>

                </div>


                <div className="simuladosRedacaoIcone">
                    Aa
                </div>

            </section>

        </main>
    );

}

export default Simulados;