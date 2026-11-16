import nodemailer from 'nodemailer';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import fs from 'node:fs';
import 'dotenv/config';

class Email {
    // Conexão com o banco de dados
    static pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'integrador',

        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        connectTimeout: 10000,
    });

    // Obter conexão do pool
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

    // Executar consultas SQL
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

    // Redefinir senha
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
        let transacaoIniciada = false;

        try {
            const tokenHash = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            // Iniciar transação
            await new Promise((resolve, reject) => {
                connection.beginTransaction(erro => {
                    if (erro) return reject(erro);
                    transacaoIniciada = true;
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

            // Criptografar nova senha
            const senhaHash = await bcrypt.hash(novaSenha, 12);

            // Atualizar senha do usuário
            await Email.consultar(
                connection,
                'UPDATE usuarios SET senha = ? WHERE email = ?',
                [senhaHash, email]
            );

            // Invalidar tokens anteriores
            await Email.consultar(
                connection,
                'DELETE FROM verificacaotrocarsenha WHERE email = ?',
                [email]
            );

            // Confirmar transação
            await new Promise((resolve, reject) => {
                connection.commit(erro => {
                    if (erro) return reject(erro);
                    resolve();
                });
            });

            transacaoIniciada = false;

            return {
                sucesso: true,
                mensagem: 'Senha redefinida com sucesso!'
            };

        } catch (erro) {
            if (transacaoIniciada) {
                await new Promise(resolve => {
                    connection.rollback(() => resolve());
                });
            }

            throw erro;

        } finally {
            connection.release();
        }
    }

    // Recuperação de senha por e-mail
    static async recover(dados) {
        const connection = await Email.connect();

        try {
            const email = dados.email.trim().toLowerCase();

            // Verificar se o usuário existe
            const usuarios = await Email.consultar(
                connection,
                'SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1',
                [email]
            );

            const mensagem =
                'Se o e-mail estiver cadastrado, você receberá um link de recuperação.';

            if (usuarios.length === 0) {
                return { mensagem };
            }

            // Gerar token aleatório
            const token = crypto.randomBytes(32).toString('hex');

            // Gerar hash do token
            const tokenHash = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            // Apagar solicitações anteriores
            await Email.consultar(
                connection,
                'DELETE FROM verificacaotrocarsenha WHERE email = ?',
                [email]
            );

            // Salvar token e data
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

            // Criar link de recuperação
            const link = new URL(
                '/redefinir-senha',
                process.env.FRONTEND_URL || 'http://localhost:5173'
            );

            link.searchParams.set('token', token);

            // Enviar e-mail
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

    // Configuração do Nodemailer
    static transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        family: 4,

        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // Enviar código de verificação
    static async enviarCodigo(email, codigo) {
        try {
            const resultado = await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Código de verificação - SimioLAB',

                html: `
                    <h2>Verificação de cadastro</h2>

                    <p>Seu código de verificação do SimioLAB é:</p>

                    <h1>${codigo}</h1>

                    <p>Esse código expira em 10 minutos.</p>
                `
            });

            return resultado;

        } catch (erro) {
            console.error('ERRO AO ENVIAR EMAIL:');
            console.error(erro);

            throw erro;
        }
    }
}

export default Email;
