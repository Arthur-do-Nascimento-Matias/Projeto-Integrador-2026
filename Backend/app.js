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
