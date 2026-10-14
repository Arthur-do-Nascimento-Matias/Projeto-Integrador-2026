class Http {

    static lerCorpo(req) {
        return new Promise((resolve, reject) => {

            let corpo = ''

            req.on('data', parte => {
                corpo += parte
            })

            req.on('end', () => {

                try {
                    resolve(corpo ? JSON.parse(corpo) : {})
                } catch {
                    reject(new Error('JSON inválido.'))
                }
            })

            req.on('error', reject)
        })
    }

    static responderJson(res, status, dados) {
        res.writeHead(status, {
            'Content-Type': 'application/json; charset=utf-8'
        })

        res.end(JSON.stringify(dados))
    }
}

export default Http