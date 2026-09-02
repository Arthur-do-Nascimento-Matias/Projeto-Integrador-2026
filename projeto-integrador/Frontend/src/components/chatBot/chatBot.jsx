import { useState } from 'react'
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import DOMpurify from 'dompurify'
import '../chatBot/chatBot.css'

function ChatBot() {

    const [mensagens, setMensagens] = useState([
        {
            tipo: 'ia',
            texto: (
                DOMpurify.sanitize(`
            
                    <strong>Oi! Eu sou o Simio! 🐒</strong>
                    <p>
                        Posso te ajudar a estudar, explicar conteúdos,
                        criar exercícios ou tirar suas dúvidas.
                    </p>
                    <p>
                        O que você quer aprender hoje?
                    </p>
                   
             
                `)
            )
        }
    ])

    const [texto, setTexto] = useState('')
    const [carregando, setCarregando] = useState(false)

    // Envia uma sugestão
    function enviarSugestao(textoSugestao) {
        enviarMensagem(textoSugestao)
    }

    // Envia mensagem para o backend
    async function enviarMensagem(textoMensagem = texto) {

        const mensagem = textoMensagem.trim()

        if (!mensagem || carregando) {
            return
        }

        // Adiciona a mensagem do usuário na tela imediatamente
        setMensagens(prev => [
            ...prev,
            {
                tipo: 'usuario',
                texto: mensagem
            }
        ])

        // Limpa o textarea
        setTexto('')

        setCarregando(true)

        try {

            const resposta = await fetch('http://localhost:4000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mensagem: mensagem
                })
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.erro || 'Erro no servidor')
            }

            // Adiciona resposta da IA
            setMensagens(prev => [
                ...prev,
                {
                    tipo: 'ia',
                    texto: DOMpurify.sanitize(marked.parse(dados.resposta))
                }
            ])

        } catch (erro) {

            console.error(erro)

            setMensagens(prev => [
                ...prev,
                {
                    tipo: 'ia',
                    texto: DOMpurify.sanitize('❌ Não consegui falar com o servidor. Verifique se o backend e o Ollama estão rodando.')
                }
            ])

        } finally {
            setCarregando(false)
        }
    }

    // Permite enviar com Enter
    function handleKeyDown(event) {

        if (event.key === 'Enter' && !event.shiftKey) {

            event.preventDefault()

            enviarMensagem()
        }
    }

    return (

        <div className="chatIA">

            <div className="chat-container">

                <div className="chat-mensagens" id="chatMensagens">

                    {mensagens.map((mensagem, index) => (

                        <div
                            className={`mensagem ${
                                mensagem.tipo === 'ia'
                                    ? 'mensagem-ia'
                                    : 'mensagem-usuario'
                            }`}
                            key={index}
                        >

                            {mensagem.tipo === 'ia' && (
                                <div className="avatar-mensagem">
                                    🐒
                                </div>
                            )}

                            <div className="balao-mensagem">

                                {mensagem.tipo === 'ia' ? (
                                     <div
                                        dangerouslySetInnerHTML={{
                                            __html: mensagem.texto
                                        }}
                                    />
                                ) : (
                                    <p>{mensagem.texto}</p>
                                )}

                            </div>

                        </div>

                    ))}

                    {carregando && (

                        <div className="mensagem mensagem-ia">

                            <div className="avatar-mensagem">
                                🐒
                            </div>

                            <div className="balao-mensagem">
                                <p>🐒 Pensando...</p>
                            </div>

                        </div>

                    )}

                </div>


                <div className="sugestoes-chat">

                    <button
                        onClick={() =>
                            enviarSugestao(
                                'Explique Revolução Industrial'
                            )
                        }
                    >
                        📚 Explique um conteúdo
                    </button>

                    <button
                        onClick={() =>
                            enviarSugestao(
                                'Crie um exercício de matemática para mim'
                            )
                        }
                    >
                        📝 Criar exercício
                    </button>

                    <button
                        onClick={() =>
                            enviarSugestao(
                                'Me faça perguntas sobre história'
                            )
                        }
                    >
                        🧠 Me faça perguntas
                    </button>

                </div>


                <div className="chat-input-area">

                    <textarea
                        id="chatInput"
                        placeholder="Digite sua dúvida..."
                        rows="1"
                        value={texto}
                        onChange={(event) =>
                            setTexto(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                    />

                    <button
                        className="botao-enviar"
                        onClick={() => enviarMensagem()}
                        id="botaoEnviar"
                        disabled={carregando}
                    >
                        ➤
                    </button>

                </div>


                <div className="chat-aviso">

                    O Simio pode cometer erros.
                    Sempre confira informações importantes.

                </div>

            </div>

        </div>
    )
}

export default ChatBot
