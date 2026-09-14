const mysql = require('mysql')

class Conexao{
    
static connect() {
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'integrador'
    })

    connection.connect()

    return connection
}

static getAlunosByAno() {
    return new Promise((resolve, reject) => {

        const connection = Conexao.connect()

        const sql = 'SELECT * FROM `perguntas` WHERE id_materia=1'

        connection.query(sql, (error, perguntas) => {

            if (error) {
                reject(error)
                return
            }

            const sqlAlternativas =
                'SELECT * FROM `alternativas` WHERE id_pergunta=1'

            connection.query(sqlAlternativas, (error, alternativas) => {

                connection.end()

                if (error) {
                    reject(error)
                    return
                }

                resolve({
                    perguntas: perguntas,
                    alternativas: alternativas
                })
            })
        })
    })
}
}




module.exports = Conexao
