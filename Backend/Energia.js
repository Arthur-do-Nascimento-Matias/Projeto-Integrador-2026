// Todas as datas de energia usam o dia de Brasília (UTC-3).
export const DIA_ENERGIA_SQL = 'DATE(UTC_TIMESTAMP() - INTERVAL 3 HOUR)';

export function consultar(connection, sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (erro, resultado) => {
            if (erro) return reject(erro);
            resolve(resultado);
        });
    });
}

export function renovarEnergia(connection, idUsuario) {
    // Atualização condicional: chamadas simultâneas não recarregam duas vezes.
    return consultar(connection, `
        UPDATE usuarios
        SET energia = 5, energia_renovada_em = ${DIA_ENERGIA_SQL}
        WHERE id_usuario = ?
          AND (energia_renovada_em IS NULL
               OR energia_renovada_em < ${DIA_ENERGIA_SQL})
    `, [idUsuario]);
}
