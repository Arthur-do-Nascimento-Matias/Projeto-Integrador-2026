import Conexao from './Conexao.js'

class Feed {


    static listarDenuncias() {
    const sql = `
        SELECT
            d.id_denuncia,
            d.id_post,
            d.id_comentario,
            d.motivo,
            d.descricao,
            d.status,
            d.criada_em,

            denunciante.id_usuario AS id_denunciante,
            denunciante.nome_de_exibicao AS denunciante_nome,
            denunciante.nome_de_usuario AS denunciante_usuario,

            CASE
                WHEN d.id_post IS NOT NULL THEN 'post'
                ELSE 'comentario'
            END AS tipo_conteudo,

            COALESCE(
                p.titulo,
                'Comentário'
            ) AS titulo_conteudo,

            COALESCE(
                p.conteudo,
                cp.conteudo
            ) AS conteudo,

            COALESCE(
                autor_post.nome_de_exibicao,
                autor_comentario.nome_de_exibicao
            ) AS autor_nome,

            COALESCE(
                autor_post.nome_de_usuario,
                autor_comentario.nome_de_usuario
            ) AS autor_usuario

        FROM denuncias_feed AS d

        INNER JOIN usuarios AS denunciante
            ON denunciante.id_usuario = d.id_usuario_denunciante

        LEFT JOIN posts AS p
            ON p.id_post = d.id_post

        LEFT JOIN usuarios AS autor_post
            ON autor_post.id_usuario = p.id_usuario

        LEFT JOIN comentarios_posts AS cp
            ON cp.id_comentario = d.id_comentario

        LEFT JOIN usuarios AS autor_comentario
            ON autor_comentario.id_usuario = cp.id_usuario

        WHERE d.status = 'pendente'

        ORDER BY d.criada_em DESC
    `

    return Feed.executar(sql)
}

static resolverDenuncia(idDenuncia, acao) {
    if (!idDenuncia) {
        return Promise.reject(
            new Error('Informe uma denúncia válida.')
        )
    }

    if (!['ocultar', 'ignorar'].includes(acao)) {
        return Promise.reject(
            new Error('Ação de moderação inválida.')
        )
    }

    const sqlBuscar = `
        SELECT
            id_denuncia,
            id_post,
            id_comentario,
            status
        FROM denuncias_feed
        WHERE id_denuncia = ?
        LIMIT 1
    `

    return Feed.executar(sqlBuscar, [idDenuncia])
        .then(resultado => {
            const denuncia = resultado[0]

            if (!denuncia) {
                throw new Error('Denúncia não encontrada.')
            }

            if (denuncia.status !== 'pendente') {
                throw new Error(
                    'Esta denúncia já foi resolvida.'
                )
            }

            if (acao === 'ignorar') {
                const sqlResolver = `
                    UPDATE denuncias_feed
                    SET status = 'resolvida'
                    WHERE id_denuncia = ?
                `

                return Feed.executar(sqlResolver, [idDenuncia])
            }

            const tipo = denuncia.id_post
                ? 'post'
                : 'comentario'

            const idConteudo =
                denuncia.id_post || denuncia.id_comentario

            return Feed.ocultarConteudo({
                tipo,
                id: idConteudo
            }).then(() => {
                const coluna = denuncia.id_post
                    ? 'id_post'
                    : 'id_comentario'

                const sqlResolverTodas = `
                    UPDATE denuncias_feed
                    SET status = 'resolvida'
                    WHERE ${coluna} = ?
                    AND status = 'pendente'
                `

                return Feed.executar(
                    sqlResolverTodas,
                    [idConteudo]
                )
            })
        })
}
    static executar(sql, valores = []) {
        return new Promise((resolve, reject) => {
            const connection = Conexao.connect()

            connection.query(sql, valores, (erro, resultado) => {
                connection.end()

                if (erro) {
                    return reject(erro)
                }

                resolve(resultado)
            })
        })
    }

    static listarComunidades() {
        const sql = `
            SELECT
                c.id_comunidade,
                c.nome,
                c.slug,
                c.descricao,
                c.cor,
                COUNT(p.id_post) AS total_posts
            FROM comunidades AS c
            LEFT JOIN posts AS p
                ON p.id_comunidade = c.id_comunidade
                AND p.ativo = 1
            WHERE c.ativa = 1
            GROUP BY c.id_comunidade
            ORDER BY c.nome
        `

        return Feed.executar(sql)
    }

