const moki = "/avatares-simio/moki.png";
const zoro = "/avatares-simio/zoro.png";
const miro = "/avatares-simio/miro.png";
const ibra = "/avatares-simio/ibra.png";
const mika = "/avatares-simio/mika.png";
const kimo = "/avatares-simio/kimo.png";
const tuki = "/avatares-simio/tuki.png";
const nala = "/avatares-simio/nala.png";
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from "react-dom";
import { useParams } from 'react-router-dom'
import './Perfil.css'

const fotosPerfil = {
  moki,
  zoro,
  miro,
  ibra,
  mika,
  kimo,
  tuki,
  nala
};

const coresPerfil = [
  { nome: 'Verde sálvia', valor: '#B4CFA8' },
  { nome: 'Creme', valor: '#F1DFC0' },
  { nome: 'Azul suave', valor: '#B8D5E5' },
  { nome: 'Lilás', valor: '#D4C0E4' },
  { nome: 'Pêssego', valor: '#F0C3A7' },
  { nome: 'Rosa suave', valor: '#E8BDCB' },
];
const corPadrao = coresPerfil[0].valor;

function PencilIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="m16 3 5 5M4 15 15.5 3.5a2.1 2.1 0 0 1 3 0l2 2a2.1 2.1 0 0 1 0 3L9 20l-6 1 1-6Z" />
    </svg>
  );
}

