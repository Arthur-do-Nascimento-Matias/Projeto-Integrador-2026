import { useState, useEffect } from "react";
import "../Biblioteca/Biblioteca.css";

function Biblioteca() {
    const [capas, setCapas] = useState([]);
    const [busca, setBusca] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/livros")
            .then((resp) => resp.json())
            .then((data) => {
                console.log(data);
                setCapas(data);
            })
            .catch((erro) => {
                console.error("Erro ao carregar os livros:", erro);
            });
    }, []);

    function abrirLivro(id) {
        window.open(
            `http://localhost:5000/abrirLivro?id=${id}`,
            "_blank"
        );
    }

    const livrosFiltrados = capas.filter((capa) =>
        String(capa.titulo || "")
            .toLowerCase()
            .includes(busca.toLowerCase()) ||

        String(capa.autorLivro || "")
            .toLowerCase()
            .includes(busca.toLowerCase())
    );

    return (
        <div className="container">

            {/* ========================================
                CABEÇALHO
            ======================================== */}

            <div className="biblioteca-header">

                <div className="biblioteca-identidade">

                    <span className="biblioteca-label">
                         ACERVO
                    </span>

                    <h1>
                        Biblioteca
                    </h1>

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


                    <span className="biblioteca-quantidade">
                        {livrosFiltrados.length}

                        {livrosFiltrados.length === 1
                            ? " livro"
                            : " livros"}
                    </span>

                </div>

            </div>


            {/* ========================================
                CONTEÚDO
            ======================================== */}

            <div className="biblioteca-conteudo">

                <div className="biblioteca-secao-topo">

                    <div className="secao-identidade">

                        <span className="secao-marcador"></span>

                        <h2>
                            Todos os livros
                        </h2>

                    </div>

                    <div className="biblioteca-linha"></div>

                </div>


                {/* ========================================
                    LIVROS
                ======================================== */}

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

            </div>

        </div>
    );
}

export default Biblioteca;