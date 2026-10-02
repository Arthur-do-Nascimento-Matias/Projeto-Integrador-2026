import mysql from 'mysql'
import bcrypt from 'bcrypt'

class Login {

    static login(dados) {

    const saltRounds = 10;
    const myPlaintextPassword = dados.senha;

        return new Promise((resolve, reject) => {
            
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'integrador',
            })

            connection.connect()

            bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
        
                    if(err){
                        reject(err)
                        return
                    }

            const sql = `SELECT email, senha, nome_de_usuario
                        FROM usuarios
                        WHERE senha = ?
                        AND (
                            nome_de_usuario = ?
                            OR email = ?
                        );`

            connection.query(sql, [hash, dados.usuarioOuEmail, dados.usuarioOuEmail],function(error, results) {

            if (error) {
                connection.end()
                reject(error)
                return
            }

            connection.end()
            resolve()
            })
        })
    }
)}}

export default Login
