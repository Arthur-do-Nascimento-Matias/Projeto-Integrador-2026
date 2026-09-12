import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import MenuEsquerda from '../MenuEsquerda/MenuEsquerda'
import './Perfil.css'

const currentUser = {
  name: 'Arthur Matias',
  username: 'arthur',
  bio: 'Explorando a Língua Portuguesa, uma trilha de cada vez.',
  joinedAt: '2026',
  photo: '',
  stats: {
    streak: 12,
    xp: 2450,
    completed: 34,
    accuracy: 87,
  },
  progress: {
    percentage: 72,
    completed: 38,
    total: 52,
  },
  recent: [
    { id: 1, title: 'Classes gramaticais', detail: 'Atividade concluída', score: '10/10' },
    { id: 2, title: 'Substantivos', detail: 'Atividade concluída', score: '9/10' },
    { id: 3, title: 'Pronomes', detail: 'Último desafio', score: '9/10' },
  ],
}

function buildViewedUser(username) {
  if (!username || username === currentUser.username) return currentUser

  const normalizedName = username
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

  return {
    ...currentUser,
    name: normalizedName || 'Aluno SimioLab',
    username,
    bio: 'Aprendendo, praticando e avançando pela trilha do SimioLab.',
    stats: {
      streak: 8,
      xp: 1830,
      completed: 27,
      accuracy: 84,
    },
    progress: {
      percentage: 58,
      completed: 30,
      total: 52,
    },
  }
}

function StatCard({ icon, value, label, delay }) {
  return (
    <article className="profile-stat-card profile-reveal" style={{ '--reveal-delay': delay }}>
      <div className="profile-stat-icon" aria-hidden="true">{icon}</div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}

function Avatar({ photo, name, className = '' }) {
  const initials = useMemo(() => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }, [name])

  return (
    <div className={`profile-avatar ${className}`}>
      {photo ? <img src={photo} alt={`Foto de ${name}`} /> : <span>{initials || 'SL'}</span>}
    </div>
  )
}

