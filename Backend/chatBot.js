
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

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
`;

        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: personalidade
                },
                {
                    role: "user",
                    content: mensagem
                }
            ],
            temperature: 0.7,
            max_completion_tokens: 2048
        });

        return response.choices[0]?.message?.content || "";
    }
}

export default ChatBot;
