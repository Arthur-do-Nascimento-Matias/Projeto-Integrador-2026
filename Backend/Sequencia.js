
import mysql from "mysql";

function formatarData(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

class Sequencia {

    static streak(idUser) {
        return new Promise((resolve, reject) => {

            const connection = mysql.createConnection({
                host: "127.0.0.1",
                user: "root",
                password: "",
                database: "integrador",
                dateStrings: true
            });

            const hoje = formatarData(new Date());

            // Atualiza somente se ainda não houve atividade hoje.
            // O cálculo e o salvamento acontecem no mesmo UPDATE.
            const atualizar = `
                UPDATE usuarios
                SET
                    streak = CASE
                        WHEN ultima_atividade = DATE_SUB(?, INTERVAL 1 DAY)
                        THEN COALESCE(streak, 0) + 1
                        ELSE 1
                    END,
                    ultima_atividade = ?
                WHERE id_usuario = ?
                  AND (
                      ultima_atividade IS NULL
                      OR ultima_atividade < ?
                  )
            `;

            connection.query(
                atualizar,
                [hoje, hoje, idUser, hoje],
                (erroUpdate) => {

                    if (erroUpdate) {
                        connection.end();
                        console.error("Erro ao atualizar streak:", erroUpdate);
                        return reject(erroUpdate);
                    }

                    const consultar = `
                        SELECT streak, ultima_atividade
                        FROM usuarios
                        WHERE id_usuario = ?
                    `;

                    connection.query(
                        consultar,
                        [idUser],
                        (erroConsulta, results) => {

                            connection.end();

                            if (erroConsulta) {
                                return reject(erroConsulta);
                            }

                            if (results.length === 0) {
                                return reject(
                                    new Error("Usuário não encontrado")
                                );
                            }

                            resolve({
                                streak: Number(results[0].streak) || 0,
                                ultima_atividade: results[0].ultima_atividade
                            });
                        }
                    );
                }
            );
        });
    }
}

export default Sequencia;
