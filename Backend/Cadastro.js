import { error } from "console"

class Cadastro {
    static cadastrar() {
        return new Promise((resolve, reject) => {
            
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'integrador',
            })
    
            connection.connect()

            sql = ''

        })
    }
}

export default Cadastro
