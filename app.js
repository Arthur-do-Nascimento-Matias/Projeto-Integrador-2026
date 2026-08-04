const http = require('http')
const url = require('url')

const callback = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'})
    let rota = url.parse(req.url, true)
    let param = url.parse(req.url, true).query
    if(rota.pathname == '/atividades') {
        if(param.id == 1){
            res.end(JSON.stringify(
                {'id': param.id, 'pergunta': '1 - O antônimo de agitado é...', 'alternativa1': 'afobado', 'alternativa2': 'atrasado', 'certa': 'tranquilo', 'alternativa4': 'elefante'})
            )
        }
    }
}

let server = http.createServer(callback)

server.listen(3000)
