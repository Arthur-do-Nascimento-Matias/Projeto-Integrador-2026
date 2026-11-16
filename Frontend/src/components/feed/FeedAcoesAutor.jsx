import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const API_URL = 'http://localhost:3000'

async function alterarConteudo(acao, tipo, item, campos = {}) {
    const resposta = await fetch(`${API_URL}/feed/conteudo/${acao}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            ...campos,
            tipo,
            id: tipo === 'post' ? item.id_post : item.id_comentario
        })
    })
    const dados = await resposta.json()
    if (!resposta.ok || !dados.ok) {
        throw new Error(dados.erro || 'Não foi possível alterar o conteúdo.')
    }
}

function Editor({ tipo, item, aoFechar, aoAtualizar }) {
    const dialogo = useRef(null)
    const [titulo, setTitulo] = useState(item.titulo || '')
    const [conteudo, setConteudo] = useState(item.conteudo || '')
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState('')
    const ehPost = tipo === 'post'

    useEffect(() => {
        const elemento = dialogo.current
        elemento.showModal()
        return () => elemento.close()
    }, [])

    async function salvar(event) {
        event.preventDefault()
        if (salvando || !conteudo.trim() || (ehPost && !titulo.trim())) return
        setSalvando(true)
        setErro('')
        try {
            await alterarConteudo('editar', tipo, item, { titulo, conteudo })
            await aoAtualizar('editar')
            aoFechar()
        } catch (erroAtual) {
            setErro(erroAtual.message)
        } finally {
            setSalvando(false)
        }
    }

    return (
        <dialog
            ref={dialogo}
            className="feed-modal feed-editor-dialog"
            aria-label={ehPost ? 'Editar sua publicação' : 'Editar seu comentário'}
            onCancel={event => {
                event.preventDefault()
                if (!salvando) aoFechar()
            }}
        >
            <form onSubmit={salvar}>
                <header className="feed-modal-header">
                    <div>
                        <span>SEU CONTEÚDO</span>
                        <h2>{ehPost ? 'Editar publicação' : 'Editar comentário'}</h2>
                    </div>
                    <button type="button" onClick={aoFechar} disabled={salvando} aria-label="Fechar edição">×</button>
                </header>
                {erro && <div className="feed-error" role="alert">{erro}</div>}
                {ehPost && (
                    <label>
                        Título
                        <input value={titulo} onChange={event => setTitulo(event.target.value)} maxLength={160} required autoFocus disabled={salvando} />
                    </label>
                )}
                <label>
                    {ehPost ? 'Conteúdo' : 'Comentário'}
                    <textarea value={conteudo} onChange={event => setConteudo(event.target.value)} maxLength={ehPost ? 5000 : 3000} required autoFocus={!ehPost} disabled={salvando} />
                </label>
                <footer className="feed-modal-footer">
                    <span>{conteudo.length}/{ehPost ? 5000 : 3000} caracteres</span>
                    <div className="feed-editor-buttons">
                        <button type="button" className="feed-editor-cancel" onClick={aoFechar} disabled={salvando}>Cancelar</button>
                        <button type="submit" className="feed-publish" disabled={salvando || !conteudo.trim() || (ehPost && !titulo.trim())}>
                            {salvando ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </footer>
            </form>
        </dialog>
    )
}

function ConfirmacaoExcluir({ tipo, ocupado, erro, aoCancelar, aoConfirmar }) {
    const dialogo = useRef(null)
    const ehPost = tipo === 'post'

    useEffect(() => {
        const elemento = dialogo.current
        elemento.showModal()
        return () => elemento.close()
    }, [])

    return (
        <dialog
            ref={dialogo}
            className="feed-modal feed-editor-dialog feed-confirm-dialog"
            aria-label={ehPost ? 'Confirmar exclusão da publicação' : 'Confirmar exclusão do comentário'}
            onCancel={event => {
                event.preventDefault()
                if (!ocupado) aoCancelar()
            }}
            onClick={event => {
                if (ocupado || event.target !== event.currentTarget) return
                const area = event.currentTarget.getBoundingClientRect()
                if (event.clientX < area.left || event.clientX > area.right || event.clientY < area.top || event.clientY > area.bottom) aoCancelar()
            }}
        >
            <header className="feed-confirm-header">
                <span>SEU CONTEÚDO</span>
                <button type="button" onClick={aoCancelar} disabled={ocupado} aria-label="Fechar confirmação">×</button>
            </header>
            <div className="feed-confirm-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
                </svg>
            </div>
            <h2>{ehPost ? 'Excluir esta publicação?' : 'Excluir este comentário?'}</h2>
            <p>{ehPost ? 'Sua publicação deixará de aparecer no feed.' : 'Seu comentário deixará de aparecer na conversa.'}</p>
            {erro && <div className="feed-error" role="alert">{erro}</div>}
            <div className="feed-confirm-buttons">
                <button type="button" className="feed-editor-cancel" onClick={aoCancelar} disabled={ocupado} autoFocus>Cancelar</button>
                <button type="button" className="feed-confirm-delete" onClick={aoConfirmar} disabled={ocupado}>
                    {ocupado ? 'Excluindo...' : 'Excluir'}
                </button>
            </div>
        </dialog>
    )
}

export default function FeedAcoesAutor({ tipo, item, aoAtualizar, aoExcluir }) {
    const [editando, setEditando] = useState(false)
    const [excluindo, setExcluindo] = useState(false)
    const [confirmando, setConfirmando] = useState(false)
    const [erroExclusao, setErroExclusao] = useState('')
    const nome = tipo === 'post' ? 'publicação' : 'comentário'

    async function excluir() {
        if (excluindo) return
        setExcluindo(true)
        setErroExclusao('')
        try {
            await alterarConteudo('excluir', tipo, item)
            await aoAtualizar('excluir')
            setConfirmando(false)
            aoExcluir?.()
        } catch (erro) {
            setErroExclusao(erro.message)
        } finally {
            setExcluindo(false)
        }
    }

    return (
        <>
            <div className="feed-owner-actions">
                <button type="button" onClick={() => setEditando(true)} disabled={excluindo} aria-label={`Editar ${nome}`} title={`Editar ${nome}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 5 4 4M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15l-1 6 5-2" />
                    </svg>
                </button>
                <button type="button" className="feed-owner-delete" onClick={() => { setErroExclusao(''); setConfirmando(true) }} disabled={excluindo} aria-label={`Excluir ${nome}`} title={`Excluir ${nome}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
                    </svg>
                </button>
            </div>
            {confirmando && createPortal(
                <ConfirmacaoExcluir
                    tipo={tipo}
                    ocupado={excluindo}
                    erro={erroExclusao}
                    aoCancelar={() => setConfirmando(false)}
                    aoConfirmar={excluir}
                />,
                document.querySelector('.feed-page')
            )}
            {editando && createPortal(
                <Editor tipo={tipo} item={item} aoFechar={() => setEditando(false)} aoAtualizar={aoAtualizar} />,
                document.querySelector('.feed-page')
            )}
        </>
    )
}
