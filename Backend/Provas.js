import mysql from 'mysql'

class Provas {

    static provasSearch() {

        return new Promise((resolve, reject) => {

            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'integrador',
            })

            connection.connect()

            const sql = `
                SELECT
                    idProva,
                    NomeProva,
                    fonteProva,
                    materia,
                    tipoProva,
                    anoProva,

                    CASE
                        WHEN capaProva IS NOT NULL
                        AND LENGTH(capaProva) > 0
                        THEN 1
                        ELSE 0
                    END AS temCapa

                FROM provas

                ORDER BY idProva DESC
            `

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
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'integrador',
            })

            connection.connect()

            const idProva = param.id

            const sql = `
                SELECT pdfProva
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
                host: 'localhost',
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