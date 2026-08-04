const http = require('http')
const url = require('url')

const callback = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'})
    let rota = url.parse(req.url, true)
    let param = url.parse(req.url, true).query
    if(rota.pathname == '/atividades') {
        res.end('teste ' + param.id)
    }
}

let server = http.createServer(callback)

server.listen(3000)
