import MOKI from '../../assets/MOKI.png'

export default function FeedLateral({ comunidades, comunidadeAtiva, setComunidadeAtiva }) {
    const totalPublicacoes = comunidades.reduce((total, comunidade) => total + (Number(comunidade.total_posts) || 0), 0)

    return (
        <aside className="feed-sidebar">
            <section className="feed-side-card feed-communities" aria-labelledby="feed-communities-heading">
                <header className="feed-communities-heading">
                    <span>ENCONTRE SUA TRILHA</span>
                    <h2 id="feed-communities-heading">Comunidades</h2>
                    <p>Escolha o que quer acompanhar.</p>
                </header>

                <nav className="feed-community-nav" aria-label="Filtrar publicações por comunidade">
                    <button
                        type="button"
                        className="feed-community-choice"
                        aria-pressed={!comunidadeAtiva}
                        onClick={() => setComunidadeAtiva('')}
                    >
                        <span className="feed-choice-dot feed-choice-dot--all" aria-hidden="true" />
                        <span className="feed-choice-name">Todas</span>
                        <span className="feed-choice-total" aria-label={`${totalPublicacoes} publicações`}>{totalPublicacoes}</span>
                    </button>

                    {comunidades.map(comunidade => {
                        const total = Number(comunidade.total_posts) || 0
                        return (
                            <button
                                type="button"
                                className="feed-community-choice"
                                key={comunidade.id_comunidade}
                                aria-pressed={comunidadeAtiva === comunidade.slug}
                                onClick={() => setComunidadeAtiva(comunidade.slug)}
                            >
                                <span className="feed-choice-dot" style={{ backgroundColor: comunidade.cor }} aria-hidden="true" />
                                <span className="feed-choice-name">{comunidade.nome}</span>
                                <span className="feed-choice-total" aria-label={`${total} ${total === 1 ? 'publicação' : 'publicações'}`}>{total}</span>
                            </button>
                        )
                    })}
                </nav>
            </section>

            <section className="feed-side-tip">
                <span aria-hidden="true"><img src={MOKI} alt="" className="moki" /></span>
                <div>
                    <strong>Dica do Moki</strong>
                    <p>Ajude alguém com uma resposta clara e respeitosa.</p>
                </div>
            </section>
        </aside>
    )
}
