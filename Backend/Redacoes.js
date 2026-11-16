import Conexao from './Conexao.js'

class Redacoes {

    static listarTemas() {
        return new Promise((resolve, reject) => {

            const connection = Conexao.connect()

            const sql = `
                SELECT
                    id_tema,
                    titulo,
                    descricao,
                    textos_motivadores,
                    tipo,
                    dificuldade,
                    xp_recompensa

                FROM temas_redacao

                WHERE ativo = 1

                ORDER BY criado_em DESC
            `

            connection.query(sql, (error, temas) => {

                connection.end()

                if (error) {
                    reject(error)
                    return
                }

                resolve(temas)
            })
        })
    }

    static buscarTema(idTema) {
        return new Promise((resolve, reject) => {

            const connection = Conexao.connect()

            const sql = `
                SELECT
                    id_tema,
                    titulo,
                    descricao,
                    textos_motivadores,
                    tipo,
                    dificuldade,
                    xp_recompensa

                FROM temas_redacao

                WHERE id_tema = ?
                  AND ativo = 1

                LIMIT 1
            `

            connection.query(sql, [idTema], (error, temas) => {

                connection.end()

                if (error) {
                    reject(error)
                    return
                }

                resolve(temas[0] || null)
            })
        })
    }

    static salvarRascunho(dados) {
        return new Promise((resolve, reject) => {

            const idUsuario = Number(dados.id_usuario)
            const idTema = Number(dados.id_tema)
            const titulo = String(dados.titulo || '').trim() || null
            const conteudo = String(dados.conteudo || '')

            const quantidadePalavras = conteudo.trim()
                ? conteudo.trim().split(/\s+/).length
                : 0

            if (!idUsuario || !idTema) {
                reject(new Error('Usuário ou tema inválido.'))
                return
            }

            const connection = Conexao.connect()

            const sqlBuscar = `
                SELECT id_redacao

                FROM redacoes

                WHERE id_usuario = ?
                  AND id_tema = ?
                  AND status = 'rascunho'

                ORDER BY id_redacao DESC

                LIMIT 1
            `

            connection.query(
                sqlBuscar,
                [idUsuario, idTema],
                (error, rascunhos) => {

                    if (error) {
                        connection.end()
                        reject(error)
                        return
                    }

                    if (rascunhos.length > 0) {

                        const idRedacao = rascunhos[0].id_redacao

                        const sqlAtualizar = `
                            UPDATE redacoes

                            SET
                                titulo = ?,
                                conteudo = ?,
                                quantidade_palavras = ?

                            WHERE id_redacao = ?
                        `

                        connection.query(
                            sqlAtualizar,
                            [
                                titulo,
                                conteudo,
                                quantidadePalavras,
                                idRedacao
                            ],
                            (error) => {

                                connection.end()

                                if (error) {
                                    reject(error)
                                    return
                                }

                                resolve({
                                    id_redacao: idRedacao,
                                    criado: false,
                                    quantidade_palavras: quantidadePalavras
                                })
                            }
                        )

                        return
                    }

                    const sqlInserir = `
                        INSERT INTO redacoes (
                            id_usuario,
                            id_tema,
                            titulo,
                            conteudo,
                            status,
                            quantidade_palavras
                        )

                        VALUES (?, ?, ?, ?, 'rascunho', ?)
                    `

                    connection.query(
                        sqlInserir,
                        [
                            idUsuario,
                            idTema,
                            titulo,
                            conteudo,
                            quantidadePalavras
                        ],
                        (error, resultado) => {

                            connection.end()

                            if (error) {
                                reject(error)
                                return
                            }

                            resolve({
                                id_redacao: resultado.insertId,
                                criado: true,
                                quantidade_palavras: quantidadePalavras
                            })
                        }
                    )
                }
            )
        })
    }

    static buscarRascunho(idUsuario, idTema) {
        return new Promise((resolve, reject) => {

            const connection = Conexao.connect()

            const sql = `
                SELECT
                    r.id_redacao,
                    r.id_usuario,
                    r.id_tema,
                    r.titulo,
                    r.conteudo,
                    r.quantidade_palavras,
                    r.atualizada_em,
                    t.titulo AS tema

                FROM redacoes AS r

                INNER JOIN temas_redacao AS t
                    ON t.id_tema = r.id_tema

                WHERE r.id_usuario = ?
                  AND r.id_tema = ?
                  AND r.status = 'rascunho'

                ORDER BY r.id_redacao DESC

                LIMIT 1
            `

            connection.query(
                sql,
                [idUsuario, idTema],
                (error, rascunhos) => {

                    connection.end()

                    if (error) {
                        reject(error)
                        return
                    }

                    resolve(rascunhos[0] || null)
                }
            )
        })
    }

    static listarHistorico(idUsuario) {
        return new Promise((resolve, reject) => {

            const connection = Conexao.connect()

            const sql = `
                SELECT
                    r.id_redacao,
                    r.titulo,
                    r.status,
                    r.quantidade_palavras,
                    r.enviada_em,
                    r.atualizada_em,
                    t.id_tema,
                    t.titulo AS tema,
                    c.nota_total

                FROM redacoes AS r

                INNER JOIN temas_redacao AS t
                    ON t.id_tema = r.id_tema

                LEFT JOIN correcoes_redacao AS c
                    ON c.id_correcao = (
                        SELECT MAX(c2.id_correcao)

                        FROM correcoes_redacao AS c2

                        WHERE c2.id_redacao = r.id_redacao
                    )

                WHERE r.id_usuario = ?
                  AND r.status != 'rascunho'

                ORDER BY r.atualizada_em DESC
            `

            connection.query(
                sql,
                [idUsuario],
                (error, historico) => {

                    connection.end()

                    if (error) {
                        reject(error)
                        return
                    }

                    resolve(historico)
                }
            )
        })
    }
        static listarReferencias() {
        return new Promise((resolve, reject) => {

            const connection = Conexao.connect()

            const sql = `
                SELECT
                    r.id_referencia,
                    r.id_tema,
                    r.titulo,
                    r.autor,
                    r.fonte,
                    r.fonte_url,
                    r.conteudo,
                    r.nota_competencia_1,
                    r.nota_competencia_2,
                    r.nota_competencia_3,
                    r.nota_competencia_4,
                    r.nota_competencia_5,
                    r.nota_total,
                    r.analise_geral,
                    r.anotacoes,
                    r.destaque,
                    r.criado_em,
                    t.titulo AS tema

                FROM redacoes_referencia AS r

                INNER JOIN temas_redacao AS t
                    ON t.id_tema = r.id_tema

                WHERE r.ativo = 1

                ORDER BY r.destaque DESC, r.criado_em DESC
            `

            connection.query(sql, (error, referencias) => {

                connection.end()

                if (error) {
                    reject(error)
                    return
                }

                resolve(referencias)
            })
        })
    }
}

export default Redacoes