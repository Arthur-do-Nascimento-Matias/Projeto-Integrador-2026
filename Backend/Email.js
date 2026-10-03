import nodemailer from 'nodemailer'

class Email {

    static transporter = nodemailer.createTransport({

        service: 'gmail',

        auth: {
            user: 'projetointegradoratgk@gmail.com',
            pass: ''
        }

    })

    static async enviarCodigo(email, codigo) {

        console.log('========== EMAIL ==========')
        console.log('Destinatário:', email)
        console.log('Código:', codigo)

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

            console.log('EMAIL ENVIADO!')
            console.log('Message ID:', resultado.messageId)

            return resultado

        } catch (erro) {

            console.error('ERRO AO ENVIAR EMAIL:')
            console.error(erro)

            throw erro
        }
    }
}

export default Email
