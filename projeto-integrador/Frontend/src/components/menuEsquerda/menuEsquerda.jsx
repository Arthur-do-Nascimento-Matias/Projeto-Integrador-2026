import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './menuEsquerda.css'
import Moki from '../../assets/MOKI.png'

const itensPrincipais = [
  { nome: 'Aprender', rota: '/' },
  { nome: 'Simulados', rota: null },
  { nome: 'Ranking', rota: null },
  { nome: 'Biblioteca', rota: '/biblioteca' },
  { nome: 'SimIA', rota: '/chatBot', lightning: true },
  { nome: 'Feed', rota: null },
]

const itensSecundarios = [
  { nome: 'Perfil', rota: '/perfil' },
  { nome: 'Configurações', rota: null },
]

const fxMap = {
  Aprender: 'fx-home',
  Simulados: 'fx-activities',
  Ranking: 'fx-trophy',
  Biblioteca: 'fx-book',
  SimIA: 'fx-simia',
  Feed: 'fx-feed',
  Perfil: 'fx-profile',
  Configurações: 'fx-settings',
}

function nomePelaRota(pathname) {
  if (pathname === '/biblioteca') return 'Biblioteca'
  if (pathname === '/chatBot') return 'SimIA'
  if (pathname === '/perfil') return 'Perfil'
  return 'Aprender'
}

function Icone({ nome }) {
  if (nome === 'Aprender') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.7 12 3l9 7.7" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    )
  }

  if (nome === 'Simulados') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 4h6" />
        <path d="M9 2h6v4H9z" />
        <rect x="5" y="5" width="14" height="17" rx="2" />
        <path d="M8 10h8M8 14h8M8 18h6" />
      </svg>
    )
  }

  if (nome === 'Ranking') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
        <path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4" />
        <path d="M12 12v5M8 21h8M9 17h6v4" />
        <path d="m12 6 .7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2L12 6Z" />
      </svg>
    )
  }

  if (nome === 'Biblioteca') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 6.5c-1.4-1.4-3.2-2.1-5.5-2.1H4.5v13.8h2c2.2 0 4 .7 5.5 2" />
        <path d="M12 6.5c1.4-1.4 3.2-2.1 5.5-2.1h2v13.8h-2c-2.2 0-4 .7-5.5 2" />
        <path d="M12 6.5v13.7" />
        <path d="M7.2 8.2h2.2M14.6 8.2h2.2" />
      </svg>
    )
  }

  if (nome === 'SimIA') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.3 2 5 13h6l-1 9 9-12h-6l.3-8Z" />
      </svg>
    )
  }

  if (nome === 'Feed') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14" />
        <path d="M5 10h14" />
        <path d="M5 15h9" />
        <path d="M5 20h6" />
      </svg>
    )
  }

  if (nome === 'Perfil') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7.6Z" />
    </svg>
  )
}

