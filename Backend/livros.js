const mysql = require('mysql')
const http = require('http')
const url = require('url')
const Tarefa = require('./Atividades')
const Atividades = require('./Atividades')

const callback = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let rota = url.parse(req.url, true)
    let param = url.parse(req.url, true).query

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'integrador',
    })

    connection.connect()

    if(rota.pathname == '/livros') {
            
            res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'})
            
            var sql = 'select capaLivro, idLivro from livros'
            
            connection.query(sql, function(error, results){
                if(error) throw error

                const capas = results.map(element => {
                    return {'img': element.capaLivro.toString('base64'), 'id': element.idLivro}
                });

                console.log(results)

                res.end(JSON.stringify(capas))

            })

            
    }

    if(rota.pathname == '/abrirLivro') {

        let idLivro = param.id

        var sql = 'select pdfLivro from livros where idLivro=?'

        connection.query(sql, idLivro, function(error, results) {
            if(error) throw error

        const pdf = results[0].pdfLivro;

        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="livro.pdf"',
            'Content-Length': pdf.length
        });

        res.end(pdf);

        })

    }

    connection.end()

}

let server = http.createServer(callback)

server.listen(5000)
console.log('Server iniciado \nPorta 5000')
