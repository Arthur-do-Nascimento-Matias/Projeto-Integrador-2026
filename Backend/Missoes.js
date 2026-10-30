import Conexao from './Conexao.js'

const tiposDisponiveis = [
    'acertar_questao',
    'concluir_atividade',
    'abrir_livros',
    'acertos_seguidos',
    'atividade_sem_erros',
    'enviar_mensagem_moki',
    'estudar_materias',
    'visitar_biblioteca',
    'tempo_leitura'
]

let preparacao

function consultar(conexao, sql, valores = []) {
    return new Promise((resolve, reject) => {
        conexao.query(sql, valores, (erro, resultado) => {
            if (erro) {
                reject(erro)
            } else {
                resolve(resultado)
            }
        })
    })
}

function erroCliente(mensagem) {
    return Object.assign(
        new Error(mensagem),
        { status: 400 }
    )
}

export function calcularProgresso(eventos) {
    let sequencia = 0
    let melhorSequencia = 0
    let visitas = 0
    let mensagens = 0
    let segundosLeitura = 0

    const acertos = new Set()
    const atividades = new Set()
    const perfeitas = new Set()
    const materias = new Set()
    const livros = new Set()

    for (const evento of eventos) {
        if (evento.tipo === 'resposta') {
            if (Number(evento.correta) === 1) {
                if (!acertos.has(evento.referencia)) {
                    acertos.add(evento.referencia)
                    sequencia++

                    melhorSequencia = Math.max(
                        melhorSequencia,
                        sequencia
                    )
                }
            } else {
                sequencia = 0
            }
        }

        if (evento.tipo === 'atividade') {
            atividades.add(evento.referencia)
            materias.add(Number(evento.materia))

            if (Number(evento.correta) === 1) {
                perfeitas.add(evento.referencia)
            }
        }

        if (evento.tipo === 'livro') {
            livros.add(evento.referencia)
        }

        if (evento.tipo === 'biblioteca') {
            visitas = 1
        }

        if (evento.tipo === 'mensagem') {
            mensagens++
        }

        if (evento.tipo === 'leitura') {
            segundosLeitura += Number(evento.correta) || 0
        }
    }

    return {
        acertar_questao: acertos.size,
        concluir_atividade: atividades.size,
        abrir_livros: livros.size,
        acertos_seguidos: melhorSequencia,
        atividade_sem_erros: perfeitas.size,
        enviar_mensagem_moki: mensagens,
        estudar_materias: materias.size,
        visitar_biblioteca: visitas,
        tempo_leitura: Math.floor(segundosLeitura / 60)
    }
}

class Missoes {
    static preparar() {
        if (!preparacao) {
            preparacao = (async () => {
                const conexao = Conexao.connect()

                try {
                    await consultar(
                        conexao,
                        `
                        CREATE TABLE IF NOT EXISTS eventos_missoes (
                            id_evento BIGINT UNSIGNED
                                NOT NULL AUTO_INCREMENT PRIMARY KEY,

                            id_usuario INT NOT NULL,
                            data_evento DATE NOT NULL,
                            tipo VARCHAR(24) NOT NULL,
                            referencia VARCHAR(100) NOT NULL,
                            materia INT NULL,
                            correta TINYINT NULL,

                            criado_em DATETIME NOT NULL
                                DEFAULT CURRENT_TIMESTAMP,

                            UNIQUE KEY uq_evento_missao (
                                id_usuario,
                                data_evento,
                                tipo,
                                referencia
                            ),

                            KEY idx_eventos_dia (
                                id_usuario,
                                data_evento,
                                id_evento
                            )
                        )
                        ENGINE=InnoDB
                        DEFAULT CHARSET=utf8mb4
                        `
                    )
                } finally {
                    conexao.end()
                }
            })().catch(erro => {
                preparacao = null
                throw erro
            })
        }

        return preparacao
    }

    static buscar(conexao, idUsuario) {
        return consultar(
            conexao,
            `
            SELECT
                um.*,
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
            `,
            [idUsuario]
        )
    }

