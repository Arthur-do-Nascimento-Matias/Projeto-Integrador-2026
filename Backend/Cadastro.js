import mysql from 'mysql'
import bcrypt from 'bcrypt'

class Cadastro {

    static cadastrar(dados) {

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

            const sqlVerificador = 'SELECT nome_de_usuario, email from usuarios WHERE email = ? or nome_de_usuario = ?'

            connection.query(sqlVerificador, [dados.email, dados.nomeUsuario], function(error, results) {
                if(error) {
                    connection.end()
                    reject(error)
                    return
                }
                if(results.length > 0){

                    if(results[0].email === dados.email) {
                        connection.end()
                        resolve({message: 'Email já cadastrado'})
                        return
                    }
                    if(results[0].nome_de_usuario === dados.nomeUsuario){
                        connection.end()
                        resolve({message: 'Nome de usuário já cadastrado'})
                        return
                    }
                }

            bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {

            if(err){
                reject(err)
                return
            }
            
            const sql = 'INSERT INTO `usuarios`(`nome_de_exibicao`, `nome_de_usuario`, `email`, `senha`, `vidas`, `streak`, `xp`, `xp_semanal`, `atvidades_concluidas_portugues`, `atvidades_concluidas_matematica`, `atvidades_concluidas_ciencias`, `atvidades_concluidas_geografia`, `atvidades_concluidas_ingles`, `atvidades_concluidas_historia`, `atvidades_concluidas_geral`) VALUES (?, ?, ?, ?,5,0,0,0,0,0,0,0,0,0,0)'

            connection.query(sql, [dados.nomeExibição, dados.nomeUsuario, dados.email, hash], function(error, results) {

            if (error) {
                connection.end()
                reject(error)
                return
            }

            connection.end()
            resolve({ok: true})
            return
            })
        })}
    )}
)}}


export default Cadastro
