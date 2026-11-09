import nodemailer from 'nodemailer'
import mysql from 'mysql';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

class Email {

    static pool = mysql.createPool({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'integrador',

        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        connectTimeout: 10000
    });

    static connect() {
        return new Promise((resolve, reject) => {
            Email.pool.getConnection((erro, connection) => {
                if (erro) {
                    console.error('Erro de conexão MySQL:', erro);
                    return reject(erro);
                }

                resolve(connection);
            });
        });
    }

    static consultar(connection, sql, parametros = []) {
        return new Promise((resolve, reject) => {
            connection.query(sql, parametros, (erro, resultados) => {
                if (erro) {
                    return reject(erro);
                }

                resolve(resultados);
            });
        });
    }

    static async redefinirSenha(token, novaSenha) {
        if (
            typeof token !== 'string' ||
            !/^[a-f0-9]{64}$/.test(token)
        ) {
            throw new Error('Token inválido.');
        }

        if (
            typeof novaSenha !== 'string' ||
            novaSenha.length < 8
        ) {
            throw new Error('A senha deve ter pelo menos 8 caracteres.');
        }

        const connection = await Email.connect();

        try {
            const tokenHash = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            // Iniciar transação para impedir reutilização do token
            await new Promise((resolve, reject) => {
                connection.beginTransaction(erro => {
                    if (erro) return reject(erro);
                    resolve();
                });
            });

            // Verificar token e expiração
            const registros = await Email.consultar(
                connection,
                `
                    SELECT email
                    FROM verificacaotrocarsenha
                    WHERE token = ?
                    AND data > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
                    LIMIT 1
                    FOR UPDATE
                `,
                [tokenHash]
            );

            if (registros.length === 0) {
                throw new Error('Token inválido ou expirado.');
            }

            const email = registros[0].email;

            // Criptografar a nova senha
            const senhaHash = await bcrypt.hash(novaSenha, 12);

            // Atualizar usuário
            await Email.consultar(
                connection,
                'UPDATE usuarios SET senha = ? WHERE email = ?',
                [senhaHash, email]
            );

            // Invalidar os tokens do usuário
            await Email.consultar(
                connection,
                'DELETE FROM verificacaotrocarsenha WHERE email = ?',
                [email]
            );

            await new Promise((resolve, reject) => {
                connection.commit(erro => {
                    if (erro) return reject(erro);
                    resolve();
                });
            });

            return {
                sucesso: true,
                mensagem: 'Senha redefinida com sucesso!'
            };

        } catch (erro) {
            await new Promise(resolve => {
                connection.rollback(() => resolve());
            });

            throw erro;

        } finally {
            connection.release();
        }
    }

    static async recover(dados) {
        const connection = await Email.connect();

        try {
            const email = dados.email.trim().toLowerCase();

            // 1. Verificar se o usuário existe
            const usuarios = await Email.consultar(
                connection,
                'SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1',
                [email]
            );

            const mensagem = 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.';

            if (usuarios.length === 0) {
                return { mensagem };
            }

            // 2. Gerar token aleatório
            const token = crypto.randomBytes(32).toString('hex');

            // 3. Gerar o hash que será armazenado no banco
            const tokenHash = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            // 4. Apagar solicitações anteriores
            await Email.consultar(
                connection,
                'DELETE FROM verificacaotrocarsenha WHERE email = ?',
                [email]
            );

            // 5. Salvar token e data de criação
            const sqlVerificacao = `
                INSERT INTO verificacaotrocarsenha
                    (email, token, data)
                VALUES
                    (?, ?, NOW())
            `;

            await Email.consultar(
                connection,
                sqlVerificacao,
                [email, tokenHash]
            );

            // 6. Criar link de recuperação
            const link = new URL(
                '/redefinir-senha',
                process.env.FRONTEND_URL || 'http://localhost:5173'
            );

            link.searchParams.set('token', token);

            // 7. Enviar e-mail
            await Email.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Redefinição de senha - SimioLAB',

                html: `
                    <h2>Redefinição de senha</h2>

                    <p>Recebemos uma solicitação para redefinir sua senha.</p>

                    <p>Clique no botão abaixo:</p>

                    <a href="${link.toString()}"
                    style="
                        display: inline-block;
                        padding: 12px 20px;
                        background-color: #52663c;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                    ">
                        Redefinir minha senha
                    </a>

                    <p>O link expira em 10 minutos.</p>

                    <p>Se você não solicitou a recuperação, ignore este e-mail.</p>
                `
            });

            return { mensagem };

        } catch (erro) {
            console.error('Erro ao recuperar senha:', erro);
            throw erro;

        } finally {
            connection.release();
        }
    }

    static transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,

        family: 4,

        auth: {
            user: 'projetointegradoratgk@gmail.com',
            pass: 'bwtx nzyn utwh ftkm'
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