    static async processar(idUsuario, evento = null) {
        await Missoes.preparar()

        const conexao = Conexao.connect()

        try {
            await consultar(conexao, 'START TRANSACTION')

            // Impede duas ações simultâneas de duplicarem o XP.
            const usuarios = await consultar(
                conexao,
                `
                SELECT id_usuario
                FROM usuarios
                WHERE id_usuario = ?
                FOR UPDATE
                `,
                [idUsuario]
            )

            if (!usuarios.length) {
                throw erroCliente('Usuário não encontrado.')
            }

            let missoes = await Missoes.buscar(
                conexao,
                idUsuario
            )

            if (!missoes.length) {
                const sorteadas = await consultar(
                    conexao,
                    `
                    SELECT id_missao
                    FROM missoes
                    WHERE ativa = 1
                      AND tipo IN (?)
                    ORDER BY RAND()
                    LIMIT 3
                    `,
                    [tiposDisponiveis]
                )

                for (const missao of sorteadas) {
                    await consultar(
                        conexao,
                        `
                        INSERT INTO usuarios_missoes (
                            id_usuario,
                            id_missao,
                            data_missao,
                            progresso,
                            concluida,
                            recompensa_entregue
                        )
                        VALUES (?, ?, CURDATE(), 0, 0, 0)
                        `,
                        [idUsuario, missao.id_missao]
                    )
                }

                missoes = await Missoes.buscar(
                    conexao,
                    idUsuario
                )
            }

            const registrado = evento
                ? await Missoes.registrar(
                    conexao,
                    idUsuario,
                    evento
                )
                : false

            const eventos = await consultar(
                conexao,
                `
                SELECT *
                FROM eventos_missoes
                WHERE id_usuario = ?
                  AND data_evento = CURDATE()
                ORDER BY id_evento
                `,
                [idUsuario]
            )

            const contadores = calcularProgresso(eventos)

            let xpGanho = 0

            for (const missao of missoes) {
                const progresso = Math.min(
                    Number(missao.meta),
                    Math.max(
                        Number(missao.progresso) || 0,
                        contadores[missao.tipo] || 0
                    )
                )

                const concluida =
                    progresso >= Number(missao.meta)

                await consultar(
                    conexao,
                    `
                    UPDATE usuarios_missoes
                    SET
                        progresso = ?,
                        concluida = ?,
                        concluida_em = IF(
                            ? = 1,
                            COALESCE(concluida_em, NOW()),
                            concluida_em
                        )
                    WHERE id_usuario_missao = ?
                    `,
                    [
                        progresso,
                        concluida ? 1 : 0,
                        concluida ? 1 : 0,
                        missao.id_usuario_missao
                    ]
                )

                if (
                    concluida &&
                    !Number(missao.recompensa_entregue)
                ) {
                    const xp =
                        Number(missao.xp_recompensa) || 0

                    await consultar(
                        conexao,
                        `
                        UPDATE usuarios_missoes
                        SET recompensa_entregue = 1
                        WHERE id_usuario_missao = ?
                        `,
                        [missao.id_usuario_missao]
                    )

                    await consultar(
                        conexao,
                        `
                        UPDATE usuarios
                        SET
                            xp = xp + ?,
                            xp_semanal = xp_semanal + ?
                        WHERE id_usuario = ?
                        `,
                        [xp, xp, idUsuario]
                    )

                    await consultar(
                        conexao,
                        `
                        INSERT INTO historico_xp (
                            id_usuario,
                            xp_ganho,
                            origem
                        )
                        VALUES (?, ?, ?)
                        `,
                        [
                            idUsuario,
                            xp,
                            `missao:${missao.id_usuario_missao}`
                        ]
                    )

                    xpGanho += xp
                }
            }

            const resultado = await Missoes.buscar(
                conexao,
                idUsuario
            )

            await consultar(conexao, 'COMMIT')

            return {
                missoes: resultado,
                xp_ganho: xpGanho,
                registrado
            }
        } catch (erro) {
            await consultar(
                conexao,
                'ROLLBACK'
            ).catch(() => {})

            throw erro
        } finally {
            conexao.end()
        }
    }

