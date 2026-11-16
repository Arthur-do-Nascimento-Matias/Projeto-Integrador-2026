import mysql from 'mysql2'

class Livros{

   static booksSearch() {

    return new Promise((resolve, reject) => {

      const connection = mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'integrador',

        });

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
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'integrador',

        });

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
