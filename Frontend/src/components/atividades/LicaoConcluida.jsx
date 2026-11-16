import { useEffect, useRef, useState } from 'react'
import mokiTrofeu from '../../assets/mokiTrofeu.png'
import './LicaoConcluida.css'

if (typeof window !== 'undefined') {
    const imagem = new window.Image()
    imagem.src = mokiTrofeu
    imagem.decode?.().catch(() => { })
}

function Icone({ tipo, ...props }) {
    return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
            {tipo === 'raio' ? <path d="M18 3 6 18h9l-1 11 12-16h-9l1-10Z" fill="currentColor" />
                : tipo === 'alvo' ? <><circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.5" /><circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2.5" /><circle cx="16" cy="16" r="2" fill="currentColor" /></>
                    : <><rect x="7" y="6" width="19" height="23" rx="4" stroke="currentColor" strokeWidth="2.5" /><rect x="12" y="3" width="9" height="6" rx="2" fill="currentColor" /><path d="m12 19 3 3 6-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></>}
        </svg>
    )
}

export default function LicaoConcluida({ resultado, atividade, onContinuar, onInicio }) {
    const titulo = useRef(null)
    const tela = useRef(null)
    const animacaoSaida = useRef(null)
    const bloqueado = useRef(false)
    const [saindo, setSaindo] = useState(false)
    useEffect(() => {
        const overflowAnterior = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.scrollTo(0, 0)
        window.dispatchEvent(new Event('scroll'))
        titulo.current?.focus({ preventScroll: true })
        const elementos = [...document.querySelectorAll('#trilha, .materias-container, .menuLateralDireita, .simio-sidebar-layer')]
        const anteriores = elementos.map(elemento => elemento.inert)
        elementos.forEach(elemento => { elemento.inert = true })
        return () => {
            document.body.style.overflow = overflowAnterior
            animacaoSaida.current?.cancel()
            elementos.forEach((elemento, indice) => { elemento.inert = anteriores[indice] })
        }
    }, [])
    async function sairComTransicao(acao) {
        if (bloqueado.current) return
        bloqueado.current = true
        setSaindo(true)
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && tela.current?.animate) {
            animacaoSaida.current = tela.current.animate([
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(-12px)' }
            ], { duration: 220, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' })
            try { await animacaoSaida.current.finished } catch { return }
        }
        if (tela.current) acao()
    }
    const precisao = resultado.tentativas > 0
        ? Math.round(resultado.acertos / resultado.tentativas * 100) : 0

    return (
        <section ref={tela} className="sl-conclusao" aria-busy={saindo} aria-labelledby="sl-conclusao-titulo">
            <div className="sl-conclusao__ambiente" aria-hidden="true">
                <i className="sl-conclusao__orbita" />
                <i className="sl-conclusao__folha sl-conclusao__folha--um" />
                <i className="sl-conclusao__folha sl-conclusao__folha--dois" />
                <span className="sl-conclusao__estrela sl-conclusao__estrela--canto">✦</span>
            </div>

            <div className="sl-conclusao__conteudo">
                <header className="sl-conclusao__cabecalho">
                    <h1
                        id="sl-conclusao-titulo"
                        ref={titulo}
                        tabIndex={-1}
                    >
                        LIÇÃO CONCLUÍDA!
                    </h1>
                </header>

                <div className="sl-conclusao__palco">
                    <div className="sl-conclusao__halo" aria-hidden="true" />
                    <span className="sl-conclusao__estrela sl-conclusao__estrela--um" aria-hidden="true">✦</span>
                    <span className="sl-conclusao__estrela sl-conclusao__estrela--dois" aria-hidden="true">✧</span>
                    <span className="sl-conclusao__estrela sl-conclusao__estrela--tres" aria-hidden="true">✦</span>
                    <div className="sl-conclusao__confetes" aria-hidden="true">
                        {Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--i': i }} />)}
                    </div>
                    <svg className="sl-conclusao__moki" viewBox="620 130 700 800" role="img" aria-label="Moki comemorando com seu troféu">
                        <image href={mokiTrofeu} width="1920" height="1080" />
                    </svg>
                    <span className="sl-conclusao__sombra" aria-hidden="true" />
                    <span className="sl-conclusao__bilhete" aria-hidden="true">Bom trabalho! <span>✓</span></span>
                </div>

                <dl className="sl-conclusao__recompensas" aria-label="Resultados da lição">
                    <div className="sl-conclusao__metrica sl-conclusao__metrica--xp">
                        <dt><span className="sl-conclusao__icone"><Icone tipo="raio" /></span><span>XP CONQUISTADO</span></dt>
                        <dd>+{resultado.xp.toLocaleString('pt-BR')} <small>XP</small></dd>
                    </div>
                    <div className="sl-conclusao__metrica">
                        <dt><span className="sl-conclusao__icone"><Icone tipo="alvo" /></span><span>PRECISÃO</span></dt>
                        <dd>{precisao}<small>%</small></dd>
                    </div>
                    <div className="sl-conclusao__metrica">
                        <dt><span className="sl-conclusao__icone"><Icone tipo="tarefas" /></span><span>QUESTÕES</span></dt>
                        <dd>{resultado.concluidas}<small>/{resultado.total}</small></dd>
                    </div>
                </dl>
                <nav className="sl-conclusao__acoes" aria-label="Próximos passos">
                    <button type="button" className="sl-conclusao__continuar" disabled={saindo} onClick={() => sairComTransicao(onContinuar)}>CONTINUAR <span aria-hidden="true">→</span></button>
                </nav>
            </div>
        </section>
    )
}
