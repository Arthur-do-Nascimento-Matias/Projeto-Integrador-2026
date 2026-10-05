import mysql from 'mysql'

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

            const sql = 'SELECT * FROM `perguntas` WHERE id_materia=? AND ordem=?'

            connection.query(sql, [param.materia, param.atividadeAtual], (error, perguntas) => {

                if (error) {
                    reject(error)
                    return
                }

                 if (!perguntas || perguntas.length === 0 || !perguntas[0]) {

                    connection.end();

                    resolve({
                        concluido: true,
                        perguntas: [],
                        alternativas: []
                    });

                    return;
                }

                const sqlAlternativas =
                    'SELECT * FROM `alternativas` WHERE id_pergunta=?'


                connection.query(sqlAlternativas, [perguntas[0].id_pergunta], (error, alternativas) => {

                    connection.end(alternativas)

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

    static getPerfil(idUsuario) {

        return new Promise((resolve, reject) => {

            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'integrador',
            })

            connection.connect()

            const sql = `
                SELECT
                    id_usuario,
                    nome_de_exibicao,
                    nome_de_usuario,
                    email,
                    foto_perfil,
                    vidas,
                    streak,
                    xp,
                    xp_semanal,
                    posicao_ranking,
                    divisao,
                    atvidades_concluidas_portugues,
                    atvidades_concluidas_matematica,
                    atvidades_concluidas_ciencias,
                    atvidades_concluidas_geografia,
                    atvidades_concluidas_ingles,
                    atvidades_concluidas_historia,
                    atvidades_concluidas_geral
                FROM usuarios
                WHERE id_usuario = ?
            `

            connection.query(
                sql,
                [idUsuario],
                (error, results) => {

                    connection.end()

                    if (error) {
                        reject(error)
                        return
                    }

                    if (results.length === 0) {
                        resolve(null)
                        return
                    }

                    const usuario = results[0]

                    // Converte o BLOB da foto para uma imagem utilizável pelo React
                    if (usuario.foto_perfil) {

                        usuario.foto_perfil =
                            `data:image/jpeg;base64,${usuario.foto_perfil.toString('base64')}`

                    } else {

                        usuario.foto_perfil = ''

                    }

                    resolve(usuario)
                }
            )
        })
    }

    }

export default Conexao
