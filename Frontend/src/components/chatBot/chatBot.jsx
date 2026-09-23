import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import './chatBot.css'

import mascotePadrao from '../../assets/MOKI.png'

const sugestoes = [
  { icone: 'livro', titulo: 'Entender um conteúdo', detalhe: 'Uma explicação, passo a passo.', texto: 'Explique a diferença entre substantivo e adjetivo com exemplos simples.' },
  { icone: 'lapis', titulo: 'Praticar gramática', detalhe: 'Aprenda colocando em prática.', texto: 'Crie um exercício de concordância verbal. Espere minha resposta antes de mostrar a solução.' },
  { icone: 'texto', titulo: 'Interpretar um texto', detalhe: 'Descubra o que está nas entrelinhas.', texto: 'Crie um texto curto e uma pergunta de interpretação. Espere minha resposta antes de explicar.' },
]

function Icone({ nome, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {nome === 'livro' ? <><path d="M12 5v15M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2Z" /></> : nome === 'lapis' ? <><path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z" /></> : nome === 'enviar' ? <><path d="M12 19V5m-6 6 6-6 6 6" /></> : <><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h4" /></>}
  </svg>
}

function Avatar({ src, grande = false }) {
  const [falhou, setFalhou] = useState(false)
  useEffect(() => setFalhou(false), [src])
  return <span className={`simia-avatar${grande ? ' simia-avatar-grande' : ''}`} aria-hidden="true">
    {src && !falhou ? <img src={src} alt="" onError={() => setFalhou(true)} /> : <span>Si<span className="simia-avatar-ponto">.</span></span>}
  </span>
}

export default function ChatBot({ mascoteSrc = mascotePadrao, endpoint = 'http://localhost:4000/api/chat' }) {
  const [mensagens, setMensagens] = useState([])
  const [texto, setTexto] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [ultimaMensagem, setUltimaMensagem] = useState('')
  const inputRef = useRef(null)
  const historicoRef = useRef(null)
  const pertoDoFim = useRef(true)
  const requisicao = useRef(null)
  const ocupado = useRef(false)

  useEffect(() => () => requisicao.current?.abort(), [])
  useEffect(() => {
    const input = inputRef.current
    if (input) { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 140)}px` }
  }, [texto])
  useEffect(() => {
    const historico = historicoRef.current
    if (historico && pertoDoFim.current) historico.scrollTop = historico.scrollHeight
  }, [mensagens, carregando, erro])

  async function enviarMensagem(mensagemBruta = texto, repetir = false) {
    const mensagem = mensagemBruta.trim()
    if (!mensagem || ocupado.current) return
    ocupado.current = true
    const controller = new AbortController()
    requisicao.current = controller
    const timeout = setTimeout(() => controller.abort(), 120000)
    pertoDoFim.current = true
    setErro('')
    setUltimaMensagem(mensagem)
    if (!repetir) {
      setMensagens(prev => [...prev, { tipo: 'usuario', texto: mensagem }])
      setTexto('')
    }
    setCarregando(true)
    try {
      const resposta = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem }), signal: controller.signal,
      })
      if (!resposta.ok) throw new Error('Falha na resposta')
      const dados = await resposta.json()
      if (typeof dados.resposta !== 'string' || !dados.resposta.trim()) throw new Error('Resposta vazia')
      const html = DOMPurify.sanitize(marked.parse(dados.resposta))
      setMensagens(prev => [...prev, { tipo: 'ia', texto: html }])
    } catch {
      setErro('Não consegui responder agora. Tente novamente em instantes.')
    } finally {
      clearTimeout(timeout)
      ocupado.current = false
      requisicao.current = null
      setCarregando(false)
    }
  }

  return <section className="chatIA" aria-label="Chat de estudos da SimIA">
    <div className="simia-container">
      <header className="simia-header">
        <div className="simia-identidade">
          <Avatar src={mascoteSrc} />
          <div><div className="simia-nome">SimIA <span className="simia-badge">IA</span></div><p>Seu apoio em Língua Portuguesa</p></div>
        </div>
        <span className="simia-etiqueta"><span />ESPAÇO DE ESTUDO</span>
      </header>

      <div className="simia-conteudo" ref={historicoRef} onScroll={e => {
        const el = e.currentTarget
        pertoDoFim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100
      }}>
        {mensagens.length === 0 ? <div className="simia-boas-vindas">
          <Avatar src={mascoteSrc} grande />
          <span className="simia-sobretitulo">UM PASSO DE CADA VEZ</span>
          <h1>Qual dúvida vamos<br /><span>resolver hoje?</span></h1>
          <p>Da primeira pergunta até aquele “agora entendi”.<br className="simia-quebra" /> Vamos aprender Português juntos.</p>
          <div className="simia-sugestoes">
            {sugestoes.map(item => <button type="button" key={item.titulo} onClick={() => enviarMensagem(item.texto)}>
              <span className="simia-icone-cartao"><Icone nome={item.icone} /></span>
              <strong>{item.titulo}</strong><span>{item.detalhe}</span><span className="simia-seta" aria-hidden="true">↗</span>
            </button>)}
          </div>
          <span className="simia-convite">Escolha um caminho ou escreva sua dúvida abaixo.</span>
        </div> : <div className="simia-historico" role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions">
          {mensagens.map((mensagem, index) => <article className={`simia-mensagem simia-mensagem-${mensagem.tipo}`} key={index}>
            {mensagem.tipo === 'ia' && <Avatar src={mascoteSrc} />}
            <div className="simia-corpo-mensagem"><span className="simia-autor">{mensagem.tipo === 'ia' ? 'SimIA' : 'Você'}</span>
              {mensagem.tipo === 'ia' ? <div className="simia-markdown" dangerouslySetInnerHTML={{ __html: mensagem.texto }} /> : <p className="simia-texto-usuario">{mensagem.texto}</p>}
            </div>
          </article>)}
        </div>}
        {carregando && <div className="simia-pensando" role="status"><Avatar src={mascoteSrc} /><span>Preparando uma explicação</span><span className="simia-pontos" aria-hidden="true"><i /><i /><i /></span></div>}
        {erro && <div className="simia-erro"><p role="alert">{erro}</p><button type="button" onClick={() => enviarMensagem(ultimaMensagem, true)}>Tentar novamente</button></div>}
      </div>

      <footer className="simia-rodape">
        <form className="simia-compositor" onSubmit={e => { e.preventDefault(); enviarMensagem() }}>
          <label className="simia-sr-only" htmlFor="simia-pergunta">Sua dúvida de Português</label>
          <textarea id="simia-pergunta" ref={inputRef} rows={1} placeholder="Escreva sua dúvida de Português…" value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); enviarMensagem() }
          }} />
          <button type="submit" className="simia-enviar" disabled={carregando || !texto.trim()} aria-label="Enviar mensagem"><Icone nome="enviar" /></button>
        </form>
        <div className="simia-notas"><span>A SimIA pode cometer erros. Confira as explicações.</span><span>Enter envia · Shift + Enter quebra a linha</span></div>
      </footer>
    </div>
  </section>
}
