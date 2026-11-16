import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3000'

const nomesMotivos = {
    ofensivo: 'Conteúdo ofensivo',
    spam: 'Spam',
    informacao_errada: 'Informação errada',
    outro: 'Outro motivo'
}

function tempoRelativo(data) {
    const agora = new Date()
    const dataDenuncia = new Date(data)
    const diferenca = Math.max(0, agora - dataDenuncia)

    const minutos = Math.floor(diferenca / 60000)

    if (minutos < 1) return 'agora'
    if (minutos < 60) return `há ${minutos} min`

    const horas = Math.floor(minutos / 60)

    if (horas < 24) return `há ${horas} h`

    return `há ${Math.floor(horas / 24)} d`
}

function FeedModeracao({ aoFechar, aoAtualizarFeed }) {
    const [denuncias, setDenuncias] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [resolvendo, setResolvendo] = useState(null)
    const [erro, setErro] = useState('')

    function cabecalhos() {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }

    async function carregarDenuncias() {
        setCarregando(true)
        setErro('')

        try {
            const resposta = await fetch(
                `${API_URL}/feed/denuncias`,
                {
                    headers: cabecalhos()
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                        'Não foi possível carregar as denúncias.'
                )
            }

            setDenuncias(dados.denuncias || [])
        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setCarregando(false)
        }
    }

    useEffect(() => {
        carregarDenuncias()
    }, [])

    async function resolverDenuncia(denuncia, acao) {
        if (acao === 'ocultar') {
            const tipo =
                denuncia.tipo_conteudo === 'post'
                    ? 'a publicação'
                    : 'o comentário'

            const confirmou = window.confirm(
                `Deseja ocultar ${tipo} denunciado?`
            )

            if (!confirmou) {
                return
            }
        }

        setResolvendo(denuncia.id_denuncia)
        setErro('')

        try {
            const resposta = await fetch(
                `${API_URL}/feed/denuncias/resolver`,
                {
                    method: 'POST',
                    headers: cabecalhos(),
                    body: JSON.stringify({
                        id_denuncia: denuncia.id_denuncia,
                        acao
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                        'Não foi possível resolver a denúncia.'
                )
            }

            setDenuncias(denunciasAtuais =>
                denunciasAtuais.filter(item => {
                    if (acao === 'ignorar') {
                        return (
                            item.id_denuncia !==
                            denuncia.id_denuncia
                        )
                    }

                    if (denuncia.id_post) {
                        return item.id_post !== denuncia.id_post
                    }

                    return (
                        item.id_comentario !==
                        denuncia.id_comentario
                    )
                })
            )

            if (acao === 'ocultar') {
                await aoAtualizarFeed()
            }
        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setResolvendo(null)
        }
    }

    return (
        <div
            className="feed-moderation-backdrop"
            onMouseDown={aoFechar}
        >
            <section
                className="feed-moderation-panel"
                onMouseDown={event => event.stopPropagation()}
            >
                <header className="feed-moderation-header">
                    <div>
                        <span>ADMINISTRAÇÃO</span>
                        <h2>Denúncias do feed</h2>

                        <p>
                            Analise conteúdos denunciados pela comunidade.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={aoFechar}
                        aria-label="Fechar moderação"
                    >
                        ×
                    </button>
                </header>

                {erro && (
                    <div className="feed-error">
                        {erro}
                    </div>
                )}

                {carregando ? (
                    <div className="feed-moderation-state">
                        <span className="feed-loader" />
                        <p>Carregando denúncias...</p>
                    </div>
                ) : denuncias.length === 0 ? (
                    <div className="feed-moderation-state">
                        <span className="feed-moderation-empty-icon">
                            ✓
                        </span>

                        <h3>Nenhuma denúncia pendente</h3>

                        <p>
                            A comunidade está tranquila por enquanto.
                        </p>
                    </div>
                ) : (
                    <div className="feed-reports-list">
                        {denuncias.map(denuncia => (
                            <article
                                className="feed-report"
                                key={denuncia.id_denuncia}
                            >
                                <div className="feed-report-top">
                                    <span
                                        className={`feed-report-type feed-report-type--${denuncia.tipo_conteudo}`}
                                    >
                                        {denuncia.tipo_conteudo ===
                                        'post'
                                            ? 'Publicação'
                                            : 'Comentário'}
                                    </span>

                                    <time>
                                        {tempoRelativo(
                                            denuncia.criada_em
                                        )}
                                    </time>
                                </div>

                                <div className="feed-report-reason">
                                    <span>Motivo</span>

                                    <strong>
                                        {nomesMotivos[
                                            denuncia.motivo
                                        ] || denuncia.motivo}
                                    </strong>
                                </div>

                                {denuncia.descricao && (
                                    <p className="feed-report-description">
                                        “{denuncia.descricao}”
                                    </p>
                                )}

                                <div className="feed-report-content">
                                    <span>
                                        CONTEÚDO DENUNCIADO
                                    </span>

                                    {denuncia.tipo_conteudo ===
                                        'post' && (
                                        <h3>
                                            {
                                                denuncia.titulo_conteudo
                                            }
                                        </h3>
                                    )}

                                    <p>{denuncia.conteudo}</p>

                                    <small>
                                        Publicado por{' '}
                                        <strong>
                                            {denuncia.autor_nome}
                                        </strong>{' '}
                                        @{denuncia.autor_usuario}
                                    </small>
                                </div>

                                <div className="feed-report-user">
                                    Denunciado por{' '}
                                    <strong>
                                        {
                                            denuncia.denunciante_nome
                                        }
                                    </strong>{' '}
                                    @{denuncia.denunciante_usuario}
                                </div>

                                <div className="feed-report-actions">
                                    <button
                                        className="feed-report-ignore"
                                        type="button"
                                        disabled={
                                            resolvendo ===
                                            denuncia.id_denuncia
                                        }
                                        onClick={() => {
                                            resolverDenuncia(
                                                denuncia,
                                                'ignorar'
                                            )
                                        }}
                                    >
                                        Ignorar
                                    </button>

                                    <button
                                        className="feed-report-hide"
                                        type="button"
                                        disabled={
                                            resolvendo ===
                                            denuncia.id_denuncia
                                        }
                                        onClick={() => {
                                            resolverDenuncia(
                                                denuncia,
                                                'ocultar'
                                            )
                                        }}
                                    >
                                        {resolvendo ===
                                        denuncia.id_denuncia
                                            ? 'Processando...'
                                            : 'Ocultar conteúdo'}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default FeedModeracao