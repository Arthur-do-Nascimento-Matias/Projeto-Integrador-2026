const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());


const PORT = 4000;

const OLLAMA_URL =
    "http://localhost:11434/api/chat";


const MODELO = "gemma4:31b-cloud";


const historico = [
    {
        role: "system",

        content: `
Você é o Simio, o tutor virtual da plataforma SimioLab.

Seu mascote é um mico-leão-dourado.

Você é amigável, divertido e paciente.

Seu principal objetivo é ajudar estudantes a aprender.

Regras:

- Explique os conteúdos de maneira simples.
- Não entregue apenas a resposta quando o estudante estiver fazendo um exercício.
- Incentive o raciocínio.
- Faça perguntas para verificar se o estudante entendeu.
- Use exemplos.
- Quando possível, transforme o aprendizado em pequenos desafios.
- Não seja excessivamente formal.
- Responda em português do Brasil.
- Use emojis ocasionalmente, especialmente 🐒, 📚 e 🧠.
- Se o estudante pedir ajuda em uma questão, dê pistas antes da resposta.
`
    }
];


app.post("/api/chat", async (req, res) => {

    try {

        const mensagem = req.body.mensagem;


        if (!mensagem) {

            return res.status(400).json({
                erro: "Mensagem vazia."
            });

        }


        historico.push({
            role: "user",
            content: mensagem
        });


        const respostaOllama = await fetch(
            OLLAMA_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    model: MODELO,

                    messages: historico,

                    stream: false

                })
            }
        );


        if (!respostaOllama.ok) {

            throw new Error(
                `Ollama respondeu com status ${respostaOllama.status}`
            );

        }


        const dados =
            await respostaOllama.json();


        const resposta =
            dados.message.content;


        historico.push({

            role: "assistant",

            content: resposta

        });


        res.json({

            resposta: resposta

        });


    } catch (erro) {

        console.error(erro);

        res.status(500).json({

            erro: "Erro ao conversar com o Ollama."

        });

    }

});


app.listen(PORT, () => {

    console.log(
        `🐒 SimioLab IA rodando em http://localhost:${PORT}`
    );

});
