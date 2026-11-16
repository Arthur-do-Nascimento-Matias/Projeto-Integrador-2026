import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import "../Biblioteca/Biblioteca.css";
import "./Biblioteca.css";
import "../estadoCatalogo.css";
import {
    registrarLivroAberto,
    registrarVisitaBiblioteca,
    registrarLeitura
} from "../utils/missoes";

import miroBiblioteca from '../../assets/Miro/miro-biblioteca.png';

function normalizarBusca(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

const titulosAlternativos = {
    "a alegoria da caverna": ["O Mito da Caverna"],
    "o mito da caverna": ["A Alegoria da Caverna"],
};

function Biblioteca() {
    const [capas, setCapas] = useState([]);
    const [busca, setBusca] = useState("");
    const [estado, setEstado] = useState("carregando");

    async function carregarLivros() {
        setEstado("carregando");
        try {
            const resposta = await fetch("http://localhost:3000/livros", { signal: AbortSignal.timeout(20000) });
            if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
            const dados = await resposta.json();
            if (!Array.isArray(dados)) throw new Error("Resposta de livros inválida.");
            setCapas(dados);
            setEstado("pronto");
        } catch (erro) {
            console.error("Erro ao carregar os livros:", erro);
            setEstado("erro");
        }
    }

    useEffect(() => {
        registrarVisitaBiblioteca()
            .catch((erro) => {
                console.error(
                    "Erro ao registrar visita à biblioteca:",
                    erro
                );
            });

        apiFetch("/livros")
            .then((resp) => resp.json())
            .then((data) => {
                setCapas(data);
            })
            .catch((erro) => {
                console.error("Erro ao carregar os livros:", erro);
            });
    }, []);
    function abrirLivro(id) {
        const novaAba = window.open(
            `/abrirLivro?id=${id}`,
            "_blank"
        );

        if (!novaAba) return;

        novaAba.opener = null;

        registrarLivroAberto(id)
            .catch((erro) => {
                console.error(
                    "Erro ao registrar livro aberto:",
                    erro
                );
            });

        const sessaoLeitura = crypto.randomUUID();
        let pulso = 0;

        registrarLeitura(sessaoLeitura, pulso)
            .catch((erro) => {
                console.error(
                    "Erro ao iniciar leitura:",
                    erro
                );
            });

        const acompanhamento = setInterval(() => {
            if (novaAba.closed) {
                clearInterval(acompanhamento);
                return;
            }

            pulso += 1;

            registrarLeitura(
                sessaoLeitura,
                pulso
            ).catch((erro) => {
                console.error(
                    "Erro ao registrar tempo de leitura:",
                    erro
                );
            });

        }, 15000);
    }

    const termoBusca = normalizarBusca(busca);

    const livrosFiltrados = capas.filter((capa) => {
        const titulo = normalizarBusca(capa.titulo);

        const alternativas = titulosAlternativos[titulo] || [];

        return [
            capa.titulo,
            capa.autorLivro,
            ...alternativas,
        ].some((texto) =>
            normalizarBusca(texto).includes(termoBusca)
        );
    });

    return (
        <div className="container">

            {/* ========================================
                CABEÇALHO
            ======================================== */}

            <div className="biblioteca-header">

                <div className="biblioteca-marca">
                    <div className="biblioteca-miro-wrap">
                        <img className="biblioteca-miro" src={miroBiblioteca} alt="Miro" />
                        <span className="biblioteca-miro-nome" aria-hidden="true">Miro</span>
                    </div>
                    <div className="biblioteca-identidade">
                        <span className="biblioteca-label">ACERVO</span>
                        <h1>Biblioteca</h1>

                    </div>

                </div>


                <div className="biblioteca-header-direita">

                    <div className="biblioteca-busca">

                        <svg
                            className="busca-icone"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="M20 20L16.5 16.5" />
                        </svg>

                        <input
                            type="text"
                            placeholder="Buscar na biblioteca"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />

                    </div>


                    {estado === "pronto" && (
                        <span className="biblioteca-quantidade">
                            {livrosFiltrados.length} {livrosFiltrados.length === 1 ? "livro" : "livros"}
                        </span>
                    )}

                </div>

            </div>


            {/* ========================================
                CONTEÚDO
            ======================================== */}

            <div className="biblioteca-conteudo">

                <div className="biblioteca-secao-topo">

                    <div className="secao-identidade">

                        <span className="secao-marcador"></span>

                    </div>

                    <div className="biblioteca-linha"></div>

                </div>


                {/* ========================================
                    LIVROS
                ======================================== */}

                {estado === "carregando" && (
                    <>
                        <p className="catalogo-estado" role="status">Carregando livros…</p>
                        <div className="capas" aria-hidden="true">
                            {[1, 2, 3].map((item) => (
                                <div className="livro" key={item}>
                                    <div className="livro-capa-wrap catalogo-esqueleto" />
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {estado === "erro" && (
                    <div className="catalogo-estado">
                        <p role="alert">Não conseguimos carregar os livros.</p>
                        <button type="button" onClick={carregarLivros}>Tentar novamente</button>
                    </div>
                )}

                {estado === "pronto" && livrosFiltrados.length === 0 && (
                    <div className="catalogo-estado">
                        <p role="status">
                            {capas.length ? "Nenhum livro encontrado." : "Ainda não há livros no acervo."}
                        </p>
                        {capas.length > 0 && (
                            <button type="button" onClick={() => setBusca("")}>Limpar busca</button>
                        )}
                    </div>
                )}

                {estado === "pronto" && livrosFiltrados.length > 0 && (
                    <div className="capas">

                        {livrosFiltrados.map((capa) => (

                            <div
                                className="livro"
                                key={capa.id}
                            >

                                <div
                                    className="livro-capa-wrap"
                                    onClick={() => abrirLivro(capa.id)}
                                >

                                    <img
                                        id={capa.id}
                                        className="capa"
                                        src={`data:image/jpeg;base64,${capa.img}`}
                                        alt={`Capa do livro ${capa.id}`}
                                    />


                                    <div className="livro-acao">

                                        <span>
                                            Abrir livro
                                        </span>

                                    </div>

                                </div>



                                <div className="livro-prateleira">

                                    <div className="prateleira-luz"></div>

                                    <div className="prateleira-frente"></div>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Biblioteca;
