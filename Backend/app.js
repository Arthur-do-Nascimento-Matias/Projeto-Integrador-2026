const http = require('http')
const url = require('url')
const Tarefa = require('./Atividades')
const Atividades = require('./Atividades')
const Conexao = require('./Conexao')

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
               console.log('numeros dessa krla', param)
        Conexao.getAtividades(param)

        .then(con => {
            console.log(con)

            if(con.concluido){
                res.end(JSON.stringify({concluido: 'concluido'}))
                return
            }

            res.end(JSON.stringify({'pergunta': con.perguntas[0].enunciado, 'alternativa1': con.alternativas[0], 'alternativa2': con.alternativas[1], 'alternativa3': con.alternativas[2], 'alternativa4': con.alternativas[3]}))
        }
        )

    }
    if(rota.pathname == '/nome') {

        Conexao.criarTrilha(param)
        .then(con => {
            res.end(JSON.stringify({'nome': con.indices}))
        })
    }
    if(rota.pathname == '/adicionar') {
        let novaAtividade = new Atividades(param.nome, param.enunciado, param.alternativa1, param.alternativa2, param.alternativa3, param.resposta)
        array.push(novaAtividade)
    }
}

let server = http.createServer(callback)

server.listen(3000)
console.log('Server iniciado \nPorta 3000')
