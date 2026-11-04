import { useEffect, useRef, useState } from 'react'
import './atividades.css'
import { useNavigate } from 'react-router-dom'
import LicaoConcluida from './LicaoConcluida'
import { resumirLicao } from './resultadoLicao.js'
import { registrarAcerto, registrarAtividadeConcluida } from '../utils/missoes'


function embaralhar(alternativas) {
    const itens = [...alternativas]
    for (let i = itens.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temporario = itens[i]
        itens[i] = itens[j]
        itens[j] = temporario
    }
    return itens
}

export default function Atividades({
    draft, setDraft, refAtividade, atividadeAtual, setAtividadeAtual, setAtvLiberada,
    materiaAtual, refEnunciado, refAlternativa1, refAlternativa2,
    refAlternativa3, refAlternativa4
}) {
    const navigate = useNavigate()
    const [mostrarErro, setMostrarErro] = useState(false)
    const [resultado, setResultado] = useState(null)
    const respostas = useRef(new Map())
    const total = useRef(0)
    const conclusaoPendente = useRef(false)
    const [questao, setQuestao] = useState('')
    const [alternativas, setAlternativas] = useState([])
    const [carregando, setCarregando] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [concluida, setConcluida] = useState(false)
    const [erro, setErro] = useState('')
    const bloqueado = useRef(false)
    const ordem = useRef(1)
    const sessao = useRef(0)
    const salvamentoEnviado = useRef(false)
    const refs = [refAlternativa1, refAlternativa2, refAlternativa3, refAlternativa4]

    function sair() {
        if (refAtividade.current) refAtividade.current.style.transform = 'translateX(100%)'
        const trilha = document.getElementById('trilha')
        if (trilha) trilha.style.opacity = '1'
        setAtividadeAtual(0)
    }

    async function concluir(versao) {
        conclusaoPendente.current = true
        if (salvamentoEnviado.current) {
            throw new Error('O salvamento já foi enviado. Confira o painel antes de repetir a lição.')
        }
        const id = Number(draft?.id)
        if (!Number.isInteger(id) || id <= 0) throw new Error('Seu perfil ainda não foi carregado. Saia e entre novamente na atividade.')
        salvamentoEnviado.current = true
        const controle = new AbortController()
        const limite = window.setTimeout(() => controle.abort(), 12000)
        let dados
        try {
            const resposta = await fetch('http://localhost:3000/concluirAtividade', {
                method: 'POST', signal: controle.signal,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    id, materia: materiaAtual, atividade: atividadeAtual,
                    atividadesConcluidas: draft.atividadesConcluidas
                })
            })
            dados = await resposta.json()
            if (!resposta.ok || dados.ok !== true) throw new Error(dados.message || 'O servidor não confirmou o salvamento.')
        } catch (error) {
            throw new Error(`${error.name === 'AbortError' ? 'O servidor demorou para responder.' : error.message} A conclusão pode ter sido salva; confira o painel antes de repetir a lição.`)
        } finally {
            window.clearTimeout(limite)
        }
        if (versao !== sessao.current) return
        setResultado(resumirLicao([...respostas.current.values()], total.current, dados.xp_ganho))
        registrarAtividadeConcluida(materiaAtual, atividadeAtual)
        setConcluida(true)
        setAtvLiberada(anterior => Math.max(anterior, Number(atividadeAtual) + 1))
        setDraft(anterior => {
            const atividadesConcluidas = [...(anterior.atividadesConcluidas || [])]
            atividadesConcluidas[0] = (Number(atividadesConcluidas[0]) || 0) + 1
            atividadesConcluidas[materiaAtual] = (Number(atividadesConcluidas[materiaAtual]) || 0) + 1
            return { ...anterior, atividadesConcluidas }
        })
    }

    async function carregarQuestao(indice, versao, signal) {
        ordem.current = indice
        setCarregando(true)
        setMostrarErro(false)
        try {
            const resposta = await fetch(`http://localhost:3000/atividades?materia=${materiaAtual}&atividadeAtual=${indice}`, { signal })
            if (!resposta.ok) throw new Error('Não foi possível carregar a questão.')
            const dados = await resposta.json()
            if (versao !== sessao.current) return
            if (dados.concluido) {
                throw new Error('A questão não foi encontrada. Tente carregá-la novamente.')
            }
            setQuestao(dados.pergunta)
            setAlternativas(embaralhar([
                dados.alternativa1, dados.alternativa2, dados.alternativa3, dados.alternativa4
            ].filter(Boolean)))
        } finally {
            if (versao === sessao.current) setCarregando(false)
        }
    }

    async function carregarLicao(versao, signal) {
        const resposta = await fetch(`http://localhost:3000/nome?id=${materiaAtual}`, { signal })
        if (!resposta.ok) throw new Error('Não foi possível carregar os dados da lição.')
        const dados = await resposta.json()
        if (versao !== sessao.current) return
        if (!Array.isArray(dados.nome)) throw new Error('A lista de questões não foi recebida.')
        const inicio = (Number(atividadeAtual) - 1) * 3
        total.current = dados.nome.slice(inicio, inicio + 3).length
        if (!total.current) throw new Error('Esta atividade ainda não tem questões disponíveis.')
        await carregarQuestao(inicio + 1, versao, signal)
    }

    useEffect(() => {
        if (!atividadeAtual) return
        const versao = ++sessao.current
        const controle = new AbortController()
        bloqueado.current = false
        salvamentoEnviado.current = false
        respostas.current.clear()
        total.current = 0
        conclusaoPendente.current = false
        setResultado(null)
        setConcluida(false)
        setSalvando(false)
        setErro('')
        setQuestao('')
        setAlternativas([])
        setCarregando(true)
        carregarLicao(versao, controle.signal)
            .catch(error => {
                if (error.name !== 'AbortError' && versao === sessao.current) { setErro(error.message); setCarregando(false) }
            })
        return () => { controle.abort(); sessao.current++ }
    }, [atividadeAtual, materiaAtual])

    async function verificar(alternativa, botao) {
        if (
            bloqueado.current ||
            carregando ||
            concluida ||
            conclusaoPendente.current
        ) return

        bloqueado.current = true
        setSalvando(true)
        setErro('')

        const versao = sessao.current

        try {
            const correta = Number(alternativa.verdadeira) === 1

            respostas.current.set(crypto.randomUUID(), {
                questao: ordem.current,
                correta
            })

            if (!correta) {
                setMostrarErro(true)

                const movimentoReduzido = window.matchMedia(
                    '(prefers-reduced-motion: reduce)'
                ).matches

                botao.getAnimations().forEach(animacao => {
                    animacao.cancel()
                })

                botao.animate(
                    [
                        { translate: '0 0', backgroundColor: '#FFE4DE' },
                        { translate: '-9px 0', backgroundColor: '#FFE4DE' },
                        { translate: '7px 0', backgroundColor: '#FFE4DE' },
                        { translate: '-5px 0', backgroundColor: '#FFE4DE' },
                        { translate: '3px 0', backgroundColor: '#FFE4DE' },
                        { translate: '0 0' }
                    ],
                    {
                        duration: movimentoReduzido ? 0 : 420,
                        easing: 'ease-out'
                    }
                )

                return
            }

            setMostrarErro(false)
            registrarAcerto(materiaAtual, ordem.current)

            const inicio = (Number(atividadeAtual) - 1) * 3

            if (ordem.current - inicio >= total.current) {
                await concluir(versao)
            } else {
                await carregarQuestao(ordem.current + 1, versao)
            }
        } catch (error) {
            if (versao === sessao.current) {
                setErro(error.message)
            }
        } finally {
            if (versao === sessao.current) {
                bloqueado.current = false
                setSalvando(false)
            }
        }
    }

    async function tentarNovamente() {
        if (bloqueado.current) return
        bloqueado.current = true
        setSalvando(true)
        setErro('')
        const versao = sessao.current
        try {
            if (conclusaoPendente.current) await concluir(versao)
            else if (!total.current) await carregarLicao(versao)
            else await carregarQuestao(ordem.current, versao)
        } catch (error) {
            if (versao === sessao.current) setErro(error.message)
        } finally {
            if (versao === sessao.current) {
                bloqueado.current = false
                setCarregando(false)
                setSalvando(false)
            }
        }
    }

    return (
        <>
            <div className={`atividade${concluida ? " atividade--concluida" : ""}`} id="atividade" ref={refAtividade} inert={concluida || !atividadeAtual}>
                <button type="button" onClick={sair}>Sair</button>
                <h1 className="enunciado" id="enunciado" ref={refEnunciado}>
                    {carregando ? 'Carregando...' : questao}
                </h1>
                {alternativas.map((alternativa, indice) => (
                    <button type="button" key={alternativa.id_alternativa}
                        className={`alternativa${indice + 1}`} id={`alternativa${indice + 1}`}
                        ref={refs[indice]} disabled={carregando || salvando || concluida || conclusaoPendente.current || Boolean(erro)}
                        onClick={event => verificar(alternativa, event.currentTarget)}>
                        {alternativa.texto}
                    </button>
                ))}

                {mostrarErro && (
                    <div className="atividade-feedback-erro" role="status">
                        <span className="atividade-feedback-erro__icone" aria-hidden="true">
                            ×
                        </span>

                        <div>
                            <strong>Quase lá!</strong>
                            <p>Tente outra alternativa. Você consegue!</p>
                        </div>
                    </div>
                )}

                {erro && <div className="atividade-erro" role="alert"><p>{erro}</p>
                    <button type="button" onClick={tentarNovamente} disabled={salvando || salvamentoEnviado.current}>Tentar novamente</button>
                </div>}
            </div>
            {concluida && resultado && <LicaoConcluida
                resultado={resultado} atividade={atividadeAtual}
                onContinuar={() => {
                    setConcluida(false)
                    sair()
                    requestAnimationFrame(() => document.querySelector('#trilha .atual')?.focus())
                }}
                onInicio={() => { setConcluida(false); sair(); navigate('/painel') }}
            />}
        </>
    )
}
