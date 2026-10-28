import { useEffect, useState } from "react"
import "./RedacoesReferencia.css"

function RedacoesReferencia() {
    const [referencias, setReferencias] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState("")
    const [modeloAberto, setModeloAberto] = useState(null)

    useEffect(() => {
        buscarReferencias()
    }, [])

    async function buscarReferencias() {
        try {
            setCarregando(true)
            setErro("")

            const resposta = await fetch(
                "http://localhost:3000/redacoes/referencias"
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro || "Não foi possível buscar as redações."
                )
            }

            setReferencias(dados.referencias || [])
        } catch (error) {
            setErro(error.message)
        } finally {
            setCarregando(false)
        }
    }

    function abrirModelo(referencia) {
        setModeloAberto(referencia)
    }

    return (
        <section className="referenciasSecao">
            <div className="simuladosTituloSecao">
                <div>
                    <span>REDAÇÕES MODELO</span>
                    <h2>Inspire-se em redações de referência</h2>
                    <p>
                        Leia textos cadastrados pela equipe e observe formas de
                        organizar os argumentos.
                    </p>
                </div>
            </div>

            {carregando && (
                <p>Carregando redações de referência...</p>
            )}

            {!carregando && erro && (
                <p>{erro}</p>
            )}

            {!carregando && !erro && referencias.length === 0 && (
                <p>
                    Ainda não há redações de referência cadastradas.
                </p>
            )}

            {!carregando && !erro && referencias.length > 0 && (
                <div className="referenciasGrade">
                    {referencias.map(referencia => {
                        const resumo = referencia.conteudo
                            ? `${referencia.conteudo.slice(0, 160)}...`
                            : ""

                        return (
                            <article
                                key={referencia.id_referencia}
                                className="referenciaCard"
                            >
                                <div className="referenciaCardTopo">
                                    {referencia.fonte && (
                                        <span className="referenciaBanca">
                                            {referencia.fonte}
                                        </span>
                                    )}

                                    {referencia.nota_total !== null && (
                                        <span className="referenciaNota">
                                            Nota {referencia.nota_total}
                                        </span>
                                    )}
                                </div>

                                <div className="referenciaCardCorpo">
                                    <small className="referenciaTemaLabel">
                                        Tema: {referencia.tema}
                                    </small>

                                    <h3>{referencia.titulo}</h3>

                                    <p className="referenciaTrecho">
                                        “{resumo}”
                                    </p>
                                </div>

                                <button
                                    className="referenciaBotaoLer"
                                    onClick={() =>
                                        abrirModelo(referencia)
                                    }
                                >
                                    <span>Ler redação completa</span>
                                    <span>→</span>
                                </button>
                            </article>
                        )
                    })}
                </div>
            )}

            {modeloAberto && (
                <div
                    className="referenciaModalFundo"
                    onClick={() => setModeloAberto(null)}
                >
                    <div
                        className="referenciaModalCaixa"
                        onClick={event => event.stopPropagation()}
                    >
                        <header className="referenciaModalTopo">
                            <div>
                                <span className="referenciaNotaDestaque">
                                    {modeloAberto.nota_total !== null
                                        ? `NOTA ${modeloAberto.nota_total}`
                                        : "MODELO DE REFERÊNCIA"}
                                </span>

                                <h3>{modeloAberto.titulo}</h3>

                                <p>
                                    Tema: {modeloAberto.tema}
                                    {modeloAberto.autor &&
                                        ` • Autora: ${modeloAberto.autor}`}
                                </p>
                            </div>

                            <button
                                className="referenciaBotaoFechar"
                                onClick={() => setModeloAberto(null)}
                            >
                                ✕
                            </button>
                        </header>

                        {modeloAberto.anotacoes && (
                            <div className="referenciaDicaMoki">
                                <span>🐵</span>

                                <p>
                                    <strong>Olhar do Moki:</strong>{" "}
                                    {modeloAberto.anotacoes}
                                </p>
                            </div>
                        )}

                        <div className="referenciaTextoCompleto">
                            {modeloAberto.conteudo
                                .split("\n\n")
                                .map((paragrafo, index) => (
                                    <p key={index}>{paragrafo}</p>
                                ))}
                        </div>

                        <footer className="referenciaModalRodape">
                            <button onClick={() => setModeloAberto(null)}>
                                Fechar leitura
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </section>
    )
}

export default RedacoesReferencia