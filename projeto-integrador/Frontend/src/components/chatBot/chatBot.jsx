import '../chatBot/chatBot.css'

function chatBot() {
    return(
         <>
            <div className="chat-mensagens" id="chatMensagens">

                <div className="mensagem mensagem-ia">

                    <div className="avatar-mensagem">
                        🐒
                    </div>

                    <div className="balao-mensagem">
                        <strong>Oi! Eu sou o Simio! 🐒</strong>

                        <p>
                            Posso te ajudar a estudar, explicar conteúdos,
                            criar exercícios ou tirar suas dúvidas.
                        </p>

                        <p>
                            O que você quer aprender hoje?
                        </p>
                    </div>

                </div>

            </div>

            <div className="sugestoes-chat">

                <button onclick="enviarSugestao('Explique Revolução Industrial')">
                    📚 Explique um conteúdo
                </button>

                <button onclick="enviarSugestao('Crie um exercício de matemática para mim')">
                    📝 Criar exercício
                </button>

                <button onclick="enviarSugestao('Me faça perguntas sobre história')">
                    🧠 Me faça perguntas
                </button>

            </div>


            <div className="chat-input-area">

                <textarea
                    id="chatInput"
                    placeholder="Digite sua dúvida..."
                    rows="1"
                ></textarea>

                <button
                    class="botao-enviar"
                    onclick="enviarMensagem()"
                    id="botaoEnviar"
                >
                    ➤
                </button>

            </div>

            <div className="chat-aviso">
                O Simio pode cometer erros. Sempre confira informações importantes.
            </div>
    </>
    )
}
 export default chatBot