function Perfil() {
  const { username } = useParams()
  const initialUser = useMemo(() => buildViewedUser(username), [username])
  const isOwner = !username || username === currentUser.username

  const [user, setUser] = useState(initialUser)
  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState({
    name: initialUser.name,
    username: initialUser.username,
    bio: initialUser.bio,
    photo: initialUser.photo,
  })

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  function openEdit() {
    setDraft({
      name: user.name,
      username: user.username,
      bio: user.bio,
      photo: user.photo,
    })
    setEditOpen(true)
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setDraft((previous) => ({ ...previous, photo: objectUrl }))
  }

  function saveProfile(event) {
    event.preventDefault()

    const cleanUsername = draft.username.trim().replace(/^@+/, '').replace(/\s+/g, '')

    setUser((previous) => ({
      ...previous,
      name: draft.name.trim() || previous.name,
      username: cleanUsername || previous.username,
      bio: draft.bio.trim(),
      photo: draft.photo,
    }))
    setEditOpen(false)
  }

  return (
    <>

      <MenuEsquerda />

      <main className="profile-page">
        <div className="profile-ambient" aria-hidden="true">
          <span className="profile-particle particle-one" />
          <span className="profile-particle particle-two" />
          <span className="profile-particle particle-three" />
          <span className="profile-leaf leaf-one" />
          <span className="profile-leaf leaf-two" />
        </div>

        <div className="profile-content">
          <section className="profile-hero profile-reveal" style={{ '--reveal-delay': '40ms' }}>
            <div className="profile-hero-pattern" aria-hidden="true" />
            <div className="profile-hero-glow" aria-hidden="true" />

            <div className="profile-avatar-wrap">
              <Avatar photo={user.photo} name={user.name} className="profile-avatar-large" />
              <span className="profile-online-dot" title="Perfil ativo" />
            </div>

            <div className="profile-identity">
              <p className="profile-kicker">PERFIL DE ALUNO</p>
              <h1>{user.name}</h1>
              <p className="profile-username">@{user.username}</p>
              <p className="profile-bio">{user.bio || 'Este aluno ainda não adicionou uma bio.'}</p>

              <div className="profile-meta-row">
                <span>Aluno desde {user.joinedAt}</span>
                <span className="profile-meta-divider" aria-hidden="true">•</span>
                <span>Português</span>
              </div>
            </div>

            <div className="profile-hero-actions">
              {isOwner ? (
                <button className="profile-primary-button" type="button" onClick={openEdit}>
                  Editar perfil
                </button>
              ) : (
                <span className="profile-public-badge">Perfil público</span>
              )}
            </div>
          </section>

          <section className="profile-section profile-stats-section" aria-labelledby="stats-title">
            <div className="profile-section-heading profile-reveal" style={{ '--reveal-delay': '110ms' }}>
              <div>
                <p className="profile-kicker">{isOwner ? 'SEU RITMO' : 'RITMO DO ALUNO'}</p>
                <h2 id="stats-title">Estatísticas</h2>
              </div>
            </div>

            <div className="profile-stats-grid">
              <StatCard icon="🔥" value={`${user.stats.streak} dias`} label="Sequência" delay="160ms" />
              <StatCard icon="⚡" value={user.stats.xp.toLocaleString('pt-BR')} label="XP total" delay="220ms" />
              <StatCard icon="✓" value={user.stats.completed} label="Atividades" delay="280ms" />
              <StatCard icon="◎" value={`${user.stats.accuracy}%`} label="Precisão" delay="340ms" />
            </div>
          </section>

          <section className="profile-grid-section">
            <article className="profile-panel progress-panel profile-reveal" style={{ '--reveal-delay': '400ms' }}>
              <div className="profile-panel-heading">
                <div>
                  <p className="profile-kicker">TRILHA ATUAL</p>
                  <h2>Progresso de aprendizagem</h2>
                </div>
                <strong className="progress-percentage">{user.progress.percentage}%</strong>
              </div>

              <div className="profile-progress-track" aria-label={`${user.progress.percentage}% da trilha concluída`}>
                <span style={{ width: `${user.progress.percentage}%` }} />
              </div>

              <div className="progress-footer">
                <span>{user.progress.completed} atividades concluídas</span>
                <strong>{user.progress.completed} / {user.progress.total}</strong>
              </div>

              <div className="progress-message">
                <span aria-hidden="true">🌿</span>
                <p>{isOwner ? 'Você já avançou bastante. Continue mantendo sua sequência para fortalecer o aprendizado.' : `${user.name} já avançou bastante nesta trilha.`}</p>
              </div>
            </article>

            <article className="profile-panel recent-panel profile-reveal" style={{ '--reveal-delay': '460ms' }}>
              <div className="profile-panel-heading">
                <div>
                  <p className="profile-kicker">ÚLTIMOS PASSOS</p>
                  <h2>Atividade recente</h2>
                </div>
              </div>

              <div className="recent-list">
                {user.recent.map((activity) => (
                  <div className="recent-item" key={activity.id}>
                    <span className="recent-check" aria-hidden="true">✓</span>
                    <div>
                      <strong>{activity.title}</strong>
                      <span>{activity.detail}</span>
                    </div>
                    <b>{activity.score}</b>
                  </div>
                ))}
              </div>
            </article>
          </section>

        </div>
      </main>

      {editOpen && (
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={() => setEditOpen(false)}>
          <section
            className="profile-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="profile-modal-close" type="button" onClick={() => setEditOpen(false)} aria-label="Fechar">
              ×
            </button>

            <div className="edit-modal-heading">
              <p className="profile-kicker">PERSONALIZE SEU ESPAÇO</p>
              <h2 id="edit-profile-title">Editar perfil</h2>
            </div>

            <form onSubmit={saveProfile}>
              <div className="edit-photo-row">
                <Avatar photo={draft.photo} name={draft.name || user.name} />
                <label className="photo-upload-button">
                  Alterar foto
                  <input type="file" accept="image/*" onChange={handlePhoto} />
                </label>
              </div>

              <label className="profile-field">
                <span>Nome</span>
                <input
                  type="text"
                  maxLength="60"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </label>

              <label className="profile-field">
                <span>Usuário</span>
                <div className="username-input-wrap">
                  <b>@</b>
                  <input
                    type="text"
                    maxLength="24"
                    value={draft.username}
                    onChange={(event) => setDraft({ ...draft, username: event.target.value })}
                  />
                </div>
              </label>

              <label className="profile-field">
                <span>Bio</span>
                <textarea
                  maxLength="150"
                  rows="4"
                  value={draft.bio}
                  onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
                />
                <small>{draft.bio.length}/150</small>
              </label>

              <div className="edit-modal-actions">
                <button className="profile-secondary-button" type="button" onClick={() => setEditOpen(false)}>
                  Cancelar
                </button>
                <button className="profile-primary-button" type="submit">
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
