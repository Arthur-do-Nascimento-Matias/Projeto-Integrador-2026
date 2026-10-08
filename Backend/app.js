import http from 'http'
import url from 'url'
import formidable from 'formidable'
import fs from 'fs'

import Conexao from './Conexao.js'
import Livros from './Livros.js'
import ChatBot from './ChatBot.js'
import Cadastro from './Cadastro.js'
import Login from './Login.js'

const callback = (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {

        res.writeHead(204)
        res.end()

        return
    }

    const rota = url.parse(req.url, true)
    const param = rota.query

if(req.method == 'GET') {

    if (rota.pathname == '/perfil') {

        const autorizacao = req.headers.authorization

        if (!autorizacao) {

            res.writeHead(401, {
                'Content-Type': 'application/json; charset=utf-8'
            })

            res.end(JSON.stringify({
                ok: false,
                message: 'Usuário não autenticado'
            }))

            return
        }

        const token = autorizacao.replace('Bearer ', '')

        const idUsuario = Login.autenticar(token)

        if (!idUsuario) {

            res.writeHead(401, {
                'Content-Type': 'application/json; charset=utf-8'
            })

            res.end(JSON.stringify({
                ok: false,
                message: 'Sessão inválida ou expirada'
            }))

            return
        }

        Conexao.getPerfil(idUsuario)
            .then(usuario => {

                if (!usuario) {

                    res.writeHead(404, {
                        'Content-Type': 'application/json; charset=utf-8'
                    })

                    res.end(JSON.stringify({
                        ok: false,
                        message: 'Usuário não encontrado'
                    }))

                    return
                }

                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                })

                res.end(JSON.stringify({
                    ok: true,
                    usuario
                }))
            })
            .catch(error => {

                console.error('ERRO AO BUSCAR PERFIL:', error)

                res.writeHead(500, {
                    'Content-Type': 'application/json; charset=utf-8'
                })

                res.end(JSON.stringify({
                    ok: false,
                    message: 'Erro ao buscar perfil'
                }))
            })

        return
    }

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
    // CHATBOT
    // =========================
}
else if (req.method == 'POST') {   

    let body = ''

    req.on('data', chunk => {
        body += chunk
    })

if(rota.pathname == '/concluirAtividade') {
     req.on('end', async () => {

        try {

            const dados = JSON.parse(body)

            await Conexao.atualizarAtividade(dados)
           
        } catch (erro) {

            console.error(erro)

            res.writeHead(500, {
                'Content-Type': 'application/json; charset=utf-8'
            })

            res.end(JSON.stringify({
                ok: false,
                message: 'Erro ao verificar código'
            }))
        }})
}

if (rota.pathname == '/cadastro/verificar') { 
    req.on('end', async () => {

        try {

            const dados = JSON.parse(body)

            const resposta = await Cadastro.verificarCodigo(dados)

            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            })

            res.end(JSON.stringify(resposta))

        } catch (erro) {

            console.error(erro)

            res.writeHead(500, {
                'Content-Type': 'application/json; charset=utf-8'
            })

            res.end(JSON.stringify({
                ok: false,
                message: 'Erro ao verificar código'
            }))
        }
    })}

    if(rota.pathname == '/cadastro') {

        req.on('end', async () => {
            try{

                const dados = JSON.parse(body)

                let resposta = await Cadastro.cadastrar(dados)
                res.end(JSON.stringify(resposta))
            }
            catch(erro){
                console.error(erro)
                res.end(JSON.stringify({ok: false}))
            }
        })

    }

    if(rota.pathname == '/login') {
        req.on('end', async () => {
            try{
                const dados = JSON.parse(body)
                let resposta = await Login.login(dados)
                res.end(JSON.stringify(resposta))
            }
            catch(erro) {
                console.error(erro)
                res.end(JSON.stringify({ok: false}))
            }
        })
    }

    if (rota.pathname == '/chatBot') {
        
        req.on('end', async () => {

            try {

                const dados = JSON.parse(body)

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
<<<<<<< kauan
    

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
=======
>>>>>>> react

 if (rota.pathname === '/mudarBio') {

        req.on('end', async () => {

            try{
                const dados = JSON.parse(body)
                await Conexao.mudarPerfil(dados)
            }

            catch(erro) {
                console.error(erro)
                res.end(JSON.stringify({ok: false}))
            }

        })
    }

if (rota.pathname == '/mudarFoto') {

    req.on('end', async () => {

        try {

            const dados = JSON.parse(body)

            await Conexao.atualizarFoto(dados)

            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            })

            res.end(JSON.stringify({
                ok: true
            }))

        } catch (erro) {

            console.error('ERRO AO SALVAR FOTO:', erro)

            res.writeHead(500, {
                'Content-Type': 'application/json; charset=utf-8'
            })

            res.end(JSON.stringify({
                ok: false,
                erro: erro.message
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
