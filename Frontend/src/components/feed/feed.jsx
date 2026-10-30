import { useEffect, useState } from 'react'

import FeedDetalhe from './FeedDetalhe'
import FeedLateral from './FeedLateral'
import FeedModeracao from './FeedModeracao'

import './Feed.css'

const API_URL = 'http://localhost:3000'

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

function tempoRelativo(data) {
    const agora = new Date()
    const dataPost = new Date(data)
    const diferenca = Math.max(0, agora - dataPost)

    const minutos = Math.floor(diferenca / 60000)

    if (minutos < 1) return 'agora'
    if (minutos < 60) return `há ${minutos} min`

    const horas = Math.floor(minutos / 60)

    if (horas < 24) return `há ${horas} h`

    const dias = Math.floor(horas / 24)

    return `há ${dias} d`
}

function Feed() {
    const [comunidades, setComunidades] = useState([])
    const [posts, setPosts] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')
    const [comunidadeAtiva, setComunidadeAtiva] = useState('')
    const [ordem, setOrdem] = useState('recentes')
    const [criandoPost, setCriandoPost] = useState(false)
    const [publicando, setPublicando] = useState(false)
    const [titulo, setTitulo] = useState('')
    const [conteudo, setConteudo] = useState('')
    const [comunidadePost, setComunidadePost] = useState('')
   const [postAberto, setPostAberto] = useState(() => {
    const id = Number(new URLSearchParams(window.location.search).get('post'))
    return Number.isSafeInteger(id) && id > 0 ? id : null
})

    const [ehAdmin, setEhAdmin] = useState(false)
    const [moderacaoAberta, setModeracaoAberta] = useState(false)

    function cabecalhos() {
        const token = localStorage.getItem('token')

        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }

    async function carregarComunidades() {
        const resposta = await fetch(
            `${API_URL}/comunidades`,
            {
                headers: cabecalhos()
            }
        )

        const dados = await resposta.json()

        if (!resposta.ok) {
            throw new Error(
                dados.erro || 'Não foi possível carregar as comunidades.'
            )
        }

        setComunidades(dados.comunidades || [])

        if (!comunidadePost && dados.comunidades?.length) {
            setComunidadePost(
                String(dados.comunidades[0].id_comunidade)
            )
        }
    }

    async function carregarPosts() {
        setCarregando(true)
        setErro('')

        try {
            const params = new URLSearchParams()

            if (comunidadeAtiva) {
                params.set('comunidade', comunidadeAtiva)
            }

            if (ordem === 'emAlta') {
                params.set('ordem', 'emAlta')
            }

            const sufixo = params.toString()
                ? `?${params.toString()}`
                : ''

            const resposta = await fetch(
                `${API_URL}/feed${sufixo}`,
                {
                    headers: cabecalhos()
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro || 'Não foi possível carregar o feed.'
                )
            }

            setPosts(dados.posts || [])

        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setCarregando(false)
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
    }
}

useEffect(() => {
    carregarComunidades().catch(erroAtual => {
        setErro(erroAtual.message)
    })

    carregarPermissao()
}, [])

    useEffect(() => {
        carregarPosts()
    }, [comunidadeAtiva, ordem])

    async function publicarPost(event) {
        event.preventDefault()

        if (!titulo.trim() || !conteudo.trim() || !comunidadePost) {
            return
        }

        setPublicando(true)
        setErro('')

        try {
            const resposta = await fetch(
                `${API_URL}/feed`,
                {
                    method: 'POST',
                    headers: cabecalhos(),
                    body: JSON.stringify({
                        id_comunidade: Number(comunidadePost),
                        titulo,
                        conteudo
                    })
                }
            )

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(
                    dados.erro || 'Não foi possível publicar o post.'
                )
            }

            setTitulo('')
            setConteudo('')
            setCriandoPost(false)

            await carregarPosts()

        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setPublicando(false)
        }
    }

    async function votarPost(idPost, tipo) {
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
                    dados.erro || 'Não foi possível registrar o voto.'
                )
            }

            await carregarPosts()

        } catch (erroAtual) {
            setErro(erroAtual.message)
        }
    }

    return (
        <main className="feed-page">
            <div className="feed-layout">
            <section className="feed-content">
                <header className="feed-header">
                    <div>
                        <span className="feed-kicker">
                            COMUNIDADE SIMIOLAB
                        </span>

                        <h1>
                            Aprenda junto. <em>Compartilhe.</em>
                        </h1>

                        <p>
                            Tire dúvidas, ajude a turma e descubra conteúdos novos.
                        </p>
                    </div>

                    <div className="feed-header-actions">
    {ehAdmin && (
        <button
            className="feed-admin-button"
            type="button"
            onClick={() => setModeracaoAberta(true)}
        >
            <span>⚑</span>
            Denúncias
        </button>
    )}

    <button
        className="feed-new-post"
        type="button"
        onClick={() => setCriandoPost(true)}
    >
        <span>＋</span>
        Criar publicação
    </button>
</div>
                </header>

                <section className="feed-filters">
                    <div className="feed-filter-scroll">
                        <button
                            className={
                                !comunidadeAtiva
                                    ? 'feed-community active'
                                    : 'feed-community'
                            }
                            type="button"
                            onClick={() => setComunidadeAtiva('')}
                        >
                            Todas
                        </button>

                        {comunidades.map(comunidade => (
                            <button
                                key={comunidade.id_comunidade}
                                className={
                                    comunidadeAtiva === comunidade.slug
                                        ? 'feed-community active'
                                        : 'feed-community'
                                }
                                type="button"
                                onClick={() => {
                                    setComunidadeAtiva(comunidade.slug)
                                }}
                            >
                                <span
                                    style={{
                                        background: comunidade.cor
                                    }}
                                />

                                {comunidade.nome}
                            </button>
                        ))}
                    </div>

                    <div className="feed-order">
                        <button
                            className={
                                ordem === 'recentes'
                                    ? 'active'
                                    : ''
                            }
                            type="button"
                            onClick={() => setOrdem('recentes')}
                        >
                            Recentes
                        </button>

                        <button
                            className={
                                ordem === 'emAlta'
                                    ? 'active'
                                    : ''
                            }
                            type="button"
                            onClick={() => setOrdem('emAlta')}
                        >
                            Em alta
                        </button>
                    </div>
                </section>

                {erro && (
                    <div className="feed-error">
                        {erro}
                    </div>
                )}

                {carregando ? (
                    <section className="feed-state">
                        <span className="feed-loader" />
                        <p>Carregando a comunidade...</p>
                    </section>
                ) : posts.length === 0 ? (
                    <section className="feed-state feed-empty">
                        <span>🌿</span>
                        <h2>A Selva ainda está quieta.</h2>
                        <p>
                            Seja a primeira pessoa a criar uma publicação.
                        </p>
                    </section>
                ) : (
                    <section className="feed-posts">
                        {posts.map(post => (
                            <article
                                className="feed-post"
                                key={post.id_post}
                            >
                                <div className="feed-votes">
                                    <button
                                        className={
                                            post.meu_voto === 'positivo'
                                                ? 'active positive'
                                                : ''
                                        }
                                        type="button"
                                        onClick={() => {
                                            votarPost(
                                                post.id_post,
                                                'positivo'
                                            )
                                        }}
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
                                        onClick={() => {
                                            votarPost(
                                                post.id_post,
                                                'negativo'
                                            )
                                        }}
                                        aria-label="Voto negativo"
                                    >
                                        ▼
                                    </button>
                                </div>

                                <div className="feed-post-body">
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

                                    <h2>{post.titulo}</h2>

                                    <p className="feed-post-text">
                                        {post.conteudo}
                                    </p>

                                    <div className="feed-post-actions">
                                                                    <button
                                    type="button"
                                    onClick={() => setPostAberto(post.id_post)}
                                >
                                    💬 {post.total_comentarios} comentários
                                </button>

                                       <button
    type="button"
    onClick={() => {
        const url = `${window.location.origin}/feed?post=${post.id_post}`

        navigator.clipboard.writeText(url)
            .then(() => window.alert('Link copiado!'))
            .catch(() => window.alert(url))
    }}
>
    ↗ Compartilhar
</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </section>
             <FeedLateral comunidades={comunidades} />
    </div>

            {criandoPost && (
                <div
                    className="feed-modal-backdrop"
                    onMouseDown={() => setCriandoPost(false)}
                >
                    <form
                        className="feed-modal"
                        onSubmit={publicarPost}
                        onMouseDown={event => event.stopPropagation()}
                    >
                        <div className="feed-modal-header">
                            <div>
                                <span>NOVA PUBLICAÇÃO</span>
                                <h2>Compartilhe com a comunidade</h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCriandoPost(false)}
                                aria-label="Fechar"
                            >
                                ×
                            </button>
                        </div>

                        <label>
                            Selva

                            <select
                                value={comunidadePost}
                                onChange={event => {
                                    setComunidadePost(event.target.value)
                                }}
                            >
                                {comunidades.map(comunidade => (
                                    <option
                                        key={comunidade.id_comunidade}
                                        value={comunidade.id_comunidade}
                                    >
                                        {comunidade.nome}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Título

                            <input
                                value={titulo}
                                maxLength="160"
                                onChange={event => {
                                    setTitulo(event.target.value)
                                }}
                                placeholder="Dê um título para a sua publicação"
                            />
                        </label>

                        <label>
                            Conteúdo

                            <textarea
                                value={conteudo}
                                maxLength="5000"
                                onChange={event => {
                                    setConteudo(event.target.value)
                                }}
                                placeholder="Escreva sua dúvida, dica ou descoberta..."
                            />
                        </label>

                        <div className="feed-modal-footer">
                            <span>
                                {conteudo.length}/5000 caracteres
                            </span>

                            <button
                                className="feed-publish"
                                type="submit"
                                disabled={publicando}
                            >
                                {publicando
                                    ? 'Publicando...'
                                    : 'Publicar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
                {postAberto && (
                <FeedDetalhe
                    idPost={postAberto}
                    aoFechar={() => setPostAberto(null)}
                    aoAtualizar={carregarPosts}
                />
            )}

            {moderacaoAberta && (
    <FeedModeracao
        aoFechar={() => setModeracaoAberta(false)}
        aoAtualizarFeed={carregarPosts}
    />
)}

        </main>
    )
}

export default Feed