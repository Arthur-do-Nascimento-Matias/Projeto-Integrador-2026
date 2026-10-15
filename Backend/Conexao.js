import mysql from 'mysql'
import { resolve } from 'nodemailer/lib/shared/url.js'

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
                    bio,
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

static mudarPerfil(dados) {

    return new Promise((resolve, reject) => {

        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'integrador',
        })

        connection.connect()

        const sql = 'UPDATE usuarios SET bio = ? WHERE id_usuario = ?'

        connection.query(sql, [dados.bio, dados.id], (error, results) => {

                connection.end()

                if (error) {
                    console.error('Erro ao atualizar perfil:', error)
                    reject(error)
                    return
                }

                console.log('Perfil atualizado:', results)

                resolve(results)
            }
        )
    })
}
static atualizarFoto(dados) {

    return new Promise((resolve, reject) => {

        const connection = Conexao.connect()

        const fotoBuffer = Buffer.from(dados.foto)

        const sql = `
            UPDATE usuarios
            SET foto_perfil = ?
            WHERE id_usuario = ?
        `

        connection.query(
            sql,
            [fotoBuffer, dados.id],
            (error, results) => {

                connection.end()

                if (error) {
                    console.error('ERRO AO ATUALIZAR FOTO:', error)
                    reject(error)
                    return
                }

                console.log('FOTO SALVA:', results)

                resolve(results)
            }
        )
    })
}

static atualizarAtividade(dados) {
      return new Promise((resolve, reject) => {

        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'integrador',
        })

        connection.connect()

        console.log(dados.materia)

        const colunas = [
            'atvidades_concluidas_geral',
            'atvidades_concluidas_matematica',
            'atvidades_concluidas_portugues',
            'atvidades_concluidas_historia',
            'atvidades_concluidas_geografia',
            'atvidades_concluidas_ciencias',
            'atvidades_concluidas_ingles'
        ]

        const coluna = colunas[dados.materia]

        console.log('coluna', coluna)

        const sql = `
                UPDATE usuarios
                SET atvidades_concluidas_geral = atvidades_concluidas_geral + 1, ${coluna} = ${coluna} + 1
                WHERE id_usuario = ?;
        `

        connection.query(sql, [dados.id], (error, results) => {

            connection.end()
            
            if(error){
                reject(error)
                return
            }

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