    static listarPosts(idUsuario, filtros) {
        const valores = [idUsuario]
        let condicaoComunidade = ''

        if (filtros.comunidade) {
            condicaoComunidade = 'AND c.slug = ?'
            valores.push(filtros.comunidade)
        }

        const ordem = filtros.ordem === 'emAlta'
            ? 'pontuacao DESC, total_comentarios DESC, p.criado_em DESC'
            : 'p.criado_em DESC'

        const sql = `
            SELECT
                p.id_post,
                p.titulo,
                p.conteudo,
                p.criado_em,
                p.atualizado_em,
                c.id_comunidade,
                c.nome AS comunidade_nome,
                c.slug AS comunidade_slug,
                c.cor AS comunidade_cor,
                u.id_usuario,
                u.nome_de_exibicao,
                u.nome_de_usuario,
                u.foto_perfil,

                COALESCE((
                    SELECT SUM(
                        CASE
                            WHEN voto.tipo = 'positivo' THEN 1
                            WHEN voto.tipo = 'negativo' THEN -1
                            ELSE 0
                        END
                    )
                    FROM votos_posts AS voto
                    WHERE voto.id_post = p.id_post
                ), 0) AS pontuacao,

                (
                    SELECT COUNT(*)
                    FROM comentarios_posts AS comentario
                    WHERE comentario.id_post = p.id_post
                    AND comentario.ativo = 1
                ) AS total_comentarios,

                (
                    SELECT voto_usuario.tipo
                    FROM votos_posts AS voto_usuario
                    WHERE voto_usuario.id_post = p.id_post
                    AND voto_usuario.id_usuario = ?
                    LIMIT 1
                ) AS meu_voto

            FROM posts AS p

            INNER JOIN comunidades AS c
                ON c.id_comunidade = p.id_comunidade

            INNER JOIN usuarios AS u
                ON u.id_usuario = p.id_usuario

            WHERE p.ativo = 1
            AND c.ativa = 1
            ${condicaoComunidade}

            ORDER BY ${ordem}
        `

        return Feed.executar(sql, valores).then(posts => {
            return posts.map(post => Feed.formatarPost(post))
        })
    }

    static buscarPost(idPost, idUsuario) {
        const sqlPost = `
            SELECT
                p.id_post,
                p.titulo,
                p.conteudo,
                p.criado_em,
                p.atualizado_em,
                c.id_comunidade,
                c.nome AS comunidade_nome,
                c.slug AS comunidade_slug,
                c.cor AS comunidade_cor,
                u.id_usuario,
                u.nome_de_exibicao,
                u.nome_de_usuario,
                u.foto_perfil,

                COALESCE((
                    SELECT SUM(
                        CASE
                            WHEN voto.tipo = 'positivo' THEN 1
                            WHEN voto.tipo = 'negativo' THEN -1
                            ELSE 0
                        END
                    )
                    FROM votos_posts AS voto
                    WHERE voto.id_post = p.id_post
                ), 0) AS pontuacao,

                (
                    SELECT COUNT(*)
                    FROM comentarios_posts AS comentario
                    WHERE comentario.id_post = p.id_post
                    AND comentario.ativo = 1
                ) AS total_comentarios,

                (
                    SELECT voto_usuario.tipo
                    FROM votos_posts AS voto_usuario
                    WHERE voto_usuario.id_post = p.id_post
                    AND voto_usuario.id_usuario = ?
                    LIMIT 1
                ) AS meu_voto

            FROM posts AS p

            INNER JOIN comunidades AS c
                ON c.id_comunidade = p.id_comunidade

            INNER JOIN usuarios AS u
                ON u.id_usuario = p.id_usuario

            WHERE p.id_post = ?
            AND p.ativo = 1

            LIMIT 1
        `

        const sqlComentarios = `
            SELECT
                cp.id_comentario,
                cp.id_post,
                cp.conteudo,
                cp.criado_em,
                u.id_usuario,
                u.nome_de_exibicao,
                u.nome_de_usuario,
                u.foto_perfil

            FROM comentarios_posts AS cp

            INNER JOIN usuarios AS u
                ON u.id_usuario = cp.id_usuario

            WHERE cp.id_post = ?
            AND cp.ativo = 1

            ORDER BY cp.criado_em ASC
        `

        return Promise.all([
            Feed.executar(sqlPost, [idUsuario, idPost]),
            Feed.executar(sqlComentarios, [idPost])
        ]).then(([posts, comentarios]) => {
            if (!posts.length) {
                return null
            }

            return {
                post: Feed.formatarPost(posts[0]),
                comentarios: comentarios.map(comentario =>
                    Feed.formatarComentario(comentario)
                )
            }
        })
    }

