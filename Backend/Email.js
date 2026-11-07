import nodemailer from 'nodemailer'
import mysql from 'mysql';

class Email {

    static connect() {
            const connection = mysql.createConnection({
                host: '127.0.0.1',
                user: 'root',
                password: '',
                database: 'integrador-novo-pqbugou'
            });
            connection.connect();
            return connection;
    }

    static recover(dados) {
        return new Promise((resolve, reject) => {
            const connection = Email.connect()
            const sql = `SELECT * FROM usuarios WHERE email = ?`
             connection.query(sql, [dados.email], (error, results) => {
                if(error){
                    connection.end()
                    return reject(error)
                }
                connection.end()
                if(results.length == 0) return

                const resultado = this.transporter.sendMail({

                    from: 'projetointegradoratgk@gmail.com',

                    to: dados.email,

                    subject: 'Redefinição de senha - SimioLAB',

                    html: `
                            <h2>Redefinição de senha</h2>

                            <p>Clique no botão abaixo para redefinir sua senha</p>

                            <button>Redefina sua senha</button>
                         `
                })

                console.log('pinto')
                return resultado

             })
        })
    }

    static transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,

        family: 4,

        auth: {
            user: 'projetointegradoratgk@gmail.com',
            pass: 'cxvv ewhx ebak zutx'
        }
    })

    static async enviarCodigo(email, codigo) {

        try {

            const resultado = await this.transporter.sendMail({

                from: 'projetointegradoratgk@gmail.com',

                to: email,

                subject: 'Código de verificação - SimioLAB',

                html: `
                    <h2>Verificação de cadastro</h2>

                    <p>Seu código de verificação do SimioLAB é:</p>

                    <h1>${codigo}</h1>

                    <p>Esse código expira em 10 minutos.</p>
                `
            })

            return resultado

        } catch (erro) {

            console.error('ERRO AO ENVIAR EMAIL:')
            console.error(erro)

            throw erro
        }
    }
}

export default Email