function MenuEsquerda() {
  const navigate = useNavigate()
  const location = useLocation()
  const sidebarRef = useRef(null)
  const shellRef = useRef(null)
  const railRef = useRef(null)
  const itemRefs = useRef(new Map())
  const fxTimerRef = useRef(null)

  const ativoDaRota = nomePelaRota(location.pathname)
  const [itemAtivo, setItemAtivo] = useState(ativoDaRota)
  const [menuAberto, setMenuAberto] = useState(ativoDaRota === 'Perfil')
  const [efeitoAtivo, setEfeitoAtivo] = useState('')
  const [itemComEfeito, setItemComEfeito] = useState('')
  const [touchLike, setTouchLike] = useState(false)

  useEffect(() => {
    setItemAtivo(ativoDaRota)
    if (ativoDaRota === 'Perfil') setMenuAberto(true)
  }, [ativoDaRota])

  useEffect(() => {
    const media = window.matchMedia('(hover: none), (pointer: coarse)')
    const atualizar = () => setTouchLike(media.matches)
    atualizar()
    media.addEventListener?.('change', atualizar)
    return () => media.removeEventListener?.('change', atualizar)
  }, [])

  const posicionarRail = useCallback(() => {
    const shell = shellRef.current
    const rail = railRef.current
    const item = itemRefs.current.get(itemAtivo)
    if (!shell || !rail || !item) return

    const shellRect = shell.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const top = itemRect.top - shellRect.top + (itemRect.height - 40) / 2
    rail.style.top = `${top}px`
  }, [itemAtivo])

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(posicionarRail)
    return () => cancelAnimationFrame(frame)
  }, [posicionarRail, menuAberto])

  useEffect(() => {
    const aoRedimensionar = () => requestAnimationFrame(posicionarRail)
    window.addEventListener('resize', aoRedimensionar)
    return () => window.removeEventListener('resize', aoRedimensionar)
  }, [posicionarRail])

  useEffect(() => {
    const aoPressionarTecla = (event) => {
      if (event.key === 'Escape') setMenuAberto(false)
    }

    const aoClicarFora = (event) => {
      if (!touchLike || !menuAberto) return
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMenuAberto(false)
      }
    }

    document.addEventListener('keydown', aoPressionarTecla)
    document.addEventListener('pointerdown', aoClicarFora)

    return () => {
      document.removeEventListener('keydown', aoPressionarTecla)
      document.removeEventListener('pointerdown', aoClicarFora)
    }
  }, [menuAberto, touchLike])

  useEffect(() => () => clearTimeout(fxTimerRef.current), [])

  function criarRipple(target, event) {
    const ripple = document.createElement('span')
    ripple.className = 'ripple'

    const rect = target.getBoundingClientRect()
    const x = event.clientX ? event.clientX - rect.left : rect.width / 2
    const y = event.clientY ? event.clientY - rect.top : rect.height / 2

    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    target.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
  }

  function iniciarEfeito(nome) {
    const efeito = fxMap[nome]
    if (!efeito) return

    clearTimeout(fxTimerRef.current)
    setItemComEfeito('')
    setEfeitoAtivo('')

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setItemComEfeito(nome)
        setEfeitoAtivo(efeito)
      })
    })

    fxTimerRef.current = setTimeout(() => {
      setItemComEfeito('')
      setEfeitoAtivo('')
    }, 980)
  }

  function aoSelecionar(item, event) {
    event.preventDefault()
    criarRipple(event.currentTarget, event)
    setItemAtivo(item.nome)
    iniciarEfeito(item.nome)

    if (item.rota && location.pathname !== item.rota) {
      navigate(item.rota)
    }
  }

  function aoMoverPonteiro(event) {
    if (touchLike) return
    const icon = event.currentTarget.querySelector('.icon-wrap')
    if (!icon) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    icon.style.setProperty('--mx', `${x * 7}px`)
    icon.style.setProperty('--my', `${y * 5}px`)
  }

  function aoSairPonteiro(event) {
    const icon = event.currentTarget.querySelector('.icon-wrap')
    if (!icon) return
    icon.style.setProperty('--mx', '0px')
    icon.style.setProperty('--my', '0px')
  }

  function renderItem(item) {
    const classes = [
      'nav-item',
      item.nome === itemAtivo ? 'active' : '',
      item.lightning ? 'lightning' : '',
      item.nome === itemComEfeito ? efeitoAtivo : '',
    ].filter(Boolean).join(' ')

    return (
      <a
        key={item.nome}
        ref={(elemento) => {
          if (elemento) itemRefs.current.set(item.nome, elemento)
          else itemRefs.current.delete(item.nome)
        }}
        className={classes}
        href={item.rota || '#'}
        data-name={item.nome}
        aria-label={item.nome}
        aria-current={item.rota === location.pathname ? 'page' : undefined}
        onClick={(event) => aoSelecionar(item, event)}
        onPointerMove={aoMoverPonteiro}
        onPointerLeave={aoSairPonteiro}
      >
        <span className="icon-wrap">
          <Icone nome={item.nome} />
        </span>
        <span className="label">{item.nome}</span>
        {item.nome === 'SimIA' && <span className="ia-badge">IA</span>}
      </a>
    )
  }

  return (
    <div className="simio-sidebar-layer" aria-label="Navegação SimioLab">
      <div className="scene">
        <div className="ambient" aria-hidden="true" />

        <div className="simio-logo" aria-label="SimioLab">
        <img src={Moki} className="mascote" alt="Mascote SimioLab" />

        <div className="logo-box">
          <div className="simio">Simio</div>
          <div className="lab"><span>LAB</span></div>
        </div>
      </div>

      <aside
        className={`sidebar${menuAberto ? ' more-open' : ''}${touchLike && menuAberto ? ' pin-open' : ''}`}
        ref={sidebarRef}
      >
        <div className="shell" ref={shellRef}>
          <div className="active-rail" ref={railRef} aria-hidden="true" />

          <nav aria-label="Menu principal">
            <div className="main-menu">
              {itensPrincipais.map(renderItem)}
            </div>

            <div className="lower">
              <div className="divider" />

              <div className="more-menu" id="moreMenu">
                <div className="more-menu-inner">
                  {itensSecundarios.map(renderItem)}
                </div>
              </div>

              <button
                className="menu-toggle"
                type="button"
                aria-expanded={menuAberto}
                aria-controls="moreMenu"
                aria-label={menuAberto ? 'Fechar menu secundário' : 'Abrir menu secundário'}
                onClick={(event) => {
                  criarRipple(event.currentTarget, event)
                  setMenuAberto((aberto) => !aberto)
                }}
                onPointerMove={aoMoverPonteiro}
                onPointerLeave={aoSairPonteiro}
              >
                <span className="icon-wrap" aria-hidden="true">
                  <span className="hamburger">
                    <span />
                    <span />
                    <span />
                  </span>
                </span>
                <span className="label">{menuAberto ? 'Fechar menu' : 'Mais opções'}</span>
              </button>
            </div>
          </nav>
        </div>
        </aside>
      </div>
    </div>
  )
}

export default MenuEsquerda
