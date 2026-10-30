import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3000'

function tempoRelativo(data) {
    const agora = new Date()
    const dataPost = new Date(data)
    const diferenca = Math.max(0, agora - dataPost)

    const minutos = Math.floor(diferenca / 60000)

    if (minutos < 1) return 'agora'
    if (minutos < 60) return `há ${minutos} min`

    const horas = Math.floor(minutos / 60)

    if (horas < 24) return `há ${horas} h`

    return `há ${Math.floor(horas / 24)} d`
}

function Avatar({ foto, nome }) {
    const iniciais = (nome || 'SL')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0])
        .join('')
        .toUpperCase()

    return (
        <div className="feed-avatar">
            {foto ? (
                <img
                    src={foto}
                    alt={`Foto de ${nome}`}
                />
            ) : (
                <span>{iniciais}</span>
            )}
        </div>
    )
}

function FeedDetalhe({ idPost, aoFechar, aoAtualizar }) {
    const [post, setPost] = useState(null)
    const [comentarios, setComentarios] = useState([])
    const [comentario, setComentario] = useState('')
    const [carregando, setCarregando] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [acaoEmAndamento, setAcaoEmAndamento] = useState(false)
    const [permissaoCarregada, setPermissaoCarregada] =
        useState(false)
    const [ehAdmin, setEhAdmin] = useState(false)
    const [erro, setErro] = useState('')

    function cabecalhos() {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }

    async function carregarPermissao() {
        try {
            const resposta = await fetch(`${API_URL}/perfil`, {
                headers: cabecalhos()
            })

            const dados = await resposta.json()

            if (!resposta.ok || !dados.ok) {
                throw new Error(
                    dados.erro ||
                        dados.message ||
                        'Não foi possível verificar a permissão.'
                )
            }

            setEhAdmin(Number(dados.usuario?.adm) === 1)
        } catch (erroAtual) {
            console.error(
                'Erro ao verificar administrador:',
                erroAtual
            )

            setEhAdmin(false)
        } finally {
            setPermissaoCarregada(true)
        }
    }

    async function carregarPost() {
        setCarregando(true)
        setErro('')

        try {
            const resposta = await fetch(
                `${API_URL}/feed/post?id_post=${idPost}`,
                {
                    headers: cabecalhos()
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                        'Não foi possível abrir o post.'
                )
            }

            setPost(dados.post)
            setComentarios(dados.comentarios || [])
        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setCarregando(false)
        }
    }

    useEffect(() => {
        carregarPost()
        carregarPermissao()
    }, [idPost])

    async function enviarComentario(event) {
        event.preventDefault()

        if (!comentario.trim()) {
            return
        }

        setEnviando(true)
        setErro('')

        try {
            const resposta = await fetch(
                `${API_URL}/feed/comentarios`,
                {
                    method: 'POST',
                    headers: cabecalhos(),
                    body: JSON.stringify({
                        id_post: idPost,
                        conteudo: comentario
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                        'Não foi possível enviar o comentário.'
                )
            }

            setComentario('')

            await carregarPost()
            await aoAtualizar()
        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setEnviando(false)
        }
    }

    async function votar(tipo) {
        try {
            const resposta = await fetch(
                `${API_URL}/feed/voto`,
                {
                    method: 'POST',
                    headers: cabecalhos(),
                    body: JSON.stringify({
                        id_post: idPost,
                        tipo
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                        'Não foi possível registrar o voto.'
                )
            }

            await carregarPost()
            await aoAtualizar()
        } catch (erroAtual) {
            setErro(erroAtual.message)
        }
    }

    async function denunciarConteudo({
        idPostDenunciado = null,
        idComentario = null
    }) {
        const motivoInformado = window.prompt(
            'Informe o motivo da denúncia:\n\n' +
                'ofensivo\n' +
                'spam\n' +
                'informacao_errada\n' +
                'outro'
        )

        if (motivoInformado === null) {
            return
        }

        const motivo = motivoInformado
            .trim()
            .toLowerCase()
            .replaceAll(' ', '_')

        const motivosPermitidos = [
            'ofensivo',
            'spam',
            'informacao_errada',
            'outro'
        ]

        if (!motivosPermitidos.includes(motivo)) {
            window.alert(
                'Motivo inválido. Use ofensivo, spam, informacao_errada ou outro.'
            )

            return
        }

        const descricaoInformada = window.prompt(
            'Descreva o problema. Esta parte é opcional.'
        )

        if (descricaoInformada === null) {
            return
        }

        setAcaoEmAndamento(true)
        setErro('')

        try {
            const resposta = await fetch(
                `${API_URL}/feed/denuncias`,
                {
                    method: 'POST',
                    headers: cabecalhos(),
                    body: JSON.stringify({
                        id_post: idPostDenunciado,
                        id_comentario: idComentario,
                        motivo,
                        descricao: descricaoInformada
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                        'Não foi possível enviar a denúncia.'
                )
            }

            window.alert(
                'Denúncia enviada. Um administrador poderá analisar o conteúdo.'
            )
        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setAcaoEmAndamento(false)
        }
    }

    async function ocultarConteudo(tipo, id) {
        const nomeConteudo =
            tipo === 'post' ? 'esta publicação' : 'este comentário'

        const confirmou = window.confirm(
            `Deseja realmente ocultar ${nomeConteudo}?`
        )

        if (!confirmou) {
            return
        }

        setAcaoEmAndamento(true)
        setErro('')

        try {
            const resposta = await fetch(
                `${API_URL}/feed/ocultar`,
                {
                    method: 'POST',
                    headers: cabecalhos(),
                    body: JSON.stringify({
                        tipo,
                        id
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro ||
                        'Não foi possível ocultar o conteúdo.'
                )
            }

            await aoAtualizar()

            if (tipo === 'post') {
                aoFechar()
                return
            }

            await carregarPost()
        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setAcaoEmAndamento(false)
        }
    }

    return (
        <div
            className="feed-detail-backdrop"
            onMouseDown={aoFechar}
        >
            <section
                className="feed-detail"
                onMouseDown={event => event.stopPropagation()}
            >
                <header className="feed-detail-header">
                    <span>PUBLICAÇÃO</span>

                    <button
                        type="button"
                        onClick={aoFechar}
                        aria-label="Fechar post"
                    >
                        ×
                    </button>
                </header>

                {carregando ? (
                    <div className="feed-detail-state">
                        <span className="feed-loader" />
                        <p>Carregando publicação...</p>
                    </div>
                ) : erro && !post ? (
                    <div className="feed-detail-state">
                        <p>{erro}</p>
                    </div>
                ) : (
                    <>
                        {erro && (
                            <div className="feed-error">
                                {erro}
                            </div>
                        )}

                        <article className="feed-detail-post">
                            <div className="feed-votes">
                                <button
                                    className={
                                        post.meu_voto === 'positivo'
                                            ? 'active positive'
                                            : ''
                                    }
                                    type="button"
                                    onClick={() => votar('positivo')}
                                    aria-label="Voto positivo"
                                >
                                    ▲
                                </button>

                                <strong>{post.pontuacao}</strong>

                                <button
                                    className={
                                        post.meu_voto === 'negativo'
                                            ? 'active negative'
                                            : ''
                                    }
                                    type="button"
                                    onClick={() => votar('negativo')}
                                    aria-label="Voto negativo"
                                >
                                    ▼
                                </button>
                            </div>

                            <div className="feed-detail-body">
                                <div className="feed-post-meta">
                                    <Avatar
                                        foto={post.foto_perfil}
                                        nome={post.nome_de_exibicao}
                                    />

                                    <span>
                                        <strong>
                                            {post.nome_de_exibicao}
                                        </strong>

                                        <small>
                                            @{post.nome_de_usuario}
                                        </small>
                                    </span>

                                    <i />

                                    <span
                                        className="feed-post-community"
                                        style={{
                                            '--community-color':
                                                post.comunidade_cor
                                        }}
                                    >
                                        {post.comunidade_nome}
                                    </span>

                                    <time>
                                        {tempoRelativo(
                                            post.criado_em
                                        )}
                                    </time>
                                </div>

                                <h1>{post.titulo}</h1>

                                <p>{post.conteudo}</p>

                                {permissaoCarregada && (
                                    <div className="feed-moderation-actions">
                                        {ehAdmin ? (
                                            <button
                                                className="feed-action-hide"
                                                type="button"
                                                disabled={
                                                    acaoEmAndamento
                                                }
                                                onClick={() => {
                                                    ocultarConteudo(
                                                        'post',
                                                        post.id_post
                                                    )
                                                }}
                                            >
                                                Ocultar publicação
                                            </button>
                                        ) : (
                                            <button
                                                className="feed-action-report"
                                                type="button"
                                                disabled={
                                                    acaoEmAndamento
                                                }
                                                onClick={() => {
                                                    denunciarConteudo({
                                                        idPostDenunciado:
                                                            post.id_post
                                                    })
                                                }}
                                            >
                                                Denunciar publicação
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </article>

                        <section className="feed-comments">
                            <h2>
                                {comentarios.length} comentário
                                {comentarios.length === 1 ? '' : 's'}
                            </h2>

                            <form
                                className="feed-comment-form"
                                onSubmit={enviarComentario}
                            >
                                <textarea
                                    value={comentario}
                                    maxLength="3000"
                                    onChange={event => {
                                        setComentario(
                                            event.target.value
                                        )
                                    }}
                                    placeholder="Escreva uma resposta útil..."
                                />

                                <button
                                    type="submit"
                                    disabled={enviando}
                                >
                                    {enviando
                                        ? 'Enviando...'
                                        : 'Comentar'}
                                </button>
                            </form>

                            <div className="feed-comments-list">
                                {comentarios.length === 0 ? (
                                    <p className="feed-no-comments">
                                        Ainda não há comentários. Comece a conversa.
                                    </p>
                                ) : (
                                    comentarios.map(item => (
                                        <article
                                            className="feed-comment"
                                            key={item.id_comentario}
                                        >
                                            <Avatar
                                                foto={
                                                    item.foto_perfil
                                                }
                                                nome={
                                                    item.nome_de_exibicao
                                                }
                                            />

                                            <div className="feed-comment-content">
                                                <header>
                                                    <strong>
                                                        {
                                                            item.nome_de_exibicao
                                                        }
                                                    </strong>

                                                    <small>
                                                        @
                                                        {
                                                            item.nome_de_usuario
                                                        }
                                                    </small>

                                                    <time>
                                                        {tempoRelativo(
                                                            item.criado_em
                                                        )}
                                                    </time>
                                                </header>

                                                <p>{item.conteudo}</p>

                                                {permissaoCarregada && (
                                                    <div className="feed-moderation-actions">
                                                        {ehAdmin ? (
                                                            <button
                                                                className="feed-action-hide"
                                                                type="button"
                                                                disabled={
                                                                    acaoEmAndamento
                                                                }
                                                                onClick={() => {
                                                                    ocultarConteudo(
                                                                        'comentario',
                                                                        item.id_comentario
                                                                    )
                                                                }}
                                                            >
                                                                Ocultar comentário
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="feed-action-report"
                                                                type="button"
                                                                disabled={
                                                                    acaoEmAndamento
                                                                }
                                                                onClick={() => {
                                                                    denunciarConteudo(
                                                                        {
                                                                            idComentario:
                                                                                item.id_comentario
                                                                        }
                                                                    )
                                                                }}
                                                            >
                                                                Denunciar comentário
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}
            </section>
        </div>
    )
}

export default FeedDetalhe