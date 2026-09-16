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

static getAtividades(param) {
    return new Promise((resolve, reject) => {

        console.log(param)

        const connection = Conexao.connect()

        const sql = 'SELECT * FROM `perguntas` WHERE id_pergunta=?'

        connection.query(sql, param.id, (error, perguntas) => {

            if (error) {
                reject(error)
                return
            }

            const sqlAlternativas =
                'SELECT * FROM `alternativas` WHERE id_pergunta=?'

            connection.query(sqlAlternativas, param.id, (error, alternativas) => {

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
