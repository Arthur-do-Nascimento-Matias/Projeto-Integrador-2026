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

                console.log('tamanho: ', perguntas.length)
                 if (!perguntas || perguntas.length === 0 || !perguntas[0]) {

                    console.log("Nenhuma pergunta encontrada.");

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
         static buscarOuCriarMissoes(idUsuario) {
        return new Promise((resolve, reject) => {

            const connection = Conexao.connect()

            const sqlBuscar = `
                SELECT
                    um.id_usuario_missao,
                    um.id_usuario,
                    um.id_missao,
                    um.data_missao,
                    um.progresso,
                    um.concluida,
                    um.concluida_em,
                    um.recompensa_entregue,
                    m.missao,
                    m.descricao,
                    m.tipo,
                    m.meta,
                    m.xp_recompensa

                FROM usuarios_missoes AS um

                INNER JOIN missoes AS m
                    ON m.id_missao = um.id_missao

                WHERE um.id_usuario = ?
                  AND um.data_missao = CURDATE()

                ORDER BY um.id_usuario_missao
            `

            connection.query(sqlBuscar, [idUsuario], (error, missoesDoDia) => {

                if (error) {
                    connection.end()
                    reject(error)
                    return
                }

                if (missoesDoDia.length > 0) {
                    connection.end()

                    resolve({
                        missoes: missoesDoDia
                    })

                    return
                }

                const sqlSorteio = `
                    SELECT
                        id_missao,
                        missao,
                        descricao,
                        tipo,
                        meta,
                        xp_recompensa

                    FROM missoes

                    WHERE ativa = 1

                    ORDER BY RAND()

                    LIMIT 3
                `

                connection.query(sqlSorteio, (error, missoesSorteadas) => {

                    if (error) {
                        connection.end()
                        reject(error)
                        return
                    }

                    if (missoesSorteadas.length < 3) {
                        connection.end()

                        reject(
                            new Error(
                                'Não existem três missões ativas disponíveis.'
                            )
                        )

                        return
                    }

                    const valores = missoesSorteadas.map((missao) => {
                        return [
                            idUsuario,
                            missao.id_missao,
                            new Date(),
                            0,
                            0,
                            0
                        ]
                    })

                    const sqlInserir = `
                        INSERT INTO usuarios_missoes (
                            id_usuario,
                            id_missao,
                            data_missao,
                            progresso,
                            concluida,
                            recompensa_entregue
                        )

                        VALUES ?
                    `

                    connection.query(
                        sqlInserir,
                        [valores],
                        (error) => {

                            if (error) {
                                connection.end()
                                reject(error)
                                return
                            }

                            connection.query(
                                sqlBuscar,
                                [idUsuario],
                                (error, resultadoFinal) => {

                                    connection.end()

                                    if (error) {
                                        reject(error)
                                        return
                                    }

                                    resolve({
                                        missoes: resultadoFinal
                                    })
                                }
                            )
                        }
                    )
                })
            })
        })
    }

    }

export default Conexao
