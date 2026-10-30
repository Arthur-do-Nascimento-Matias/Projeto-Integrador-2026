
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

            console.log('aqui')

            const connection = mysql.createConnection({
                host: "127.0.0.1",
                user: "root",
                password: "",
                database: "integrador",
                dateStrings: true
            });

            const sql = `
                SELECT streak, ultima_atividade
                FROM usuarios
                WHERE id_usuario = ?
            `;

            connection.query(sql, [idUser], (error, results) => {

                if (error) {
                    connection.end();
                    return reject(error);
                }

                if (results.length === 0) {
                    connection.end();
                    return reject(new Error("Usuário não encontrado"));
                }

                const usuario = results[0];

                const hoje = formatarData(new Date());
                const ultimaAtividade = usuario.ultima_atividade;

                const streakAtual = Number(usuario.streak) || 0;

                let novaStreak = streakAtual;

                if (!ultimaAtividade) {
                    novaStreak = 1;
                } else {

                    const hojeUTC = Date.parse(`${hoje}T00:00:00Z`);
                    const ultimaUTC = Date.parse(
                        `${ultimaAtividade}T00:00:00Z`
                    );

                    const diferenca = Math.round(
                        (hojeUTC - ultimaUTC) / 86400000
                    );

                    if (diferenca === 0) {
                        novaStreak = streakAtual;

                    } else if (diferenca === 1) {
                        novaStreak = streakAtual + 1;

                    } else if (diferenca > 1) {
                        novaStreak = 1;
                    }
                }

                // Salva a nova sequência e a data atual
                const atualizar = `
                    UPDATE usuarios
                    SET streak = ?, ultima_atividade = ?
                    WHERE id_usuario = ?
                `;

                connection.query(
                    atualizar,
                    [novaStreak, hoje, idUser],
                    (erroUpdate) => {

                        connection.end();

                        if (erroUpdate) {
                            return reject(erroUpdate);
                        }

                        resolve({
                            streak: novaStreak,
                            ultima_atividade: hoje
                        });
                    }
                );
            });
        });
    }
}

export default Sequencia;
