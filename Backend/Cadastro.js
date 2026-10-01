import { error } from "console"

class Cadastro {
    static cadastrar(dados) {
        return new Promise((resolve, reject) => {
            
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'integrador',
            })
    
            connection.connect()

            const sql = 'INSERT INTO `usuarios`(`nome_de_exibicao`, `nome_de_usuario`, `email`, `senha`, `vidas`, `streak`, `xp`, `xp_semanal`, `atvidades_concluidas_portugues`, `atvidades_concluidas_matematica`, `atvidades_concluidas_ciencias`, `atvidades_concluidas_geografia`, `atvidades_concluidas_ingles`, `atvidades_concluidas_historia`, `atvidades_concluidas_geral`) VALUES (?, ?, ?, ?,`5`,`0`,`0`,`0`,`0`,`0`,`0,`0`,`0`,`0`,`0`)'

            connection.query(sql, [dados.nomeExibição, dados.nomeUsuario, dados.email, dados.senha], function(error, results) {

            if (error) {
                connection.end()
                reject(error)
                return
            }

            connection.end()

        })
    }
)}}

export default Cadastro
