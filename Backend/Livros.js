import http from 'http'
import url from 'url'
import mysql from 'mysql'

/*
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
            
            var sql = 'select capaLivro, idLivro, NomeLivro, autorLivro from livros'
            
            connection.query(sql, function(error, results){
                if(error) throw error

                const capas = results.map(element => {
                    return {'img': element.capaLivro.toString('base64'), 'id': element.idLivro, 'titulo': element.NomeLivro, 'autorLivro': element.autorLivro}
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
*/

class Livros{

   static booksSearch() {

    return new Promise((resolve, reject) => {

        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'integrador',
        })

        connection.connect()

        const sql = `
            SELECT capaLivro, idLivro, NomeLivro, autorLivro
            FROM livros
        `

        connection.query(sql, function(error, results) {

            if (error) {
                connection.end()
                reject(error)
                return
            }

            const capas = results.map(element => {

                return {
                    img: element.capaLivro
                        ? element.capaLivro.toString('base64')
                        : null,

                    id: element.idLivro,
                    titulo: element.NomeLivro,
                    autorLivro: element.autorLivro
                }
            })

            connection.end()

            resolve(capas)
        })
    })
}

    static openBook(param) {

        return new Promise((resolve, reject) => {

        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'integrador',
        })

        connection.connect()

        let idLivro = param.id

            var sql = 'select pdfLivro from livros where idLivro=?'

            connection.query(sql, idLivro, function(error, results) {
                
            if (error) {
                connection.end()
                reject(error)
                return
            }

            const pdf = results[0].pdfLivro;

            connection.end()

            resolve(pdf);

            })
         })   
        }
    }
    

export default Livros
