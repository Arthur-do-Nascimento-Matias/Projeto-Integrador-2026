import http from 'http'

import url from 'url'

import formidable from 'formidable'

import fs from 'fs'

import { buscarUsuarioAutenticado } from './utils/autenticacao.js'

import Conexao from './Conexao.js'

import Livros from './Livros.js'

import ChatBot from './ChatBot.js'

import Cadastro from './Cadastro.js'

import Login from './Login.js'

import Provas from './Provas.js'

import Redacoes from './Redacoes.js'

import Http from './utils/http.js'

import Feed from './Feed.js'

import Missoes from './Missoes.js'





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


    if (
    rota.pathname === '/missoes/hoje' ||
    rota.pathname === '/missoes/evento'
) {
    const idUsuario = buscarUsuarioAutenticado(req)

    if (!idUsuario) {
        Http.responderJson(res, 401, {
            erro: 'Faça login novamente.'
        })
        return
    }

    const consulta =
        rota.pathname === '/missoes/hoje' &&
        req.method === 'GET'

    const registro =
        rota.pathname === '/missoes/evento' &&
        req.method === 'POST'

    if (!consulta && !registro) {
        Http.responderJson(res, 405, {
            erro: 'Método não permitido.'
        })
        return
    }

    async function atenderMissoes() {
        try {
            const evento = registro
                ? await Http.lerCorpo(req)
                : null

            const dados = await Missoes.processar(
                idUsuario,
                evento
            )

            Http.responderJson(res, 200, dados)
        } catch (erro) {
            console.error('Erro nas missões:', erro)

            Http.responderJson(
                res,
                erro.status || 500,
                { erro: erro.message }
            )
        }
    }

    atenderMissoes()
    return
}



        if (req.method === 'GET' && rota.pathname === '/comunidades') {

        const idUsuario = buscarUsuarioAutenticado(req)

        if (!idUsuario) {
            Http.responderJson(res, 401, {
                ok: false,
                erro: 'Usuário não autenticado.'
            })

            return
        }

        Feed.listarComunidades()
            .then(comunidades => {

                Http.responderJson(res, 200, {
                    comunidades
                })

            })
            .catch(error => {

                console.error(
                    'ERRO AO BUSCAR COMUNIDADES:',
                    error
                )

                Http.responderJson(res, 500, {
                    erro: error.message
                })

            })

        return
    }
        if (req.method === 'GET' && rota.pathname === '/feed/post') {

        const idUsuario = buscarUsuarioAutenticado(req)
        const idPost = Number(param.id_post)

        if (!idUsuario) {
            Http.responderJson(res, 401, {
                ok: false,
                erro: 'Usuário não autenticado.'
            })

            return
        }

        if (!idPost) {
            Http.responderJson(res, 400, {
                erro: 'Informe um id_post válido.'
            })

            return
        }

        Feed.buscarPost(idPost, idUsuario)
            .then(resultado => {

                if (!resultado) {
                    Http.responderJson(res, 404, {
                        erro: 'Post não encontrado.'
                    })

                    return
                }

                Http.responderJson(res, 200, resultado)

            })
            .catch(error => {

                console.error(
                    'ERRO AO BUSCAR POST:',
                    error
                )

                Http.responderJson(res, 500, {
                    erro: error.message
                })

            })

        return
    }
        if (req.method === 'GET' && rota.pathname === '/feed') {

        const idUsuario = buscarUsuarioAutenticado(req)

        if (!idUsuario) {
            Http.responderJson(res, 401, {
                ok: false,
                erro: 'Usuário não autenticado.'
            })

            return
        }

        Feed.listarPosts(idUsuario, {
            comunidade: param.comunidade,
            ordem: param.ordem
        })
            .then(posts => {

                Http.responderJson(res, 200, {
                    posts
                })

            })
            .catch(error => {

                console.error(
                    'ERRO AO BUSCAR FEED:',
                    error
                )

                Http.responderJson(res, 500, {
                    erro: error.message
                })

            })

        return
    }
    if (req.method === 'POST' && rota.pathname === '/feed') {

        const idUsuario = buscarUsuarioAutenticado(req)

        if (!idUsuario) {
            Http.responderJson(res, 401, {
                ok: false,
                erro: 'Usuário não autenticado.'
            })

            return
        }

        Http.lerCorpo(req)
            .then(dados => Feed.criarPost({
                ...dados,
                id_usuario: idUsuario,
                id_comunidade: Number(dados.id_comunidade)
            }))
            .then(resultado => {

                Http.responderJson(res, 201, {
                    ok: true,
                    ...resultado
                })

            })
            .catch(error => {

                Http.responderJson(res, 400, {
                    erro: error.message
                })

            })

        return
    }

    if (req.method === 'POST' && rota.pathname === '/feed/voto') {

        const idUsuario = buscarUsuarioAutenticado(req)

        if (!idUsuario) {
            Http.responderJson(res, 401, {
                ok: false,
                erro: 'Usuário não autenticado.'
            })

            return
        }

        Http.lerCorpo(req)
            .then(dados => Feed.votarPost(
                Number(dados.id_post),
                idUsuario,
                dados.tipo
            ))
            .then(() => {

                Http.responderJson(res, 200, {
                    ok: true
                })

            })
            .catch(error => {

                Http.responderJson(res, 400, {
                    erro: error.message
                })

            })

        return
    }

    if (req.method === 'POST' && rota.pathname === '/feed/comentarios') {

        const idUsuario = buscarUsuarioAutenticado(req)

        if (!idUsuario) {
            Http.responderJson(res, 401, {
                ok: false,
                erro: 'Usuário não autenticado.'
            })

            return
        }

        Http.lerCorpo(req)
            .then(dados => Feed.criarComentario({
                ...dados,
                id_usuario: idUsuario,
                id_post: Number(dados.id_post)
            }))
            .then(resultado => {

                Http.responderJson(res, 201, {
                    ok: true,
                    ...resultado
                })

            })
            .catch(error => {

                Http.responderJson(res, 400, {
                    erro: error.message
                })

            })

        return
    }

    if (req.method === 'POST' && rota.pathname === '/feed/denuncias') {

        const idUsuario = buscarUsuarioAutenticado(req)

        if (!idUsuario) {
            Http.responderJson(res, 401, {
                ok: false,
                erro: 'Usuário não autenticado.'
            })

            return
        }

        Http.lerCorpo(req)
            .then(dados => Feed.denunciar({
                ...dados,
                id_usuario: idUsuario,
                id_post: Number(dados.id_post) || null,
                id_comentario: Number(dados.id_comentario) || null
            }))
            .then(() => {

                Http.responderJson(res, 201, {
                    ok: true
                })

            })
            .catch(error => {

                Http.responderJson(res, 400, {
                    erro: error.message
                })

            })

        return
    }

    if (req.method === 'POST' && rota.pathname === '/feed/ocultar') {

        const idUsuario = buscarUsuarioAutenticado(req)

        if (!idUsuario) {
            Http.responderJson(res, 401, {
                ok: false,
                erro: 'Usuário não autenticado.'
            })

            return
        }

        Http.lerCorpo(req)
            .then(async dados => {

                const ehAdmin = await Feed.usuarioEhAdmin(idUsuario)

                if (!ehAdmin) {
                    throw new Error(
                        'Apenas administradores podem ocultar conteúdo.'
                    )
                }

                if (!['post', 'comentario'].includes(dados.tipo)) {
                    throw new Error('Tipo de conteúdo inválido.')
                }

                if (!Number(dados.id)) {
                    throw new Error('Informe um id válido.')
                }

                return Feed.ocultarConteudo({
                    tipo: dados.tipo,
                    id: Number(dados.id)
                })

            })
            .then(() => {

                Http.responderJson(res, 200, {
                    ok: true
                })

            })
            .catch(error => {

                Http.responderJson(res, 400, {
                    erro: error.message
                })

            })

        return
    }


