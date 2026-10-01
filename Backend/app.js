import http from 'http'
import url from 'url'

//import Atividades from './Atividades.js'
import Conexao from './Conexao.js'
import Livros from './Livros.js'
import ChatBot from './ChatBot.js'
import Cadastro from './Cadastro.js'


const callback = (req, res) => {

 console.log('REQUISIÇÃO:', req.method, req.url)

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        console.log('Respondendo OPTIONS')

        res.writeHead(204)
        res.end()

        return
    }

    const rota = url.parse(req.url, true)
    const param = rota.query


    // =========================
    // ATIVIDADES
    // =========================
if(req.method == 'GET') {
    if (rota.pathname == '/atividades') {

        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        })

        Conexao.getAtividades(param)
            .then(con => {

                if (con.concluido) {

                    res.end(JSON.stringify({
                        concluido: 'concluido'
                    }))

                    return
                }

                res.end(JSON.stringify({
                    pergunta: con.perguntas[0].enunciado,
                    alternativa1: con.alternativas[0],
                    alternativa2: con.alternativas[1],
                    alternativa3: con.alternativas[2],
                    alternativa4: con.alternativas[3]
                }))
            })

        return
    }


    // =========================
    // NOME
    // =========================

    if (rota.pathname == '/nome') {

        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        })

        Conexao.criarTrilha(param)
            .then(con => {

                res.end(JSON.stringify({
                    nome: con.indices
                }))
            })

        return
    }


    // =========================
    // LIVROS
    // =========================

    if (rota.pathname == '/livros') {

        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        })

        Livros.booksSearch()
            .then(resp => {

                res.end(JSON.stringify(resp))
            })

        return
    }


    // =========================
    // ABRIR LIVRO
    // =========================

    if (rota.pathname == '/abrirLivro') {

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="livro.pdf"'
        })

        Livros.openBook(param)
            .then(resp => {
                res.end(resp)
            })

        return
    }


    // =========================
    // CHATBOT
    // =========================
}
else if (req.method == 'POST') {   

    if(rota.pathname == '/cadastro') {

        let body = ''

        req.on('data', chunk => {
            body += chunk
        })

        req.on('end', async () => {
            try{}
            catch{}
        })

    }


    if (rota.pathname == '/chatBot') {
        
        let body = ''

        req.on('data', chunk => {
            body += chunk
        })

        req.on('end', async () => {

            console.log('END DA REQUISIÇÃO')
            console.log('BODY RECEBIDO:', body)

            try {

                const dados = JSON.parse(body)

                console.log('DADOS:', dados)
                console.log('MENSAGEM:', dados.mensagem)
                console.log('Chamando ollama')

                const resposta = await ChatBot.resposta(dados.mensagem)

                console.log('Ollama respondeu')

                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                })

                res.end(JSON.stringify({
                    resposta: resposta
                }))

            } catch (error) {

                console.error('ERRO NO CHATBOT:', error)

                res.writeHead(500, {
                    'Content-Type': 'application/json; charset=utf-8'
                })

                res.end(JSON.stringify({
                    erro: error.message
                }))
            }
        })

        return
    }
}}

const server = http.createServer(callback)

server.listen(3000)

console.log('Server iniciado')
console.log('Porta 3000')
