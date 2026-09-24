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

        const connection = Conexao.connect()

        console.log('param', param.materia, " ",param.atividadeAtual)

        const sql = 'SELECT * FROM `perguntas` WHERE id_materia=? AND ordem=?'

        connection.query(sql, [param.materia, param.atividadeAtual], (error, perguntas) => {

            if (error) {
                reject(error)
                return
            }

            const sqlAlternativas =
                'SELECT * FROM `alternativas` WHERE id_pergunta=?'

            connection.query(sqlAlternativas, param.atividadeAtual, (error, alternativas) => {

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

static criarTrilha(param){
    return new Promise((resolve, reject) => {

        const connection = Conexao.connect()

        let sql = 'SELECT * FROM `perguntas` WHERE id_materia = ?'

        connection.query(sql, param.id, (error, indices) => {
        
        connection.end()

        if(error) {
            reject(error)
            return
        }
        resolve({
            indices: indices
        })

        })
    })
}
}

module.exports = Conexao
