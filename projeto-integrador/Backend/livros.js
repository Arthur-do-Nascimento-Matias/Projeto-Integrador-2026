const mysql = require('mysql')
const http = require('http')
const url = require('url')
const Tarefa = require('./Atividades')
const Atividades = require('./Atividades')

const callback = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200, {'Content-Type':'image/jpeg; charset=utf-8'})
    let rota = url.parse(req.url, true)
    let param = url.parse(req.url, true).query

    if(rota.pathname == '/livros') {
 
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'integrador',
            })
            
            connection.connect()
            
            var sql = 'select NomeLivro from livros where capaLivro'

            var id = 13
            
            connection.query(sql, id, function(error, results){
                if(error) throw error

                res.end(JSON.stringify(results))

            })

            connection.end()
            
    }
}

let server = http.createServer(callback)

server.listen(5000)
console.log('Server iniciado \nPorta 5000')
