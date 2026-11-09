
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
            database: 'integrador-novo-pqbugou'
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
                            xp_semanal,
                            foto_perfil_texto AS foto
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
    static criarTrilha(id, idUser) {
        const colunas = [
            'atvidades_concluidas_geral',
            'atvidades_concluidas_matematica',
            'atvidades_concluidas_portugues',
            'atvidades_concluidas_historia',
            'atvidades_concluidas_geografia',
            'atvidades_concluidas_ciencias',
            'atvidades_concluidas_ingles'
        ];
        return new Promise((resolve, reject) => {
            const connection = Conexao.connect();
            console.log("ID da matéria:", id);
            console.log("ID do usuário:", idUser);
            const sql = `
                SELECT
                    p.*,
                    u.${colunas[id]} AS atividades_concluidas
                FROM perguntas p
                JOIN usuarios u ON u.id_usuario = ?
                WHERE p.id_materia = ?
                ORDER BY p.ordem ASC;
`;
            connection.query(sql, [idUser, id], (error, indices) => {
                connection.end();
                if (error) {
                    return reject(error);
                }
                console.log('here')
                console.log(indices)
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
                            foto_perfil_texto AS foto,
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
                            atvidades_concluidas_geral,
                            (SELECT COUNT(*) FROM perguntas) AS total_perguntas
                        FROM usuarios
                        WHERE id_usuario = ?
                        LIMIT 1;
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
                resolve(usuario);
            });
        });
    }
    static mudarNome(dados) {
        return new Promise((resolve, reject) => {
            const connection = Conexao.connect();
            const sql = `
                UPDATE usuarios
                SET nome_de_exibicao = ?
                WHERE id_usuario = ?
            `;
            connection.query(
                sql,
                [dados.nome, dados.id],
                (error, results) => {
                    connection.end();
                    if (error) {
                        console.error('Erro ao atualizar perfil:', error);
                        return reject(error);
                    }
                    resolve(results);
                }
            );
        })
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
            const connection = Conexao.connect();
            const sql = `
                UPDATE usuarios
                SET foto_perfil_texto = ?
                WHERE id_usuario = ?
            `;
            connection.query(
                sql,
                [dados.foto, dados.id],
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
    static async atualizarAtividade(dados) {
        const colunas = [
            'atvidades_concluidas_geral',
            'atvidades_concluidas_matematica',
            'atvidades_concluidas_portugues',
            'atvidades_concluidas_historia',
            'atvidades_concluidas_geografia',
            'atvidades_concluidas_ciencias',
            'atvidades_concluidas_ingles'
        ];
        const materia = Number(dados.materia);
        const atividade = Number(dados.atividade);
        const idUsuario = Number(dados.id);
        const falha = (mensagem, status = 400) => Object.assign(new Error(mensagem), { status });
        if (!Number.isInteger(materia) || materia < 1 || materia >= colunas.length) {
            throw falha('Matéria inválida.');
        }
        if (!Number.isSafeInteger(atividade) || atividade < 1) {
            throw falha('Informe o número da atividade, não o índice da pergunta.');
        }
        if (!Number.isSafeInteger(idUsuario) || idUsuario < 1) {
            throw falha('Usuário inválido.');
        }
        const coluna = colunas[materia];
        const xp = 50;
        const connection = Conexao.connect();
        const query = (sql, params) => new Promise((resolve, reject) => {
            connection.query(sql, params, (erro, resultado) => erro ? reject(erro) : resolve(resultado));
        });
        try {
            // Compare e atualize na mesma instrução SQL: duas chamadas concorrentes
            // para a atividade 1 não conseguem avançar o contador até 2.
            const resultado = await query(`
                UPDATE usuarios
                SET ${coluna} = ?,
                    atvidades_concluidas_geral = COALESCE(atvidades_concluidas_geral, 0) + 1,
                    xp = COALESCE(xp, 0) + ?,
                    xp_semanal = COALESCE(xp_semanal, 0) + ?
                WHERE id_usuario = ?
                  AND COALESCE(${coluna}, 0) = ?
            `, [atividade, xp, xp, idUsuario, atividade - 1]);
            if (resultado.affectedRows === 1) {
                return { registrada: true, jaRegistrada: false, xp_ganho: xp, atividades_concluidas: atividade };
            }
            const usuarios = await query(`
                SELECT COALESCE(${coluna}, 0) AS concluidas
                FROM usuarios WHERE id_usuario = ? LIMIT 1
            `, [idUsuario]);
            if (!usuarios.length) throw falha('Usuário não encontrado.', 404);
            const concluidas = Number(usuarios[0].concluidas);
            if (concluidas >= atividade) {
                return { registrada: false, jaRegistrada: true, xp_ganho: 0, atividades_concluidas: concluidas };
            }
            throw falha('Esta atividade ainda está bloqueada. Atualize a trilha.', 409);
        } finally {
            connection.end();
        }
    }
}

export default Conexao;
