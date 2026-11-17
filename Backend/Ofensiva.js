import { consultar, DIA_ENERGIA_SQL } from './Energia.js';

// Uma ofensiva ainda vale durante o dia seguinte à última atividade.
// Sem data histórica não é possível comprovar a sequência antiga.
export function expirarOfensiva(connection, idUsuario) {
    return consultar(connection, `
        UPDATE usuarios
        SET streak = 0
        WHERE id_usuario = ?
          AND (data_ultima_atividade IS NULL
               OR data_ultima_atividade < ${DIA_ENERGIA_SQL} - INTERVAL 1 DAY)
          AND COALESCE(streak, 0) <> 0
    `, [idUsuario]);
}