function StatCard({ icon, value, label, delay }) {
  return (
    <article
      className="profile-stat-card profile-reveal"
      style={{ '--reveal-delay': delay }}
    >
      <div className="profile-stat-icon" aria-hidden="true">
        {icon}
      </div>

      <div className='stats'>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}

function Avatar({ photo, name, background = corPadrao, className = '' }) {
  const initials = useMemo(() => {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }, [name])


  return (
    <div className={`profile-avatar ${className}`} style={{ backgroundColor: background }}>
      {photo ? (
        <img
          src={fotosPerfil[photo] || moki}
          alt={`Foto de ${name}`}
        />
      ) : (
        <span>{initials || 'SL'}</span>
      )}
    </div>
  )
}

function Perfil({ draft, setDraft }) {
  const { username } = useParams()

  const [nomeUsuario, setNomeUsuario] = useState("");
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [fotoOpen, setFotoOpen] = useState(false);
  const [corOpen, setCorOpen] = useState(false);
  const editModalRef = useRef(null);
  const pickerModalRef = useRef(null);

  useEffect(() => {
    if (!editOpen) return;
    const anterior = document.activeElement;
    editModalRef.current?.querySelector('button')?.focus();
    return () => { if (anterior?.isConnected) anterior.focus(); };
  }, [editOpen]);

  useEffect(() => {
    if (!fotoOpen && !corOpen) return;
    const anterior = document.activeElement;
    pickerModalRef.current?.querySelector('button')?.focus();
    return () => { if (anterior?.isConnected) anterior.focus(); };
  }, [fotoOpen, corOpen]);

  // O teclado fica no diálogo que está por cima.
  useEffect(() => {
    if (!editOpen) return;
    const modal = (fotoOpen || corOpen) ? pickerModalRef.current : editModalRef.current;
    if (!modal) return;
    const seletor = 'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]';
    const focaveis = () => Array.from(modal.querySelectorAll(seletor));
    function teclado(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (savingProfile) return;
        if (fotoOpen) setFotoOpen(false);
        else if (corOpen) setCorOpen(false);
        else setEditOpen(false);
      }
      if (event.key === 'Tab') {
        const itens = focaveis();
        const primeiro = itens[0];
        const ultimo = itens[itens.length - 1];
        if (!primeiro) { event.preventDefault(); modal.focus(); return; }
        if (event.shiftKey && (document.activeElement === primeiro || !modal.contains(document.activeElement))) {
          event.preventDefault(); ultimo.focus();
        } else if (!event.shiftKey && (document.activeElement === ultimo || !modal.contains(document.activeElement))) {
          event.preventDefault(); primeiro.focus();
        }
      }
    }
    document.addEventListener('keydown', teclado);
    return () => {
      document.removeEventListener('keydown', teclado);
    };
  }, [editOpen, fotoOpen, corOpen, savingProfile]);

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

      const usuario = dados.usuario;

      const fotoSalva = usuario.foto_perfil || usuario.foto || "";

      setUser({
        ...usuario,
        foto_perfil: fotoSalva,
      });

      setDraft({
        id: usuario.id_usuario || "",
        name: usuario.nome_de_exibicao || "",
        username: usuario.nome_de_usuario || "",
        bio: usuario.bio || "",
        photo: fotoSalva,
        cor_fundo: usuario.cor_fundo || corPadrao,
        atividadesConcluidas: [
          usuario.atvidades_concluidas_geral,
          usuario.atvidades_concluidas_matematica,
          usuario.atvidades_concluidas_portugues,
          usuario.atvidades_concluidas_historia,
          usuario.atvidades_concluidas_geografia,
          usuario.atvidades_concluidas_ciencias,
          usuario.atvidades_concluidas_ingles,
        ],

        total_perguntas: usuario.total_perguntas
      });

        console.log(draft)

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
    setNomeUsuario(user.nome_de_exibicao || "");

    setDraft(previous => ({
      ...previous,
      photo: user.foto_perfil || "",
      bio: user.bio || "",
      cor_fundo: user.cor_fundo || corPadrao,
    }));

    setFotoOpen(false);
    setCorOpen(false);
    setEditOpen(true);
  }

    async function enviar(rota, dados) {
        console.log(`[Perfil] Enviando para /${rota}`, dados.id);

        const resposta = await fetch(
            `http://localhost:3000/${rota}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(dados)
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok || resultado.ok !== true) {
            throw new Error(
                resultado.message ||
                `Erro ao executar /${rota}`
            );
        }

        console.log(`[Perfil] /${rota} concluída`);

        return resultado;
    }

async function trocar(fotinha) {
    setDraft(previous => ({
      ...previous,
      photo: fotinha,
    }));

    setFotoOpen(false);
}

async function saveProfile(event) {
    event.preventDefault();

    if (savingProfile) return;

    const id = user.id_usuario;

    const novoNome = nomeUsuario
        .trim()
        .replace(/^@+/, "")
        .replace(/\s+/g, "");

    const bioNova = draft.bio.trim();

    const fotoNova = draft.photo || user.foto_perfil || "";
    const corNova = draft.cor_fundo || corPadrao;

    if (!novoNome) {
        alert("O nome de usuário não pode ficar vazio.");
        return;
    }

    setSavingProfile(true);

    try {
        // 1. ALTERAR NOME DE USUÁRIO
        if (novoNome !== user.nome_de_exibicao) {
            await enviar("trocarNomeUsuario", {
                id: id,
                nome: novoNome
            });
        }

        // 2. ALTERAR BIO
        if (bioNova !== (user.bio || "")) {
            await enviar("mudarBio", {
                id: id,
                bio: bioNova
            });
        }

        // Foto e cor são gravadas juntas para o usuário autenticado.
        if (fotoNova !== (user.foto_perfil || "") || corNova !== (user.cor_fundo || corPadrao)) {
            await enviar("mudarAparencia", { foto: fotoNova, cor_fundo: corNova });
        }

        // 4. ATUALIZAR INTERFACE
        setUser(previous => ({
            ...previous,
            nome_de_exibicao: novoNome,
            bio: bioNova,
            foto_perfil: fotoNova,
            cor_fundo: corNova
        }));

        setDraft(previous => ({
            ...previous,
            name: novoNome,
            cor_fundo: corNova,
            bio: bioNova,
            photoFile: null
        }));

        // 5. FECHAR MODAL
        setEditOpen(false);

        console.log("Perfil salvo com sucesso!");

    } catch (erro) {
        console.error("Erro ao salvar perfil:", erro);

        alert(
            "Não foi possível salvar o perfil: " +
            erro.message
        );

    } finally {
        setSavingProfile(false);
    }
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
  const atividadesConcluidas = Number(user.atvidades_concluidas_geral) || 0

  const totalPerguntas = Number(user.total_perguntas) || 0;

  const progressPercentage = (((atividadesConcluidas * 3) * 100) / totalPerguntas).toFixed(2)

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
                background={user.cor_fundo || corPadrao}
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
              <div className='estatisticas'>

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
                label="Atividades concluidas"
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

                <div className='progresso'>

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

                  <div className='subject'>
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

                  <div className='subject'>
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

                  <div className='subject'>
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

                  <div className='subject'>
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

                  <div className='subject'>
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

                  <div className='subject'>
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

      {editOpen && createPortal(


        <div
          className="profile-modal-backdrop"
          role="presentation"
          onMouseDown={() => { if (!savingProfile) setEditOpen(false); }}
        >

          <section
            className="profile-edit-modal"
            ref={editModalRef}
            tabIndex={-1}
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
              disabled={savingProfile}
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
                <div className="profile-customization-item">
                  <div className="profile-customization-square">
                    <Avatar
                      photo={draft.photo || user.foto_perfil}
                      background={draft.cor_fundo || corPadrao}
                      name={nomeUsuario || user.nome_de_exibicao}
                      className="profile-avatar-editor"
                    />
                    <button type="button" className="profile-pencil-button"
                      aria-label="Alterar mascote" title="Alterar mascote"
                      disabled={savingProfile} onClick={() => setFotoOpen(true)}>
                      <PencilIcon />
                    </button>
                  </div>
                  <span className="profile-customization-label">Mascote</span>
                </div>
                <div className="profile-customization-item">
                  <div className="profile-customization-square profile-color-preview"
                    style={{ backgroundColor: draft.cor_fundo || corPadrao }}>
                    <button type="button" className="profile-pencil-button"
                      aria-label="Alterar cor de fundo" title="Alterar cor de fundo"
                      disabled={savingProfile} onClick={() => setCorOpen(true)}>
                      <PencilIcon />
                    </button>
                  </div>
                  <span className="profile-customization-label">Cor de fundo</span>
                </div>
              </div>

              <label className="profile-username" htmlFor="profile-display-name">Nome de usuário</label>

              <input
                  id="profile-display-name"
                  maxLength={20}
                  className="trocarNomeUsuario"
                  placeholder="Digite seu novo nome"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
              />

              <p className="profile-username">
                @{user.nome_de_usuario}
              </p>

            <label className="profile-field">
                <span>Bio</span>

                <textarea
                  maxLength="255"
                  rows="4"
                  placeholder="Conte um pouco sobre você..."
                  value={draft.bio || ""}
                  onChange={(event) => {
                    const bioNova = event.target.value
                    setDraft({
                      ...draft,
                      bio: bioNova,
                    })}
                  }
                />

                <small>
                  {(draft.bio || "").length}/255
                </small>
              </label>

            <div className="edit-modal-actions">

                <button
                    className="profile-secondary-button"
                    type="button"
                    onClick={() => setEditOpen(false)}
                    disabled={savingProfile}
                >
                    Cancelar
                </button>

                <button
                    className="profile-primary-button"
                    type="submit"
                    disabled={savingProfile}
                >
                    {savingProfile
                        ? 'Salvando...'
                        : 'Salvar alterações'
                    }
                </button>

            </div>

            </form>

          </section>

          {(fotoOpen || corOpen) && createPortal(
            <div className="profile-modal-backdrop profile-picker-backdrop"
              onMouseDown={(event) => { event.stopPropagation(); setFotoOpen(false); setCorOpen(false); }}>
              <section className="profile-edit-modal profile-picker-modal"
                ref={pickerModalRef} tabIndex={-1} role="dialog" aria-modal="true"
                aria-labelledby="profile-picker-title"
                onMouseDown={(event) => event.stopPropagation()}>
                <button type="button" className="profile-modal-close"
                  onClick={() => { setFotoOpen(false); setCorOpen(false); }} aria-label="Fechar seleção">×</button>
                <div className="edit-modal-heading">
                  <p className="profile-kicker">{fotoOpen ? 'FAMÍLIA SÍMIO' : 'DO SEU JEITO'}</p>
                  <h2 id="profile-picker-title">{fotoOpen ? 'Escolha seu mascote' : 'Escolha sua cor'}</h2>
                </div>
                {fotoOpen ? (
                  <div className="profile-avatar-options">
                    {Object.entries(fotosPerfil).map(([id, src]) => (
                      <button key={id} type="button" className="profile-avatar-option"
                        aria-pressed={draft.photo === id} onClick={() => trocar(id)}>
                        <span className="profile-avatar-option-image"
                          style={{ backgroundColor: draft.cor_fundo || corPadrao }}>
                          <img src={src} alt="" />
                          {draft.photo === id && <span className="profile-selection-check" aria-hidden="true">✓</span>}
                        </span>
                        <span>{id.charAt(0).toUpperCase() + id.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="profile-color-options">
                    {coresPerfil.map(({ nome, valor }) => (
                      <button key={valor} type="button" className="profile-color-option"
                        aria-pressed={(draft.cor_fundo || corPadrao) === valor}
                        onClick={() => {
                          setDraft(previous => ({ ...previous, cor_fundo: valor }));
                          setCorOpen(false);
                        }}>
                        <span className="profile-color-swatch" style={{ backgroundColor: valor }}>
                          {(draft.cor_fundo || corPadrao) === valor && <span aria-hidden="true">✓</span>}
                        </span>
                        <span>{nome}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>, document.body
          )}

        </div>,
        document.body
      )}

    </>
  )
}

export default Perfil
