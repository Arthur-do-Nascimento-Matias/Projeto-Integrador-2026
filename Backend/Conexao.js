
import { rejects } from 'assert';
import { error } from 'console';
import mysql from 'mysql';
import { resolve } from 'nodemailer/lib/shared/url.js';

class Conexao {
    static connect() {
        const connection = mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'integrador'
        });

        connection.connect();
        return connection;
    }

    static async getPosicao(idUser) {
        return new Promise((resolve, reject) => {
            const connection = Conexao.connect()

            const sql = `SELECT posicao
                            FROM (
                                SELECT
                                    id_usuario,
                                    ROW_NUMBER() OVER (
                                        ORDER BY xp_semanal DESC, id_usuario ASC
                                    ) AS posicao
                                FROM usuarios
                            ) AS ranking
                            WHERE id_usuario = ?;`

            connection.query(sql, [idUser], (error, results) => {
                if(error) {
                    connection.end()
                    return reject(error)
                }

                connection.end()

                resolve(results[0] ?? { posicao: null })
            })

        })
    }

    static async getRanking() {
        return new Promise((resolve, reject) => {
            
            const connection = Conexao.connect();

            const sql = `SELECT
                            id_usuario,
                            nome_de_exibicao,
                            nome_de_usuario,
                            xp_semanal
                        FROM usuarios
                        ORDER BY
                            xp_semanal DESC,
                            nome_de_exibicao ASC,
                            id_usuario ASC`

            connection.query(sql, (error, lista) => {

                if (error) {
                    connection.end()
                    return reject(error)
                }

                connection.end()

                resolve(lista)

            })

        })
    }

    static getAtividades(param) {
        return new Promise((resolve, reject) => {
            const connection = Conexao.connect();
            const sql = 'SELECT * FROM `perguntas` WHERE id_materia = ? AND ordem = ?';

            connection.query(sql, [param.materia, param.atividadeAtual], (error, perguntas) => {
                if (error) {
                    connection.end();
                    return reject(error);
                }

                if (!perguntas || perguntas.length === 0) {
                    connection.end();
                    return resolve({
                        concluido: true,
                        perguntas: [],
                        alternativas: []
                    });
                }

                const sqlAlternativas = 'SELECT * FROM `alternativas` WHERE id_pergunta = ?';

                connection.query(
                    sqlAlternativas,
                    [perguntas[0].id_pergunta],
                    (erroAlternativas, alternativas) => {
                        connection.end();

                        if (erroAlternativas) {
                            return reject(erroAlternativas);
                        }

                        resolve({
                            perguntas,
                            alternativas
                        });
                    }
                );
            });
        });
    }

    static criarTrilha(param) {
        return new Promise((resolve, reject) => {
            const connection = Conexao.connect();

            const sql = 'SELECT * FROM `perguntas` WHERE id_materia = ?';

            connection.query(sql, [param.id], (error, indices) => {
                connection.end();

                if (error) {
                    return reject(error);
                }

                resolve({
                    indices
                });
            });
        });
    }

    static buscarOuCriarMissoes(idUsuario) {
        return new Promise((resolve, reject) => {
            const connection = Conexao.connect();

            const sqlBuscar = `
                SELECT
                    um.id_usuario_missao,
                    um.id_usuario,
                    um.id_missao,
                    um.data_missao,
                    um.progresso,
                    um.concluida,
                    um.concluida_em,
                    um.recompensa_entregue,
                    m.missao,
                    m.descricao,
                    m.tipo,
                    m.meta,
                    m.xp_recompensa
                FROM usuarios_missoes AS um
                INNER JOIN missoes AS m
                    ON m.id_missao = um.id_missao
                WHERE um.id_usuario = ?
                  AND um.data_missao = CURDATE()
                ORDER BY um.id_usuario_missao
            `;

            connection.query(
                sqlBuscar,
                [idUsuario],
                (erroBusca, missoesDoDia) => {
                    if (erroBusca) {
                        connection.end();
                        return reject(erroBusca);
                    }

                    if (missoesDoDia.length > 0) {
                        connection.end();

                        return resolve({
                            missoes: missoesDoDia
                        });
                    }

                    const sqlSorteio = `
                        SELECT
                            id_missao,
                            missao,
                            descricao,
                            tipo,
                            meta,
                            xp_recompensa
                        FROM missoes
                        WHERE ativa = 1
                        ORDER BY RAND()
                        LIMIT 3
                    `;

                    connection.query(
                        sqlSorteio,
                        (erroSorteio, missoesSorteadas) => {
                            if (erroSorteio) {
                                connection.end();
                                return reject(erroSorteio);
                            }

                            if (missoesSorteadas.length < 3) {
                                connection.end();

                                return reject(
                                    new Error(
                                        'Não existem três missões ativas disponíveis.'
                                    )
                                );
                            }

                            const valores = missoesSorteadas.map((missao) => [
                                idUsuario,
                                missao.id_missao,
                                new Date(),
                                0,
                                0,
                                0
                            ]);

                            const sqlInserir = `
                                INSERT INTO usuarios_missoes (
                                    id_usuario,
                                    id_missao,
                                    data_missao,
                                    progresso,
                                    concluida,
                                    recompensa_entregue
                                )
                                VALUES ?
                            `;

                            connection.query(
                                sqlInserir,
                                [valores],
                                (erroInsercao) => {
                                    if (erroInsercao) {
                                        connection.end();
                                        return reject(erroInsercao);
                                    }

                                    connection.query(
                                        sqlBuscar,
                                        [idUsuario],
                                        (erroFinal, resultadoFinal) => {
                                            connection.end();

                                            if (erroFinal) {
                                                return reject(erroFinal);
                                            }

                                            resolve({
                                                missoes: resultadoFinal
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        });
    }

    static getPerfil(idUsuario) {
        return new Promise((resolve, reject) => {
            const connection = Conexao.connect();

            const sql = `
                SELECT
                    id_usuario,
                    adm,
                    nome_de_exibicao,
                    nome_de_usuario,
                    bio,
                    email,
                    foto_perfil,
                    vidas,
                    streak,
                    xp,
                    xp_semanal,
                    posicao_ranking,
                    divisao,
                    atvidades_concluidas_portugues,
                    atvidades_concluidas_matematica,
                    atvidades_concluidas_ciencias,
                    atvidades_concluidas_geografia,
                    atvidades_concluidas_ingles,
                    atvidades_concluidas_historia,
                    atvidades_concluidas_geral
                FROM usuarios
                WHERE id_usuario = ?
                LIMIT 1
            `;

            connection.query(sql, [idUsuario], (error, results) => {
                connection.end();

                if (error) {
                    console.error('Erro ao buscar perfil:', error);
                    return reject(error);
                }

                if (!results || results.length === 0) {
                    return resolve(null);
                }

                const usuario = results[0];

                // Converte a foto armazenada em BLOB para Base64
                if (usuario.foto_perfil) {
                    usuario.foto_perfil =
                        `data:image/jpeg;base64,${usuario.foto_perfil.toString('base64')}`;
                } else {
                    usuario.foto_perfil = '';
                }

                resolve(usuario);
            });
        });
    }

    static mudarPerfil(dados) {
        return new Promise((resolve, reject) => {
            const connection = Conexao.connect();

            const sql = `
                UPDATE usuarios
                SET bio = ?
                WHERE id_usuario = ?
            `;

            connection.query(
                sql,
                [dados.bio, dados.id],
                (error, results) => {
                    connection.end();

                    if (error) {
                        console.error('Erro ao atualizar perfil:', error);
                        return reject(error);
                    }

                    resolve(results);
                }
            );
        });
    }

    static atualizarFoto(dados) {
        return new Promise((resolve, reject) => {
            // Aceita Buffer ou conteúdo binário recebido
            const fotoBuffer = Buffer.isBuffer(dados.foto)
                ? dados.foto
                : Buffer.from(dados.foto);

            const connection = Conexao.connect();

            const sql = `
                UPDATE usuarios
                SET foto_perfil = ?
                WHERE id_usuario = ?
            `;

            connection.query(
                sql,
                [fotoBuffer, dados.id],
                (error, results) => {
                    connection.end();

                    if (error) {
                        console.error('Erro ao atualizar foto:', error);
                        return reject(error);
                    }

                    resolve(results);
                }
            );
        });
    }

    static atualizarAtividade(dados) {
        const colunas = [
            'atvidades_concluidas_geral',
            'atvidades_concluidas_matematica',
            'atvidades_concluidas_portugues',
            'atvidades_concluidas_historia',
            'atvidades_concluidas_geografia',
            'atvidades_concluidas_ciencias',
            'atvidades_concluidas_ingles'
        ];

        const indice = Number(dados.materia);

        if (
            !Number.isInteger(indice) ||
            indice < 0 ||
            indice >= colunas.length
        ) {
            return Promise.reject(
                new Error('Matéria inválida.')
            );
        }

        const coluna = colunas[indice];

        // Evita incrementar a coluna geral duas vezes
        const atualizacoes = coluna === 'atvidades_concluidas_geral'
            ? '`atvidades_concluidas_geral` = `atvidades_concluidas_geral` + 1'
            : `
                \`atvidades_concluidas_geral\` =
                    \`atvidades_concluidas_geral\` + 1,
                \`${coluna}\` = \`${coluna}\` + 1
            `;

        return new Promise((resolve, reject) => {
            const connection = Conexao.connect();

            console.log('atualizar')

            const sql = `
                UPDATE usuarios
                SET ${atualizacoes},
                    xp = xp + ?,
                    xp_semanal = xp_semanal + ?
                WHERE id_usuario = ?
            `;

            connection.query(sql, [dados.xp, dados.xp, dados.id], (error, results) => {
                connection.end();

                if (error) {
                    return reject(error);
                }

                resolve(results);
            });
        });
    }
}

export default Conexao;
