import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import './Perfil.css'

function StatCard({ icon, value, label, delay }) {
  return (
    <article
      className="profile-stat-card profile-reveal"
      style={{ '--reveal-delay': delay }}
    >
      <div className="profile-stat-icon" aria-hidden="true">
        {icon}
      </div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}

function Avatar({ photo, name, className = '' }) {
  const initials = useMemo(() => {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }, [name])

  return (
    <div className={`profile-avatar ${className}`}>
      {photo ? (
        <img
          src={photo}
          alt={`Foto de ${name}`}
        />
      ) : (
        <span>{initials || 'SL'}</span>
      )}ed
    </div>
  )
}

function Perfil() {
  const { username } = useParams()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  const [draft, setDraft] = useState({
    name: '',
    username: '',
    bio: '',
    photo: '',
  })

  /*
   * Atualmente o /perfil retorna o usuário
   * autenticado pelo token.
   */
  const isOwner = !username || username === user?.nome_de_usuario

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          setError('Você precisa estar logado.')
          setLoading(false)
          return
        }

        const resposta = await fetch(
          'http://localhost:3000/perfil',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const dados = await resposta.json()

        if (!resposta.ok || !dados.ok) {
          setError(
            dados.message || 'Não foi possível carregar o perfil.'
          )
          return
        }

        const usuario = dados.usuario

        setUser(usuario)

      setDraft({
        name: usuario.nome_de_exibicao || '',
        username: usuario.nome_de_usuario || '',
        bio: usuario.bio || '',
        photo: usuario.foto_perfil || '',
      })
      } catch (erro) {
        console.error(erro)

        setError(
          'Não foi possível conectar ao servidor.'
        )
      } finally {
        setLoading(false)
      }
    }

    carregarPerfil()
  }, [])

  function openEdit() {
    setDraft({
      name: user.nome_de_exibicao || '',
      username: user.nome_de_usuario || '',
      bio: user.bio || '',
      photo: user.foto_perfil || '',
    })

    setEditOpen(true)
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0]

    if (!file) return

    const objectUrl = URL.createObjectURL(file)

    setDraft((previous) => ({
      ...previous,
      photo: objectUrl,
    }))
  }

  function saveProfile(event) {
    event.preventDefault()

    const cleanUsername = draft.username
      .trim()
      .replace(/^@+/, '')
      .replace(/\s+/g, '')

      setUser((previous) => ({
        ...previous,
        nome_de_exibicao:
          draft.name.trim() || previous.nome_de_exibicao,
        nome_de_usuario:
          cleanUsername || previous.nome_de_usuario,
        bio:
          draft.bio.trim(),
        foto_perfil:
          draft.photo || previous.foto_perfil,
      }))

    setEditOpen(false)
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-content">
          <p>Carregando perfil...</p>
        </div>
      </main>
    )
  }

  if (error || !user) {
    return (
      <main className="profile-page">
        <div className="profile-content">
          <p>
            {error || 'Perfil não encontrado.'}
          </p>
        </div>
      </main>
    )
  }

  /*
   * Dados vindos diretamente do banco.
   */
  const atividadesConcluidas =
    Number(user.atvidades_concluidas_geral) || 0

  const xp =
    Number(user.xp) || 0

  const streak =
    Number(user.streak) || 0

  /*
   * Como sua tabela atual não possui uma coluna
   * de data de cadastro, não vamos inventar uma.
   */
  const joinedAt = '2026'

  /*
   * Sua tabela ainda não possui uma informação
   * de porcentagem de progresso.
   *
   * Por enquanto mostramos o número de atividades
   * concluídas.
   */
  const progressPercentage = 0

  return (
    <>

        <div className="profile-page">

          {/* HERO */}

          <section
            className="profile-hero profile-reveal"
            style={{ '--reveal-delay': '40ms' }}
          >

            <div
              className="profile-hero-pattern"
              aria-hidden="true"
            />

            <div
              className="profile-hero-glow"
              aria-hidden="true"
            />

            <div className="profile-avatar-wrap">

              <Avatar
                photo={user.foto_perfil}
                name={user.nome_de_exibicao}
                className="profile-avatar-large"
              />

              <span
                className="profile-online-dot"
                title="Perfil ativo"
              />

            </div>

            <div className="profile-identity">

              <p className="profile-kicker">
                PERFIL DE ALUNO
              </p>

              <h1>
                {user.nome_de_exibicao}
              </h1>

              <p className="profile-username">
                @{user.nome_de_usuario}
              </p>

             <p className="profile-bio">
                {user.bio?.trim()
                  ? user.bio
                  : 'Este aluno ainda não adicionou uma bio.'}
              </p>

            </div>

            <div className="profile-hero-actions">

              {isOwner ? (
                <button
                  className="profile-primary-button"
                  type="button"
                  onClick={openEdit}
                >
                  Editar perfil
                </button>
              ) : (
                <span className="profile-public-badge">
                  Perfil público
                </span>
              )}

            </div>

          </section>

          {/* ESTATÍSTICAS */}

          <section
            className="profile-section profile-stats-section"
            aria-labelledby="stats-title"
          >

            <div
              className="profile-section-heading profile-reveal"
              style={{ '--reveal-delay': '110ms' }}
            >
              <div>

                <p className="profile-kicker">
                  {isOwner
                    ? 'SEU RITMO'
                    : 'RITMO DO ALUNO'}
                </p>

                <h2 id="stats-title">
                  Estatísticas
                </h2>

              </div>
            </div>

            <div className="profile-stats-grid">

              <StatCard
                icon="🔥"
                value={`${streak} dias`}
                label="Sequência"
                delay="160ms"
              />

              <StatCard
                icon="⚡"
                value={xp.toLocaleString('pt-BR')}
                label="XP total"
                delay="220ms"
              />

              <StatCard
                icon="✓"
                value={atividadesConcluidas}
                label="Atividades"
                delay="280ms"
              />

            </div>

          </section>

          {/* PROGRESSO + ATIVIDADE */}

          <section className="profile-grid-section">

            <article
              className="profile-panel progress-panel profile-reveal"
              style={{ '--reveal-delay': '400ms' }}
            >

              <div className="profile-panel-heading">

                <div>

                  <p className="profile-kicker">
                    TRILHA ATUAL
                  </p>

                  <h2>
                    Progresso de aprendizagem
                  </h2>

                </div>

                <strong className="progress-percentage">
                  {progressPercentage}%
                </strong>

              </div>

              <div
                className="profile-progress-track"
                aria-label={`${progressPercentage}% da trilha concluída`}
              >
                <span
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>

              <div className="progress-footer">

                <span>
                  {atividadesConcluidas} atividades concluídas
                </span>

                <strong>
                  {atividadesConcluidas}
                </strong>

              </div>

              <div className="progress-message">

                <span aria-hidden="true">
                  🌿
                </span>

                <p>
                  {isOwner
                    ? 'Continue estudando para aumentar seu progresso e fortalecer sua sequência.'
                    : `${user.nome_de_exibicao} continua avançando nesta trilha.`}
                </p>

              </div>

            </article>

            {/* ATIVIDADE RECENTE */}

            <article
              className="profile-panel recent-panel profile-reveal"
              style={{ '--reveal-delay': '460ms' }}
            >

              <div className="profile-panel-heading">

                <div>

                  <p className="profile-kicker">
                    PROGRESSO
                  </p>

                  <h2>
                    Atividades por matéria
                  </h2>

                </div>

              </div>

              <div className="recent-list">

                <div className="recent-item">

                  <span
                    className="recent-check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <div>
                    <strong>
                      Português
                    </strong>

                    <span>
                      Atividades concluídas
                    </span>
                  </div>

                  <b>
                    {Number(
                      user.atvidades_concluidas_portugues
                    ) || 0}
                  </b>

                </div>

                <div className="recent-item">

                  <span
                    className="recent-check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <div>
                    <strong>
                      Matemática
                    </strong>

                    <span>
                      Atividades concluídas
                    </span>
                  </div>

                  <b>
                    {Number(
                      user.atvidades_concluidas_matematica
                    ) || 0}
                  </b>

                </div>

                <div className="recent-item">

                  <span
                    className="recent-check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <div>
                    <strong>
                      Ciências
                    </strong>

                    <span>
                      Atividades concluídas
                    </span>
                  </div>

                  <b>
                    {Number(
                      user.atvidades_concluidas_ciencias
                    ) || 0}
                  </b>

                </div>

                <div className="recent-item">

                  <span
                    className="recent-check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <div>
                    <strong>
                      História
                    </strong>

                    <span>
                      Atividades concluídas
                    </span>
                  </div>

                  <b>
                    {Number(
                      user.atvidades_concluidas_historia
                    ) || 0}
                  </b>

                </div>

                <div className="recent-item">

                  <span
                    className="recent-check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <div>
                    <strong>
                      Geografia
                    </strong>

                    <span>
                      Atividades concluídas
                    </span>
                  </div>

                  <b>
                    {Number(
                      user.atvidades_concluidas_geografia
                    ) || 0}
                  </b>

                </div>

                <div className="recent-item">

                  <span
                    className="recent-check"
                    aria-hidden="true"
                  >
                    ✓
                  </span>

                  <div>
                    <strong>
                      Inglês
                    </strong>

                    <span>
                      Atividades concluídas
                    </span>
                  </div>

                  <b>
                    {Number(
                      user.atvidades_concluidas_ingles
                    ) || 0}
                  </b>

                </div>

              </div>

            </article>

          </section>

        </div>

      {/* MODAL DE EDIÇÃO */}

      {editOpen && (

        <div
          className="profile-modal-backdrop"
          role="presentation"
          onMouseDown={() => setEditOpen(false)}
        >

          <section
            className="profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="profile-modal-close"
              type="button"
              onClick={() => setEditOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>

            <div className="edit-modal-heading">

              <p className="profile-kicker">
                PERSONALIZE SEU ESPAÇO
              </p>

              <h2 id="edit-profile-title">
                Editar perfil
              </h2>

            </div>

            <form onSubmit={saveProfile}>

              <div className="edit-photo-row">

                <Avatar
                  photo={
                    draft.photo ||
                    user.foto_perfil
                  }
                  name={
                    user.nome_de_exibicao
                  }
                  className="profile-avatar-large"
                />

                <label className="photo-upload-button">

                  Alterar foto

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                  />

                </label>

              </div>

              <h1>
                {user.nome_de_exibicao}
              </h1>

              <p className="profile-username">
                @{user.nome_de_usuario}
              </p>

             <label className="profile-field">
                <span>Bio</span>

                <textarea
                  maxLength="255"
                  rows="4"
                  placeholder="Conte um pouco sobre você..."
                  value={draft.bio}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      bio: event.target.value,
                    })
                  }
                />

                <small>
                  {draft.bio.length}/255
                </small>
              </label>

              <div className="edit-modal-actions">

                <button
                  className="profile-secondary-button"
                  type="button"
                  onClick={() => setEditOpen(false)}
                >
                  Cancelar
                </button>

                <button
                  className="profile-primary-button"
                  type="submit"
                >
                  Salvar alterações
                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </>
  )
}

export default Perfil
