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

 if (rota.pathname === '/mudarPerfil') {

    const form = formidable({
        multiples: false
    })

    form.parse(req, async (error, fields, files) => {

        if (error) {

            console.error('Erro ao receber formulário:', error)

            res.writeHead(500, {
                'Content-Type': 'application/json'
            })

            res.end(JSON.stringify({
                sucesso: false,
                erro: error.message
            }))

            return
        }

        console.log('Campos:', fields)
        console.log('Arquivos:', files)

        const id = fields.id?.[0]
        const bio = fields.bio?.[0]
        const fotoArquivo = files.foto?.[0]

        console.log('ID:', id)
        console.log('Bio:', bio)
        console.log('Foto:', fotoArquivo)

        if (!id) {

            res.writeHead(400, {
                'Content-Type': 'application/json'
            })

            res.end(JSON.stringify({
                sucesso: false,
                erro: 'ID do usuário não informado'
            }))

            return
        }

        let fotoBuffer = null

        // Se uma nova foto foi enviada
        if (fotoArquivo) {

            try {

                fotoBuffer = fs.readFileSync(fotoArquivo.filepath)

                console.log(
                    'Foto convertida para Buffer:',
                    fotoBuffer.length,
                    'bytes'
                )

            } catch (erro) {

                console.error('Erro ao ler a foto:', erro)

                res.writeHead(500, {
                    'Content-Type': 'application/json'
                })

                res.end(JSON.stringify({
                    sucesso: false,
                    erro: 'Não foi possível ler a foto'
                }))

                return
            }
        }

        const dados = {
            id: id,
            bio: bio || '',
            foto: fotoBuffer
        }

        console.log('Dados enviados para o banco:', {
            id: dados.id,
            bio: dados.bio,
            tamanhoFoto: dados.foto?.length || 0
        })

        try {

            await Conexao.mudarPerfil(dados)

            res.writeHead(200, {
                'Content-Type': 'application/json'
            })

            res.end(JSON.stringify({
                sucesso: true,
                mensagem: 'Perfil atualizado com sucesso'
            }))

        } catch (erro) {

            console.error('Erro ao salvar perfil no banco:', erro)

            res.writeHead(500, {
                'Content-Type': 'application/json'
            })

            res.end(JSON.stringify({
                sucesso: false,
                erro: 'Erro ao salvar perfil no banco'
            }))
        }
    })

    return
}}}

const server = http.createServer(callback)

server.listen(3000)

console.log('Server iniciado')
console.log('Porta 3000')
