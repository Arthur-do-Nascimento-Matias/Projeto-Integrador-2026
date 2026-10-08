import mysql from 'mysql'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

class Login {

    static sessoes = new Map()

    static login(dados) {

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
                    senha,
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
                WHERE nome_de_usuario = ?
                OR email = ?
            `

            connection.query(
                sql,
                [dados.emailOuUsuario, dados.emailOuUsuario],
                function (error, results) {

                    if (error) {
                        connection.end()
                        reject(error)
                        return
                    }

                    if (results.length === 0) {
                        connection.end()

                        resolve({
                            message: 'Login ou senha incorretos'
                        })

                        return
                    }

                    const usuario = results[0]

                    bcrypt.compare(
                        dados.senha,
                        usuario.senha,
                        function (err, senhaCorreta) {

                            if (err) {
                                connection.end()
                                reject(err)
                                return
                            }

                            if (!senhaCorreta) {
                                connection.end()

                                resolve({
                                    message: 'Login ou senha incorretos'
                                })

                                return
                            }

                            // =========================
                            // GERA TOKEN DA SESSÃO
                            // =========================

                            const token = crypto.randomBytes(32).toString('hex')

                            Login.sessoes.set(token, usuario.id_usuario)

                            connection.end()

                            resolve({
                                ok: true,
                                token,
                                usuario
                            })
                        }
                    )
                }
            )
        })
    }

    static autenticar(token) {

        if (!token) {
            return null
        }

        return Login.sessoes.get(token) || null
    }

    static encerrarSessao(token) {

        Login.sessoes.delete(token)
    }
}

export default Login