    static async registrar(conexao, idUsuario, evento) {
        let {
            tipo,
            referencia,
            materia,
            correta
        } = evento

        const tiposPermitidos = [
            'resposta',
            'atividade',
            'biblioteca',
            'livro',
            'mensagem',
            'leitura'
        ]

        if (!tiposPermitidos.includes(tipo)) {
            throw erroCliente('Evento de missão inválido.')
        }

        if (tipo === 'leitura') {
            const sessao = String(evento.sessao || '')
            const pulso = Number(evento.pulso)

            if (
                !/^[a-f0-9-]{36}$/i.test(sessao) ||
                !Number.isSafeInteger(pulso) ||
                pulso < 0
            ) {
                throw erroCliente('Sessão de leitura inválida.')
            }

            referencia = `${sessao}:${pulso}`
            correta = 0

            if (pulso > 0) {
                const anterior = await consultar(
                    conexao,
                    `
                    SELECT
                        TIMESTAMPDIFF(
                            SECOND,
                            criado_em,
                            NOW()
                        ) AS segundos
                    FROM eventos_missoes
                    WHERE id_usuario = ?
                      AND data_evento = CURDATE()
                      AND tipo = 'leitura'
                      AND referencia LIKE ?
                    ORDER BY id_evento DESC
                    LIMIT 1
                    `,
                    [idUsuario, `${sessao}:%`]
                )

                correta = anterior.length
                    ? Math.min(
                        30,
                        Math.max(
                            0,
                            Number(anterior[0].segundos)
                        )
                    )
                    : 0
            }
        } else if (tipo === 'resposta') {
            const alternativas = await consultar(
                conexao,
                `
                SELECT a.*, p.id_materia
                FROM alternativas AS a
                INNER JOIN perguntas AS p
                    ON p.id_pergunta = a.id_pergunta
                WHERE a.id_alternativa = ?
                `,
                [Number(evento.id_alternativa) || 0]
            )

            const alternativa = alternativas[0]

            if (!alternativa) {
                throw erroCliente('Alternativa inválida.')
            }

            materia = alternativa.id_materia
            correta = Number(alternativa.verdadeira) === 1
                ? 1
                : 0

            referencia = correta
                ? String(alternativa.id_pergunta)
                : `erro:${alternativa.id_pergunta}:${evento.evento_id}`
        } else if (tipo === 'atividade') {
            materia = Number(evento.materia)

            const atividade = Number(evento.atividade)

            if (
                !Number.isInteger(atividade) ||
                atividade < 1
            ) {
                throw erroCliente('Atividade inválida.')
            }

            const perguntas = await consultar(
                conexao,
                `
                SELECT id_pergunta
                FROM perguntas
                WHERE id_materia = ?
                  AND ordem BETWEEN ? AND ?
                `,
                [
                    materia,
                    (atividade - 1) * 3 + 1,
                    atividade * 3
                ]
            )

            const respostas = await consultar(
                conexao,
                `
                SELECT referencia, correta
                FROM eventos_missoes
                WHERE id_usuario = ?
                  AND data_evento = CURDATE()
                  AND tipo = 'resposta'
                `,
                [idUsuario]
            )

            const acertos = new Set(
                respostas
                    .filter(item => Number(item.correta) === 1)
                    .map(item => String(item.referencia))
            )

            if (
                !perguntas.length ||
                !perguntas.every(pergunta =>
                    acertos.has(String(pergunta.id_pergunta))
                )
            ) {
                throw erroCliente(
                    'Conclua as questões da atividade antes de registrá-la.'
                )
            }

            const erros = respostas.filter(
                item => Number(item.correta) === 0
            )

            const teveErro = perguntas.some(pergunta =>
                erros.some(erro =>
                    erro.referencia.startsWith(
                        `erro:${pergunta.id_pergunta}:`
                    )
                )
            )

            correta = teveErro ? 0 : 1
            referencia = `${materia}:${atividade}`
        } else if (tipo === 'livro') {
            const livros = await consultar(
                conexao,
                'SELECT idLivro FROM livros WHERE idLivro = ?',
                [Number(referencia) || 0]
            )

            if (!livros.length) {
                throw erroCliente('Livro não encontrado.')
            }

            referencia = String(livros[0].idLivro)
        } else if (tipo === 'biblioteca') {
            referencia = 'visita'
        }

        if (
            typeof referencia !== 'string' ||
            !referencia ||
            referencia.length > 100
        ) {
            throw erroCliente(
                'Identificador do evento inválido.'
            )
        }

        const insercao = await consultar(
            conexao,
            `
            INSERT IGNORE INTO eventos_missoes (
                id_usuario,
                data_evento,
                tipo,
                referencia,
                materia,
                correta
            )
            VALUES (?, CURDATE(), ?, ?, ?, ?)
            `,
            [
                idUsuario,
                tipo,
                referencia,
                materia || null,
                correta ?? null
            ]
        )

        if (
            tipo === 'atividade' &&
            insercao.affectedRows === 1
        ) {
            const colunas = {
                1: 'atvidades_concluidas_matematica',
                2: 'atvidades_concluidas_portugues',
                3: 'atvidades_concluidas_historia',
                4: 'atvidades_concluidas_geografia',
                5: 'atvidades_concluidas_ciencias',
                6: 'atvidades_concluidas_ingles'
            }

            const coluna = colunas[materia]

            if (!coluna) {
                throw erroCliente('Matéria inválida.')
            }

            await consultar(
                conexao,
                `
                UPDATE usuarios
                SET
                    atvidades_concluidas_geral =
                        atvidades_concluidas_geral + 1,
                    ${coluna} = ${coluna} + 1
                WHERE id_usuario = ?
                `,
                [idUsuario]
            )
        }

        return insercao.affectedRows === 1
    }
}

export default Missoes