import mysql from 'mysql'
import bcrypt from 'bcrypt'

class Login {

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
                SELECT email, senha, nome_de_usuario
                FROM usuarios
                WHERE nome_de_usuario = ?
                OR email = ?
            `

            connection.query(sql, [dados.emailOuUsuario, dados.emailOuUsuario], function(error, results) {

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

                    bcrypt.compare(
                        dados.senha,
                        results[0].senha,
                        function(err, senhaCorreta) {

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

                            connection.end()

                            resolve({
                                ok: true
                            })
                        }
                    )
                }
            )
        })
    }
}

export default Login
