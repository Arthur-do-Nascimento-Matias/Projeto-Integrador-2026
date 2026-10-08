import mysql from 'mysql'

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
