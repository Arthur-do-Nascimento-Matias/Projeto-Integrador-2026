import mysql from 'mysql'

class Provas {

    static provasSearch() {

        return new Promise((resolve, reject) => {

            const connection = mysql.createConnection({
                host: '127.0.0.1',
                user: 'root',
                password: '',
                database: 'integrador',
            })

            connection.connect()

           console.log('redação')
          const sql = `
                        SELECT
                            s.id_simulado AS idProva,
                            s.titulo AS NomeProva,
                            s.ano_escolar AS anoProva,
                            CASE s.id_materia
                                WHEN 1 THEN 'matematica'
                                WHEN 2 THEN 'portugues'
                                WHEN 3 THEN 'historia'
                                WHEN 4 THEN 'geografia'
                                WHEN 5 THEN 'ciencias'
                                WHEN 6 THEN 'ingles'
                            END AS materia,
                            'simulado' AS tipoProva,
                            'SimioLab' AS fonteProva,
                            0 AS temCapa
                        FROM simulados s
                    WHERE s.pdf_simulado IS NOT NULL
                    AND s.ano_escolar IS NOT NULL
                    ORDER BY s.id_simulado ASC
                    `;


            connection.query(sql, function(error, results) {

                if (error) {

                    connection.end()

                    reject(error)

                    return
                }

                const provas = results.map(element => {

                    return {
                        idProva: element.idProva,
                        NomeProva: element.NomeProva,
                        fonteProva: element.fonteProva,
                        materia: element.materia,
                        tipoProva: element.tipoProva,
                        anoProva: element.anoProva,
                        temCapa: Boolean(element.temCapa)
                    }

                })

                connection.end()

                resolve(provas)

            })

        })

    }


    static abrirProva(param) {

        return new Promise((resolve, reject) => {

            const connection = mysql.createConnection({
                host: '127.0.0.1',
                user: 'root',
                password: '',
                database: 'integrador',
            })

            connection.connect()

            const idProva = param.id

const sql = `
    SELECT pdf_simulado AS pdfProva
    FROM simulados
    WHERE id_simulado = ?
`

            connection.query(
                sql,
                [idProva],
                function(error, results) {

                    if (error) {

                        connection.end()

                        reject(error)

                        return
                    }

                    if (
                        !results ||
                        results.length === 0
                    ) {

                        connection.end()

                        resolve(null)

                        return
                    }

                    const pdf =
                        results[0].pdfProva

                    connection.end()

                    resolve(pdf)

                }
            )

        })

    }


    static capaProva(param) {

        return new Promise((resolve, reject) => {

            const connection = mysql.createConnection({
                host: '127.0.0.1',
                user: 'root',
                password: '',
                database: 'integrador',
            })

            connection.connect()

            const idProva = param.id

            const sql = `
                SELECT capaProva
                FROM provas
                WHERE idProva = ?
            `

            connection.query(
                sql,
                [idProva],
                function(error, results) {

                    if (error) {

                        connection.end()

                        reject(error)

                        return
                    }

                    if (
                        !results ||
                        results.length === 0 ||
                        !results[0].capaProva
                    ) {

                        connection.end()

                        resolve(null)

                        return
                    }

                    const capa =
                        results[0].capaProva

                    connection.end()

                    resolve(capa)

                }
            )

        })

    }

}

export default Provas