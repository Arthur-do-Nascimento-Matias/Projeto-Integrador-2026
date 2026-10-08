import { useEffect, useMemo, useState } from "react";

import "./simulados.css";


const FILTROS = [
    {
        valor: "todos",
        nome: "Todos"
    },

    {
        valor: "portugues",
        nome: "Português"
    },

    {
        valor: "matematica",
        nome: "Matemática"
    },

    {
        valor: "historia",
        nome: "História"
    },

    {
        valor: "geografia",
        nome: "Geografia"
    },

    {
        valor: "ciencias",
        nome: "Ciências"
    },

    {
        valor: "ingles",
        nome: "Inglês"
    },

    {
        valor: "geral",
        nome: "Geral"
    }
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

            const resposta = await fetch(
                "http://localhost:3000/provas"
            );


            if (!resposta.ok) {

                throw new Error(
                    "Não foi possível carregar as provas."
                );

            }


            const dados = await resposta.json();


            if (Array.isArray(dados)) {

                setProvas(dados);

            } else {

                setProvas([]);

            }

        } catch (erro) {

            console.error(
                "Erro ao carregar provas:",
                erro
            );


            setErro(
                "Não foi possível carregar as provas."
            );

        } finally {

            setCarregando(false);

        }

    }


    const provasFiltradas = useMemo(() => {

        return provas.filter((prova) => {

            const materia =
                prova.materia || "geral";

            const nome =
                prova.NomeProva || "";

            const fonte =
                prova.fonteProva || "";

            const tipo =
                prova.tipoProva || "";


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

                tipo
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
        `http://localhost:3000/abrirProva?id=${idProva}`,
        "_blank"
        );

    }


    function baixarProva(idProva) {

        window.open(
                  `http://localhost:3000/baixarProva?id=${idProva}`,
        "_blank"
        );

    }


    function obterCapa(prova) {

        if (!prova.temCapa) {

            return null;

        }


        return `http://localhost:3000/capaProva?id=${prova.idProva}`;

    }


    function formatarTipo(tipo) {

        if (tipo === "enem") {

            return "ENEM";

        }


        if (tipo === "vestibular") {

            return "Vestibular";

        }


        if (tipo === "simulado") {

            return "Simulado";

        }


        return "Prova";

    }


    function abrirAreaRedacao() {

        alert(
            "A área de redações será conectada ao banco na próxima etapa."
        );

    }


    return (
        <main className="simulados">


            {/* ==================================================
                CABEÇALHO
            ================================================== */}

            <section className="simuladosCabecalho">

                <div>

                    <span className="simuladosSubtitulo">
                        SIMIOLAB
                    </span>

                    <h1>
                        Provas e Simulados
                    </h1>

                    <p>
                        Explore provas, simulados e materiais em PDF
                        para praticar seus conhecimentos e se preparar
                        para novos desafios.
                    </p>

                </div>

            </section>


            {/* ==================================================
                PESQUISA
            ================================================== */}

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


            {/* ==================================================
                PROVAS E SIMULADOS
            ================================================== */}

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
                            Escolha um material, abra o PDF
                            ou faça o download para estudar depois.
                        </p>

                    </div>


                    {!carregando && !erro && (

                        <strong>
                            {provasFiltradas.length}

                            {provasFiltradas.length === 1
                                ? " material"
                                : " materiais"}
                        </strong>

                    )}

                </div>


                {/* CARREGANDO */}

                {carregando && (

                    <div className="simuladosEstado">

                        <div className="simuladosLoader" />

                        <h3>
                            Carregando materiais...
                        </h3>

                        <p>
                            Buscando as provas disponíveis.
                        </p>

                    </div>

                )}


                {/* ERRO */}

                {!carregando && erro && (

                    <div className="simuladosEstado">

                        <div className="simuladosIconeEstado">
                            !
                        </div>

                        <h3>
                            Não foi possível carregar
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


                {/* NENHUMA PROVA */}

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
                                Nenhum material corresponde
                                aos filtros selecionados.
                            </p>

                        </div>

                    )}


                {/* CARDS */}

                {!carregando &&
                    !erro &&
                    provasFiltradas.length > 0 && (

                        <div className="simuladosGrade">

                            {provasFiltradas.map((prova) => {

                                const capa =
                                    obterCapa(prova);

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
                                                {formatarTipo(prova.tipoProva)}
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


                                            <div className="simuladosCardAcoes">

                                                <button
                                                    className="simuladosBotaoAbrir"
                                                    onClick={() => abrirProva(prova.idProva)}
                                                >

                                                    <span>
                                                        Abrir
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


                                                <button
                                                    className="simuladosBotaoBaixar"
                                                    onClick={() => baixarProva(prova.idProva)}
                                                    title="Baixar PDF"
                                                >

                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >

                                                        <path
                                                            d="M12 3v12"
                                                        />

                                                        <path
                                                            d="m7 10 5 5 5-5"
                                                        />

                                                        <path
                                                            d="M5 21h14"
                                                        />

                                                    </svg>

                                                </button>

                                            </div>

                                        </div>

                                    </article>

                                );

                            })}

                        </div>

                    )}

            </section>


            {/* ==================================================
                REDAÇÕES
            ================================================== */}

            <section className="redacoes">

                <div className="redacoesCabecalho">

                    <div>

                        <span>
                            REDAÇÕES
                        </span>

                        <h2>
                            Treine sua escrita
                        </h2>

                        <p>
                            Desenvolva sua argumentação, pratique temas
                            variados e acompanhe sua evolução na escrita.
                        </p>

                    </div>


                    <button
                        className="redacoesVerTodas"
                        onClick={abrirAreaRedacao}
                    >
                        Ver redações
                    </button>

                </div>


                <div className="redacoesConteudo">


                    {/* TEMA PRINCIPAL */}

                    <article className="redacaoDestaque">

                        <div className="redacaoDestaqueTopo">

                            <span>
                                TEMA EM DESTAQUE
                            </span>

                            <div className="redacaoNivel">
                                Médio
                            </div>

                        </div>


                        <div className="redacaoDestaqueConteudo">

                            <span className="redacaoTipo">
                                Dissertativo-argumentativo
                            </span>

                            <h3>
                                Os impactos da tecnologia
                                na educação contemporânea
                            </h3>

                            <p>
                                Reflita sobre como o avanço das tecnologias
                                digitais tem transformado a forma de ensinar,
                                aprender e acessar conhecimento.
                            </p>

                        </div>


                        <div className="redacaoDestaqueRodape">

                            <div>

                                <span>
                                    VALOR
                                </span>

                                <strong>
                                    +150 XP
                                </strong>

                            </div>


                            <button
                                onClick={abrirAreaRedacao}
                            >
                                Começar redação
                            </button>

                        </div>

                    </article>


                    {/* LADO DIREITO */}

                    <div className="redacoesResumo">


                        <article className="redacaoResumoCard">

                            <div className="redacaoResumoIcone">

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >

                                    <path
                                        d="M4 19.5V5a2 2 0 0 1 2-2h11"
                                    />

                                    <path
                                        d="M8 7h8"
                                    />

                                    <path
                                        d="M8 11h8"
                                    />

                                    <path
                                        d="M8 15h5"
                                    />

                                </svg>

                            </div>


                            <div>

                                <span>
                                    MINHAS REDAÇÕES
                                </span>

                                <h3>
                                    Seu histórico de escrita
                                </h3>

                                <p>
                                    Consulte redações enviadas,
                                    notas e feedbacks anteriores.
                                </p>

                            </div>


                            <button
                                onClick={abrirAreaRedacao}
                            >
                                Ver histórico
                            </button>

                        </article>


                        <article className="redacaoResumoCard">

                            <div className="redacaoResumoIcone">

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >

                                    <path
                                        d="M12 20h9"
                                    />

                                    <path
                                        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
                                    />

                                </svg>

                            </div>


                            <div>

                                <span>
                                    RASCUNHOS
                                </span>

                                <h3>
                                    Continue de onde parou
                                </h3>

                                <p>
                                    Salve suas ideias e termine
                                    sua redação quando quiser.
                                </p>

                            </div>


                            <button
                                onClick={abrirAreaRedacao}
                            >
                                Ver rascunhos
                            </button>

                        </article>

                    </div>

                </div>


                {/* COMO FUNCIONA */}

                <div className="redacoesPassos">

                    <div className="redacoesPasso">

                        <span>
                            01
                        </span>

                        <div>

                            <strong>
                                Escolha um tema
                            </strong>

                            <p>
                                Encontre uma proposta
                                que queira desenvolver.
                            </p>

                        </div>

                    </div>


                    <div className="redacoesPasso">

                        <span>
                            02
                        </span>

                        <div>

                            <strong>
                                Escreva
                            </strong>

                            <p>
                                Produza sua redação
                                diretamente pelo SimioLab.
                            </p>

                        </div>

                    </div>


                    <div className="redacoesPasso">

                        <span>
                            03
                        </span>

                        <div>

                            <strong>
                                Receba sua avaliação
                            </strong>

                            <p>
                                Veja sua nota, competências
                                e pontos para melhorar.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );

}

export default Simulados;