const http = require('http')
const url = require('url')

const perguntas = [
    'O antônimo de agitado é...',
    'Qual dos advérbios abaixo não existe?',
    'Uma agitação barulhenta, tumulto ou alvoroço é chamada de:',
    'O verbo "aferir" está relacionado a:',
    'Qual das palavras abaixo apresenta erro de grafia?'
]

const alternativas = [
    ['afobado', 'atrasado', 'elefante'],
    ['bastante', 'quanto', 'tanto'],
    ['dilema', 'discernimento', 'atrasamento'],
    ['machucar', 'localizar', 'capacitar'],
    ['bruxa', 'xingar', 'encher']
]

const respostasCerta = [
    'tranquilo',
    'menas',
    'celeuma',
    'medir',
    'mecher'
]

const callback = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'})
    let rota = url.parse(req.url, true)
    let param = url.parse(req.url, true).query
    if(rota.pathname == '/atividades') {
        res.end(JSON.stringify(
            {'id': param.id, 'pergunta': perguntas[param.id-1], 'alternativa1': alternativas[param.id-1][0], 'alternativa2': alternativas[param.id-1][1], 'alternativa3': alternativas[param.id-1][2], 'certa': respostasCerta[param.id-1]})
        )
    }
}

let server = http.createServer(callback)

server.listen(3000)
console.log('Server iniciado \nPorta 3000')
