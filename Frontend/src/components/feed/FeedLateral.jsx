import { useEffect, useMemo, useState } from 'react'

function Avatar({ foto, nome }) {
    const iniciais = (nome || 'SL')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte[0])
        .join('')
        .toUpperCase()

    return (
        <div className="feed-side-avatar">
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

function FeedLateral({ comunidades }) {
    const [usuario, setUsuario] = useState(null)
    const [missoes, setMissoes] = useState([])
    const [carregando, setCarregando] = useState(true)

    const comunidadesEmAlta = useMemo(() => {
        return [...comunidades]
            .sort((a, b) => {
                return Number(b.total_posts) - Number(a.total_posts)
            })
            .slice(0, 5)
    }, [comunidades])

    useEffect(() => {
        async function carregarLateral() {
            const token = localStorage.getItem('token')

            if (!token) {
                setCarregando(false)
                return
            }

            try {
                const respostaPerfil = await fetch(
                    'http://localhost:3000/perfil',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                const dadosPerfil = await respostaPerfil.json()

                if (!respostaPerfil.ok || !dadosPerfil.ok) {
                    throw new Error(
                        dadosPerfil.message ||
                        'Não foi possível carregar o usuário.'
                    )
                }

                const usuarioAtual = dadosPerfil.usuario

                setUsuario(usuarioAtual)

                const respostaMissoes = await fetch(
                    `http://localhost:3000/missoes/hoje?id_usuario=${usuarioAtual.id_usuario}`
                )

                const dadosMissoes = await respostaMissoes.json()

                if (respostaMissoes.ok) {
                    setMissoes(dadosMissoes.missoes || [])
                }

            } catch (erro) {
                console.error(
                    'Erro ao carregar lateral do feed:',
                    erro
                )
            } finally {
                setCarregando(false)
            }
        }

        carregarLateral()
    }, [])

    if (carregando) {
        return (
            <aside className="feed-sidebar">
                <div className="feed-side-card feed-side-loading">
                    <span className="feed-loader" />
                </div>
            </aside>
        )
    }

    return (
        <aside className="feed-sidebar">
            {usuario && (
                <section className="feed-side-card feed-user-card">
                    <header>
                        <Avatar
                            foto={usuario.foto_perfil}
                            nome={usuario.nome_de_exibicao}
                        />

                        <div>
                            <strong>
                                {usuario.nome_de_exibicao}
                            </strong>

                            <span>
                                @{usuario.nome_de_usuario}
                            </span>
                        </div>
                    </header>

                    <div className="feed-user-stats">
                        <div>
                            <span>XP semanal</span>

                            <strong>
                                {Number(
                                    usuario.xp_semanal
                                ).toLocaleString('pt-BR')}
                            </strong>
                        </div>

                        <div>
                            <span>Sequência</span>

                            <strong>
                                🔥 {Number(usuario.streak) || 0}
                            </strong>
                        </div>
                    </div>

                    <div className="feed-user-division">
                        <span>Divisão atual</span>

                        <strong>
                            {usuario.divisao || 'Bronze'}
                        </strong>
                    </div>
                </section>
            )}

            <section className="feed-side-card">
                <header className="feed-side-title">
                    <div>
                        <span>PARA HOJE</span>
                        <h2>Missões diárias</h2>
                    </div>

                    <span aria-hidden="true">🎯</span>
                </header>

                <div className="feed-side-missions">
                    {missoes.length === 0 ? (
                        <p className="feed-side-empty">
                            Nenhuma missão disponível.
                        </p>
                    ) : (
                        missoes.slice(0, 3).map(missao => {
                            const progresso =
                                Number(missao.progresso) || 0

                            const meta =
                                Number(missao.meta) || 1

                            const porcentagem = Math.min(
                                100,
                                (progresso / meta) * 100
                            )

                            return (
                                <article
                                    className="feed-side-mission"
                                    key={missao.id_usuario_missao}
                                >
                                    <div>
                                        <strong>
                                            {missao.missao}
                                        </strong>

                                        <span>
                                            +{missao.xp_recompensa} XP
                                        </span>
                                    </div>

                                    <p>
                                        {progresso}/{meta}
                                    </p>

                                    <div className="feed-mission-track">
                                        <span
                                            style={{
                                                width: `${porcentagem}%`
                                            }}
                                        />
                                    </div>
                                </article>
                            )
                        })
                    )}
                </div>
            </section>

            <section className="feed-side-card">
                <header className="feed-side-title">
                    <div>
                        <span>COMUNIDADES</span>
                        <h2>Selvas em alta</h2>
                    </div>

                    <span aria-hidden="true">🌿</span>
                </header>

                <div className="feed-side-communities">
                    {comunidadesEmAlta.map((comunidade, indice) => (
                        <article key={comunidade.id_comunidade}>
                            <strong className="feed-community-position">
                                {indice + 1}
                            </strong>

                            <span
                                className="feed-community-color"
                                style={{
                                    background: comunidade.cor
                                }}
                            />

                            <div>
                                <strong>{comunidade.nome}</strong>

                                <span>
                                    {Number(comunidade.total_posts)}{' '}
                                    {Number(comunidade.total_posts) === 1
                                        ? 'publicação'
                                        : 'publicações'}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="feed-side-tip">
                <span aria-hidden="true">🐒</span>

                <div>
                    <strong>Dica do Moki</strong>

                    <p>
                        Ajude alguém com uma resposta clara e respeitosa.
                    </p>
                </div>
            </section>
        </aside>
    )
}

export default FeedLateral