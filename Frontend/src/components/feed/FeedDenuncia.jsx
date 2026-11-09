import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const API_URL = 'http://localhost:3000'
const motivos = [
    { valor: 'ofensivo', nome: 'Conteúdo ofensivo' },
    { valor: 'spam', nome: 'Spam ou propaganda' },
    { valor: 'informacao_errada', nome: 'Informação incorreta' },
    { valor: 'outro', nome: 'Outro motivo' }
]

export default function FeedDenuncia({ alvo, aoFechar, aoEnviado }) {
    const dialogo = useRef(null)
    const [motivo, setMotivo] = useState('')
    const [descricao, setDescricao] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState('')
    const ehComentario = Boolean(alvo.id_comentario)

    useEffect(() => {
        const elemento = dialogo.current
        elemento.showModal()
        return () => elemento.close()
    }, [])

    async function enviar(event) {
        event.preventDefault()
        if (enviando) return
        if (!motivos.some(item => item.valor === motivo)) {
            setErro('Selecione o motivo da denúncia.')
            return
        }
        setEnviando(true)
        setErro('')
        try {
            const resposta = await fetch(`${API_URL}/feed/denuncias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    id_post: alvo.id_post || null,
                    id_comentario: alvo.id_comentario || null,
                    motivo,
                    descricao: descricao.trim()
                })
            })
            const dados = await resposta.json()
            if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível enviar a denúncia.')
            aoEnviado()
        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setEnviando(false)
        }
    }

    return createPortal(
        <dialog
            ref={dialogo}
            className="feed-modal feed-editor-dialog feed-report-dialog"
            aria-label={ehComentario ? 'Denunciar comentário' : 'Denunciar publicação'}
            onMouseDown={event => event.stopPropagation()}
            onCancel={event => {
                event.preventDefault()
                if (!enviando) aoFechar()
            }}
        >
            <form onSubmit={enviar}>
                <header className="feed-modal-header">
                    <div>
                        <span>DENÚNCIA</span>
                        <h2>{ehComentario ? 'Denunciar comentário' : 'Denunciar publicação'}</h2>
                    </div>
                    <button type="button" onClick={aoFechar} disabled={enviando} aria-label="Fechar denúncia">×</button>
                </header>
                <p className="feed-report-intro">Escolha o motivo. Sua denúncia será encaminhada para análise.</p>
                {erro && <div className="feed-error" role="alert">{erro}</div>}
                <label>
                    Motivo
                    <select value={motivo} onChange={event => setMotivo(event.target.value)} required autoFocus disabled={enviando}>
                        <option value="" disabled>Selecione um motivo</option>
                        {motivos.map(item => <option key={item.valor} value={item.valor}>{item.nome}</option>)}
                    </select>
                </label>
                <label>
                    Descrição (opcional)
                    <textarea value={descricao} onChange={event => setDescricao(event.target.value)} maxLength={300} disabled={enviando} placeholder="Conte brevemente o que aconteceu..." />
                </label>
                <footer className="feed-modal-footer">
                    <span>{descricao.length}/300 caracteres</span>
                    <div className="feed-editor-buttons">
                        <button type="button" className="feed-editor-cancel" onClick={aoFechar} disabled={enviando}>Cancelar</button>
                        <button type="submit" className="feed-publish" disabled={enviando || !motivo}>
                            {enviando ? 'Enviando...' : 'Enviar denúncia'}
                        </button>
                    </div>
                </footer>
            </form>
        </dialog>,
        document.querySelector('.feed-page')
    )
}
