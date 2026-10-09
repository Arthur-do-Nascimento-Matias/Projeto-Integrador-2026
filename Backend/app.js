import http from 'http'
import url from 'url'
//import um amor verdadeiro e reciproco'
import Conexao from './Conexao.js'
import Livros from './Livros.js'
import ChatBot from './ChatBot.js'
import Provas from './Provas.js'


const callback = (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*')

    const rota = url.parse(req.url, true)
    const param = rota.query

    // =========================
    // ATIVIDADES
    // =========================

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

        return  // retorna pra minha, vda

        
    }
      // =========================
    // PROVAS
    // =========================

    if (rota.pathname == '/provas') {

        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        })

        Provas.provasSearch()
            .then(resp => {

                res.end(JSON.stringify(resp))
            })

            .catch(error => {

                console.error(
                    'ERRO AO BUSCAR PROVAS:',
                    error
                )

                res.writeHead(500, {
                    'Content-Type':
                        'application/json; charset=utf-8'
                })

                res.end(JSON.stringify({
                    erro: error.message
                }))
            })

        return
    }

    // =========================
// ABRIR PROVA
// =========================

if (rota.pathname == '/abrirProva') {

    Provas.abrirProva(param)
        .then(resp => {

            if (!resp) {

                res.writeHead(404, {
                    'Content-Type':
                        'application/json; charset=utf-8'
                })

                res.end(JSON.stringify({
                    erro: 'Prova não encontrada.'
                }))

                return
            }

            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition':
                    'inline; filename="prova.pdf"'
            })

            res.end(resp)
        })

        .catch(error => {

            console.error(
                'ERRO AO ABRIR PROVA:',
                error
            )

            res.writeHead(500, {
                'Content-Type':
                    'application/json; charset=utf-8'
            })

            res.end(JSON.stringify({
                erro: error.message
            }))
        })

    return
}

    // =========================
    // CHATBOT
    // =========================

    if (rota.pathname == '/chatBot') {

        ChatBot.resposta(param.mensagem)

            .then(resp => {

                res.writeHead(200, {
                    'Content-Type':
                        'application/json; charset=utf-8'
                })

                res.end(JSON.stringify({
                    resposta: resp
                }))
            })

            .catch(error => {

                res.writeHead(500, {
                    'Content-Type':
                        'application/json; charset=utf-8'
                })

                res.end(JSON.stringify({
                    erro: error.message
                }))
            })

        return
    }
    

    // =========================
    // MISSOES
    // =========================

    if (rota.pathname == '/missoes/hoje') {

        const idUsuario = Number(param.id_usuario)

        if (!idUsuario) {
            res.writeHead(400, {
                'Content-Type':
                    'application/json; charset=utf-8'
            })

            res.end(JSON.stringify({
                erro: 'Informe um id_usuario válido.'
            }))

            return
        }

        Conexao.buscarOuCriarMissoes(idUsuario)

            .then(con => {

                res.writeHead(200, {
                    'Content-Type':
                        'application/json; charset=utf-8'
                })

                res.end(JSON.stringify(con))
            })

            .catch(error => {

                console.error(
                    'ERRO AO BUSCAR MISSÕES:',
                    error
                )

                res.writeHead(500, {
                    'Content-Type':
                        'application/json; charset=utf-8'
                })

                res.end(JSON.stringify({
                    erro: error.message
                }))
            })

        return
    }
}


const server = http.createServer(callback)

server.listen(3000)

console.log('Server iniciado')
console.log('Porta 3000')
