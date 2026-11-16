import Login from '../Login.js'

function buscarUsuarioAutenticado(req) {

    const autorizacao = req.headers.authorization

    if (!autorizacao) {
        return null
    }

    const token = autorizacao.replace('Bearer ', '')

    return Login.autenticar(token)
}

export { buscarUsuarioAutenticado }