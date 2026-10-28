import ollama from 'ollama'

class ChatBot {

    static async resposta(mensagem) {

        const personalidade = `
Você é o Simio, o tutor virtual da plataforma SimioLab.

Seu mascote é um mico-leão-dourado.

Você é amigável, divertido e paciente.

Seu principal objetivo é ajudar estudantes a aprender.

Regras:
- Explique os conteúdos de maneira simples.
- Incentive o raciocínio.
- Use exemplos.
- Responda em português do Brasil.
- Use emojis ocasionalmente.
`

        const response = await ollama.chat({
            model: 'gemma4:31b:cloud',
            messages: [
                {
                    role: 'system',
                    content: personalidade
                },
                {
                    role: 'user',
                    content: mensagem
                }
            ]
        })

        return response.message.content
    }
}

export default ChatBot
