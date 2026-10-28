<<<<<<< HEAD
const http = require('http')
const url = require('url')
const Tarefa = require('./Atividades')
const Atividades = require('./Atividades')

const array = [
    {'nome': 'introducao', 'pergunta': 'O antônimo de agitado é...','alternativas':  ['afobado', 'atrasado', 'elefante'], 'respostaCertas':  'tranquilo'},
    {'nome': 'pg1', 'pergunta': 'Qual dos advérbios abaixo não existe?','alternativas': ['bastante', 'quanto', 'tanto'], 'respostaCertas': 'menas'},
    {'nome': 'pg2', 'pergunta': 'Uma agitação barulhenta, tumulto ou alvoroço é chamada de:', 'alternativas': ['dilema', 'discernimento', 'atrasamento'], 'respostaCertas': 'celeuma'},
    {'nome': 'pg3', 'pergunta': 'O verbo "aferir" está relacionado a:', 'alternativas': ['machucar', 'localizar', 'capacitar'], 'respostaCertas': 'medir',},
    {'nome': 'pg4', 'pergunta': 'Qual das palavras abaixo apresenta erro de grafia?', 'alternativas': ['bruxa', 'xingar', 'encher'], 'respostaCertas': 'mecher'}
]

const callback = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'})
    let rota = url.parse(req.url, true)
    let param = url.parse(req.url, true).query
    if(rota.pathname == '/atividades') {
        if(param.id == 'aleatorio'){
            const numAleatorio = Math.floor(Math.random() * array.length)
            console.log(numAleatorio)
            res.end(JSON.stringify(
                {'id': numAleatorio, 'pergunta': array[numAleatorio].pergunta, 'alternativa1': array[numAleatorio].alternativas[0], 'alternativa2': array[numAleatorio].alternativas[1], 'alternativa3': array[numAleatorio].alternativas[2], 'certa': array[numAleatorio].respostaCertas}
            ))
        } else {
        res.end(JSON.stringify(
            {'id': param.id, 'pergunta': array[param.id-1].pergunta, 'alternativa1': array[param.id-1].alternativas[0], 'alternativa2': array[param.id-1].alternativas[1], 'alternativa3': array[param.id-1].alternativas[2], 'certa': array[param.id-1].respostaCertas})
        )
    }
    }
    if(rota.pathname == '/nome') {
        res.end(JSON.stringify(
            array.map(item => ({'nome': item.nome}))
        ))
    }
    if(rota.pathname == '/adicionar') {
        let novaAtividade = new Atividades(param.nome, param.enunciado, param.alternativa1, param.alternativa2, param.alternativa3, param.resposta)
        array.push(novaAtividade)
    }
}

let server = http.createServer(callback)

server.listen(3000)
console.log('Server iniciado \nPorta 3000')
=======
import http from 'http'

import url from 'url'

import formidable from 'formidable'

import fs from 'fs'

import Sequencia from './Sequencia.js'

import Conexao from './Conexao.js'

import Livros from './Livros.js'

import ChatBot from './ChatBot.js'

import Cadastro from './Cadastro.js'

import Login from './Login.js'

import Provas from './Provas.js'

import Redacoes from './Redacoes.js'

import Http from './utils/http.js'





const callback = async (req, res) => {



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

    if(rota.pathname == "/posicao") {

        try{
            console.log('posicao')

            let posicao = await Conexao.getPosicao(param.idUser)
            
            console.log(posicao)

            res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify(posicao));
        }
        catch(error){
            throw error
        }
    }

    if (rota.pathname === "/ranking") {
        console.log('ranking')
        Conexao.getRanking()
            .then((ranking) => {
                const participantes = ranking.map((usuario) => ({
                    id: usuario.id_usuario,
                    nome: usuario.nome_de_exibicao,
                    username: usuario.nome_de_usuario,
                    xp: Number(usuario.xp_semanal) || 0
                }));

                res.writeHead(200, {
                    "Content-Type": "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    ok: true,
                    participantes
                }));
            })
            .catch((erro) => {
                console.error("Erro ao carregar ranking:", erro);

                res.writeHead(500, {
                    "Content-Type": "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    ok: false,
                    message: "Erro ao carregar ranking."
                }));
            });

        return;
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

if(rota.pathname == "/sequencia") {
    req.on('end', () => {
        try {

            console.log('app')

            const dados = JSON.parse(body)

            Sequencia.streak(dados.idUser)

        }
        catch(error){
            throw error
        }
    })
}

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
>>>>>>> a08cdc8b78d44484108ee6fa03d4ecce4d83a962