    static criarPost(dados) {
        const titulo = dados.titulo?.trim()
        const conteudo = dados.conteudo?.trim()

        if (!dados.id_comunidade || !titulo || !conteudo) {
            return Promise.reject(
                new Error('Informe comunidade, título e conteúdo.')
            )
        }

        if (titulo.length > 160 || conteudo.length > 5000) {
            return Promise.reject(
                new Error('O post ultrapassa o limite permitido.')
            )
        }

        const sql = `
            INSERT INTO posts (
                id_comunidade,
                id_usuario,
                titulo,
                conteudo
            )
            VALUES (?, ?, ?, ?)
        `

        return Feed.executar(sql, [
            dados.id_comunidade,
            dados.id_usuario,
            titulo,
            conteudo
        ]).then(resultado => ({
            id_post: resultado.insertId
        }))
    }

    static votarPost(idPost, idUsuario, tipo) {
        if (!['positivo', 'negativo'].includes(tipo)) {
            return Promise.reject(
                new Error('Tipo de voto inválido.')
            )
        }

        const sql = `
            INSERT INTO votos_posts (id_post, id_usuario, tipo)
            VALUES (?, ?, ?)

            ON DUPLICATE KEY UPDATE
                tipo = VALUES(tipo),
                atualizado_em = CURRENT_TIMESTAMP
        `

        return Feed.executar(sql, [idPost, idUsuario, tipo])
    }

    static criarComentario(dados) {
        const conteudo = dados.conteudo?.trim()

        if (!dados.id_post || !conteudo) {
            return Promise.reject(
                new Error('Informe o comentário.')
            )
        }

        if (conteudo.length > 3000) {
            return Promise.reject(
                new Error('O comentário ultrapassa o limite permitido.')
            )
        }

        const sql = `
            INSERT INTO comentarios_posts (
                id_post,
                id_usuario,
                conteudo
            )
            VALUES (?, ?, ?)
        `

        return Feed.executar(sql, [
            dados.id_post,
            dados.id_usuario,
            conteudo
        ]).then(resultado => ({
            id_comentario: resultado.insertId
        }))
    }

    static denunciar(dados) {
        const motivos = [
            'ofensivo',
            'spam',
            'informacao_errada',
            'outro'
        ]

        if (
            !motivos.includes(dados.motivo) ||
            (!dados.id_post && !dados.id_comentario)
        ) {
            return Promise.reject(
                new Error('Denúncia inválida.')
            )
        }

        const sql = `
            INSERT INTO denuncias_feed (
                id_usuario_denunciante,
                id_post,
                id_comentario,
                motivo,
                descricao
            )
            VALUES (?, ?, ?, ?, ?)
        `

        return Feed.executar(sql, [
            dados.id_usuario,
            dados.id_post || null,
            dados.id_comentario || null,
            dados.motivo,
            dados.descricao?.trim().slice(0, 300) || null
        ])
    }

    static usuarioEhAdmin(idUsuario) {
        const sql = `
            SELECT adm
            FROM usuarios
            WHERE id_usuario = ?
            LIMIT 1
        `

        return Feed.executar(sql, [idUsuario]).then(resultado => {
            return resultado[0]?.adm === 1
        })
    }

    static ocultarConteudo(dados) {
        const tabela = dados.tipo === 'comentario'
            ? 'comentarios_posts'
            : 'posts'

        const coluna = dados.tipo === 'comentario'
            ? 'id_comentario'
            : 'id_post'

        const sql = `
            UPDATE ${tabela}
            SET ativo = 0
            WHERE ${coluna} = ?
        `

        return Feed.executar(sql, [dados.id])
    }

    static formatarPost(post) {
        return {
            ...post,
            foto_perfil: post.foto_perfil
                ? `data:image/jpeg;base64,${post.foto_perfil.toString('base64')}`
                : '',
            pontuacao: Number(post.pontuacao) || 0,
            total_comentarios: Number(post.total_comentarios) || 0
        }
    }

    static formatarComentario(comentario) {
        return {
            ...comentario,
            foto_perfil: comentario.foto_perfil
                ? `data:image/jpeg;base64,${comentario.foto_perfil.toString('base64')}`
                : ''
        }
    }
}

export default Feed