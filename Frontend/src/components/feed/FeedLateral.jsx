import MOKI from "../../assets/MOKI.png"
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

function FeedLateral({ comunidades, comunidadeAtiva, setComunidadeAtiva }) {
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

    return (
        <aside className="feed-sidebar">

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
                        <article
                            key={comunidade.id_comunidade}
                            role="button"
                            tabIndex={0}
                            onClick={() => setComunidadeAtiva(comunidade.slug)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    setComunidadeAtiva(comunidade.slug)
                                }
                            }}
                        >
                            <strong className="feed-community-position">
                                {indice + 1}
                            </strong>

                            <span
                                className="feed-community-color"
                                style={{ background: comunidade.cor }}
                            />

                            <div>
                                <strong>{comunidade.nome}</strong>

                                <span>
                                    {Number(comunidade.total_posts) || 0}{' '}
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
                <span aria-hidden="true"><img src={MOKI} alt="" className="moki"/></span>

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