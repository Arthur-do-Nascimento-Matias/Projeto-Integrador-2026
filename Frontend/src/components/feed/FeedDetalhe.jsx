import { createPortal } from "react-dom"
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3000'

const MOTIVOS_DENUNCIA = [
    { valor: 'ofensivo', nome: 'Conteúdo ofensivo ou discriminatório' },
    { valor: 'spam', nome: 'Spam ou propaganda' },
    { valor: 'informacao_errada', nome: 'Informações falsas' },
    { valor: 'outro', nome: 'Outro motivo' }
]

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

    const [denunciaAberta, setDenunciaAberta] = useState(null)
    const [motivoDenuncia, setMotivoDenuncia] = useState('')
    const [descricaoDenuncia, setDescricaoDenuncia] = useState('')
    const [erroDenuncia, setErroDenuncia] = useState('')
    const [denunciaEnviada, setDenunciaEnviada] = useState(false)

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

    function abrirDenuncia({
        idPostDenunciado = null,
        idComentario = null
    }) {
        setDenunciaAberta({
            idPostDenunciado,
            idComentario
        })

        setMotivoDenuncia('')
        setDescricaoDenuncia('')
        setErroDenuncia('')
        setDenunciaEnviada(false)
    }

    function fecharDenuncia() {
        if (!acaoEmAndamento) {
            setDenunciaAberta(null)
        }
    }

    async function enviarDenuncia(event) {
        event.preventDefault()

        if (
            !denunciaAberta ||
            !motivoDenuncia ||
            acaoEmAndamento
        ) {
            return
        }

        setAcaoEmAndamento(true)
        setErroDenuncia('')

        try {
            const resposta = await fetch(
                `${API_URL}/feed/denuncias`,
                {
                    method: 'POST',
                    headers: cabecalhos(),
                    body: JSON.stringify({
                        id_post: denunciaAberta.idPostDenunciado,
                        id_comentario: denunciaAberta.idComentario,
                        motivo: motivoDenuncia,
                        descricao: descricaoDenuncia.trim()
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

            setDenunciaEnviada(true)

        } catch (erroAtual) {
            setErroDenuncia(erroAtual.message)
        } finally {
            setAcaoEmAndamento(false)
        }
    }

    async function ocultarConteudo(tipo, id) {
        const nomeConteudo =
            tipo === 'post'
                ? 'esta publicação'
                : 'este comentário'

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

    return createPortal(
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
                                        {tempoRelativo(post.criado_em)}
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
                                                disabled={acaoEmAndamento}
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
                                                disabled={acaoEmAndamento}
                                                onClick={() => {
                                                    abrirDenuncia({
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
                                        Ainda não há comentários.
                                        Comece a conversa.
                                    </p>
                                ) : (
                                    comentarios.map(item => (
                                        <article
                                            className="feed-comment"
                                            key={item.id_comentario}
                                        >
                                            <Avatar
                                                foto={item.foto_perfil}
                                                nome={item.nome_de_exibicao}
                                            />

                                            <div className="feed-comment-content">
                                                <header>
                                                    <strong>
                                                        {item.nome_de_exibicao}
                                                    </strong>

                                                    <small>
                                                        @{item.nome_de_usuario}
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
                                                                disabled={acaoEmAndamento}
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
                                                                disabled={acaoEmAndamento}
                                                                onClick={() => {
                                                                    abrirDenuncia({
                                                                        idComentario:
                                                                            item.id_comentario
                                                                    })
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

            {denunciaAberta && (
                <div
                    className="feed-denuncia-backdrop"
                    onMouseDown={event => {
                        event.stopPropagation()

                        if (event.target === event.currentTarget) {
                            fecharDenuncia()
                        }
                    }}
                >
                    <section
                        className="feed-denuncia-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="feed-denuncia-titulo"
                        onMouseDown={event => event.stopPropagation()}
                        onKeyDown={event => {
                            if (event.key === 'Escape') {
                                event.stopPropagation()
                                fecharDenuncia()
                            }
                        }}
                    >
                        {denunciaEnviada ? (
                            <div
                                className="feed-denuncia-sucesso"
                                role="status"
                            >
                                <div
                                    className="feed-denuncia-sucesso-icone"
                                    aria-hidden="true"
                                >
                                    ✓
                                </div>

                                <h2 id="feed-denuncia-titulo">
                                    Denúncia enviada!
                                </h2>

                                <p>
                                    Obrigado por ajudar a manter
                                    a comunidade segura. Um
                                    administrador poderá analisar
                                    o conteúdo.
                                </p>

                                <button
                                    type="button"
                                    onClick={fecharDenuncia}
                                >
                                    Entendi
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={enviarDenuncia}>
                                <div className="feed-denuncia-cabecalho">
                                    <span
                                        className="feed-denuncia-icone"
                                        aria-hidden="true"
                                    >
                                        ⚑
                                    </span>

                                    <button
                                        type="button"
                                        className="feed-denuncia-fechar"
                                        onClick={fecharDenuncia}
                                        disabled={acaoEmAndamento}
                                        aria-label="Fechar denúncia"
                                    >
                                        ×
                                    </button>
                                </div>

                                <h2 id="feed-denuncia-titulo">
                                    Denunciar{' '}
                                    {denunciaAberta.idComentario
                                        ? 'comentário'
                                        : 'publicação'}
                                </h2>

                                <p className="feed-denuncia-intro">
                                    Por que você deseja denunciar
                                    este conteúdo? Sua denúncia
                                    será encaminhada para análise.
                                </p>

                                <fieldset className="feed-denuncia-motivos">
                                    <legend>
                                        Selecione um motivo
                                    </legend>

                                    {MOTIVOS_DENUNCIA.map(opcao => (
                                        <label
                                            key={opcao.valor}
                                            className="feed-denuncia-opcao"
                                        >
                                            <input
                                                type="radio"
                                                name="motivoDenuncia"
                                                value={opcao.valor}
                                                checked={
                                                    motivoDenuncia ===
                                                    opcao.valor
                                                }
                                                autoFocus={
                                                    opcao.valor ===
                                                    'ofensivo'
                                                }
                                                onChange={event =>
                                                    setMotivoDenuncia(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={acaoEmAndamento}
                                            />

                                            <span>{opcao.nome}</span>
                                        </label>
                                    ))}
                                </fieldset>

                                <label className="feed-denuncia-descricao">
                                    <span>
                                        Detalhes adicionais{' '}
                                        <small>(opcional)</small>
                                    </span>

                                    <textarea
                                        value={descricaoDenuncia}
                                        onChange={event =>
                                            setDescricaoDenuncia(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Conte um pouco mais sobre o problema..."
                                        maxLength={1000}
                                        disabled={acaoEmAndamento}
                                        rows={3}
                                    />
                                </label>

                                {erroDenuncia && (
                                    <p
                                        className="feed-denuncia-erro"
                                        role="alert"
                                    >
                                        {erroDenuncia}
                                    </p>
                                )}

                                <div className="feed-denuncia-acoes">
                                    <button
                                        type="button"
                                        className="feed-denuncia-cancelar"
                                        onClick={fecharDenuncia}
                                        disabled={acaoEmAndamento}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="feed-denuncia-enviar"
                                        disabled={
                                            !motivoDenuncia ||
                                            acaoEmAndamento
                                        }
                                    >
                                        {acaoEmAndamento
                                            ? 'Enviando...'
                                            : 'Enviar denúncia'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            )}
        </div>, 
        document.body
    )
}

export default FeedDetalhe