if(req.method == 'GET') {



    // =========================

    // MISSOES #VV

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

    // =========================

    // REDAÇÃO VV

    // =========================



    if (

        rota.pathname === '/temasRedacao' &&

        req.method === 'GET'

    ) {

        Redacoes.listarTemas()

            .then(temas => {



                Http.responderJson(res, 200, temas)

            })

            .catch(error => {



                console.error('ERRO AO BUSCAR TEMAS:', error)



                Http.responderJson(res, 500, {

                    erro: error.message

                })

            })



        return

    }





    if (

        rota.pathname === '/temaRedacao' &&

        req.method === 'GET'

    ) {

        const idTema = Number(param.id_tema)



        if (!idTema) {

            Http.responderJson(res, 400, {

                erro: 'Informe um id_tema válido.'

            })



            return

        }



        Redacoes.buscarTema(idTema)

            .then(tema => {



                if (!tema) {

                    Http.responderJson(res, 404, {

                        erro: 'Tema não encontrado.'

                    })



                    return

                }



                Http.responderJson(res, 200, tema)

            })

            .catch(error => {



                console.error('ERRO AO BUSCAR TEMA:', error)



                Http.responderJson(res, 500, {

                    erro: error.message

                })

            })



        return

    }





    if (

        rota.pathname === '/redacoes/referencias' &&

        req.method === 'GET'

    ) {

        Redacoes.listarReferencias()

            .then(referencias => {



                Http.responderJson(res, 200, {

                    referencias

                })

            })

            .catch(error => {



                console.error(

                    'ERRO AO BUSCAR REDAÇÕES DE REFERÊNCIA:',

                    error

                )



                Http.responderJson(res, 500, {

                    erro: error.message

                })

            })



        return

    }





    if (

        rota.pathname === '/redacoes/rascunho' &&

        req.method === 'POST'

    ) {

        Http.lerCorpo(req)

            .then(dados => {



                const idUsuario = Number(dados.id_usuario)

                const idTema = Number(dados.id_tema)



                if (!idUsuario || !idTema) {

                    Http.responderJson(res, 400, {

                        erro: 'Informe id_usuario e id_tema válidos.'

                    })



                    return null

                }



                return Redacoes.salvarRascunho(dados)

            })

            .then(resultado => {



                if (!resultado) {

                    return

                }



                Http.responderJson(res, 200, {

                    mensagem: resultado.criado

                        ? 'Rascunho criado.'

                        : 'Rascunho atualizado.',



                    ...resultado

                })

            })

            .catch(error => {



                console.error('ERRO AO SALVAR RASCUNHO:', error)



                Http.responderJson(res, 500, {

                    erro: error.message

                })

            })



        return

    }





    if (

        rota.pathname === '/redacoes/rascunho' &&

        req.method === 'GET'

    ) {

        const idUsuario = Number(param.id_usuario)

        const idTema = Number(param.id_tema)



        if (!idUsuario || !idTema) {

            Http.responderJson(res, 400, {

                erro: 'Informe id_usuario e id_tema válidos.'

            })



            return

        }



        Redacoes.buscarRascunho(idUsuario, idTema)

            .then(rascunho => {



                Http.responderJson(res, 200, {

                    rascunho

                })

            })

            .catch(error => {



                console.error('ERRO AO BUSCAR RASCUNHO:', error)



                Http.responderJson(res, 500, {

                    erro: error.message

                })

            })



        return

    }





    if (

        rota.pathname === '/redacoes/historico' &&

        req.method === 'GET'

    ) {

        const idUsuario = Number(param.id_usuario)



        if (!idUsuario) {

            Http.responderJson(res, 400, {

                erro: 'Informe um id_usuario válido.'

            })



            return

        }



        Redacoes.listarHistorico(idUsuario)

            .then(historico => {



                Http.responderJson(res, 200, {

                    historico

                })

            })

            .catch(error => {



                console.error('ERRO AO BUSCAR HISTÓRICO:', error)



                Http.responderJson(res, 500, {

                    erro: error.message

                })

            })



        return

    }

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



        const idUsuario = buscarUsuarioAutenticado(req)

        if (!idUsuario) {
            Http.responderJson(res, 401, {
                ok: false,
                message: 'Faça login novamente.'
            })
            return
        }

        await Conexao.atualizarAtividade({
            ...dados,
            id: idUsuario
        })

        Http.responderJson(res, 200, {
            ok: true
        })  



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

    // =========================

    // MISSOES #VV

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



}



const server = http.createServer(callback)



server.listen(3000)



console.log('Server iniciado')

console.log('Porta 3000')
