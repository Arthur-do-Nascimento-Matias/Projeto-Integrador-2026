import mysql from 'mysql'
import bcrypt from 'bcrypt'
import Email from './Email.js'

class Cadastro {

    // Guarda temporariamente os cadastros que ainda não foram verificados
    static verificacoes = new Map()

    static async cadastrar(dados) {

        return new Promise((resolve, reject) => {

            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'integrador',
            })

            connection.connect()

            const sqlVerificador = `
                SELECT nome_de_usuario, email
                FROM usuarios
                WHERE email = ? OR nome_de_usuario = ?
            `

            connection.query(
                sqlVerificador,
                [dados.email, dados.nomeUsuario],
                async function (error, results) {

                    if (error) {
                        connection.end()
                        reject(error)
                        return
                    }

                    if (results.length > 0) {

                        if (results[0].email === dados.email) {
                            connection.end()
                            resolve({
                                ok: false,
                                message: 'Email já cadastrado'
                            })
                            return
                        }

                        if (results[0].nome_de_usuario === dados.nomeUsuario) {
                            connection.end()
                            resolve({
                                ok: false,
                                message: 'Nome de usuário já cadastrado'
                            })
                            return
                        }
                    }

                    // Gera um código de 6 dígitos
                    const codigo = Math.floor(
                        100000 + Math.random() * 900000
                    ).toString()

                    // Expira em 10 minutos
                    const expira = Date.now() + 10 * 60 * 1000

                    // Guarda TODOS os dados originais
                    Cadastro.verificacoes.set(dados.email, {
                        dados,
                        codigo,
                        expira
                    })

                    connection.end()

                    try {

                        await Email.enviarCodigo(
                            dados.email,
                            codigo
                        )

                        resolve({
                            ok: true,
                            message: 'Código enviado para o email'
                        })

                    } catch (erro) {

                        // Se o email falhar, remove a verificação
                        Cadastro.verificacoes.delete(dados.email)

                        console.error(erro)

                        resolve({
                            ok: false,
                            message: 'Não foi possível enviar o código'
                        })
                    }
                }
            )
        })
    }


    static verificarCodigo(dados) {

    return new Promise(async (resolve, reject) => {

        const verificacao = Cadastro.verificacoes.get(dados.email)

        if (!verificacao) {
            resolve({
                ok: false,
                message: 'Nenhum código de verificação encontrado'
            })
            return
        }

        if (Date.now() > verificacao.expira) {

            Cadastro.verificacoes.delete(dados.email)

            resolve({
                ok: false,
                message: 'O código expirou'
            })
            return
        }

        if (dados.codigo !== verificacao.codigo) {

            resolve({
                ok: false,
                message: 'Código incorreto'
            })
            return
        }

        const dadosCadastro = verificacao.dados

        try {

            const hash = await bcrypt.hash(
                dadosCadastro.senha,
                10
            )

            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'integrador',
            })

            connection.connect()

            const sql = `
                INSERT INTO usuarios
                (
                    nome_de_exibicao,
                    nome_de_usuario,
                    email,
                    senha,
                    vidas,
                    streak,
                    xp,
                    xp_semanal,
                    atvidades_concluidas_portugues,
                    atvidades_concluidas_matematica,
                    atvidades_concluidas_ciencias,
                    atvidades_concluidas_geografia,
                    atvidades_concluidas_ingles,
                    atvidades_concluidas_historia,
                    atvidades_concluidas_geral
                )
                VALUES (?, ?, ?, ?, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            `

            connection.query(
                sql,
                [
                    dadosCadastro.nomeExibição,
                    dadosCadastro.nomeUsuario,
                    dadosCadastro.email,
                    hash
                ],
                function (error, results) {

                    connection.end()

                    if (error) {
                        console.error(error)

                        resolve({
                            ok: false,
                            message: 'Erro ao criar conta'
                        })

                        return
                    }

                    Cadastro.verificacoes.delete(dados.email)

                    resolve({
                        ok: true,
                        message: 'Conta criada com sucesso'
                    })
                }
            )

        } catch (erro) {

            console.error(erro)

            resolve({
                ok: false,
                message: 'Erro ao criar conta'
            })
        }
    })
}}

export default Cadastro
