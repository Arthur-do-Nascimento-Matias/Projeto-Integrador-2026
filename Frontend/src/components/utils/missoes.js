export const EVENTO_MISSOES =
    'moki:missoes-atualizadas'

const API = 'http://localhost:3000'

let fila = Promise.resolve()


function obterToken() {
    return localStorage.getItem('token')
}


async function lerResposta(resposta) {
    try {
        return await resposta.json()
    } catch {
        return {}
    }
}


export async function carregarMissoes() {
    const token = obterToken()

    if (!token) {
        throw new Error(
            'Faça login novamente.'
        )
    }

    const resposta = await fetch(
        `${API}/missoes/hoje`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const dados = await lerResposta(resposta)

    if (!resposta.ok) {
        throw new Error(
            dados.erro ||
            'Não foi possível carregar as missões.'
        )
    }

    return dados.missoes || []
}


function registrar(evento) {
    const token = obterToken()

    if (!token) {
        return Promise.reject(
            new Error('Faça login novamente.')
        )
    }

    const tarefa = fila.then(async () => {
        if (obterToken() !== token) {
            throw new Error(
                'A conta conectada foi alterada.'
            )
        }

        const resposta = await fetch(
            `${API}/missoes/evento`,
            {
                method: 'POST',
                keepalive: true,
                headers: {
                    'Content-Type':
                        'application/json',
                    Authorization:
                        `Bearer ${token}`
                },
                body: JSON.stringify(evento)
            }
        )

        const dados = await lerResposta(resposta)

        if (!resposta.ok) {
            throw new Error(
                dados.erro ||
                'Não foi possível registrar a missão.'
            )
        }

        window.dispatchEvent(
            new CustomEvent(
                EVENTO_MISSOES,
                {
                    detail: dados
                }
            )
        )

        return dados
    })

    /*
     * Uma requisição com erro não bloqueia
     * os próximos eventos.
     */
    fila = tarefa.catch(() => {})

    return tarefa
}


export function registrarResposta(
    idAlternativa,
    eventoId = crypto.randomUUID()
) {
    return registrar({
        tipo: 'resposta',
        id_alternativa:
            Number(idAlternativa),
        evento_id: eventoId
    })
}


export function registrarAtividadeConcluida(
    materia,
    atividade
) {
    return registrar({
        tipo: 'atividade',
        materia: Number(materia),
        atividade: Number(atividade)
    })
}


export function registrarVisitaBiblioteca() {
    return registrar({
        tipo: 'biblioteca'
    })
}


export function registrarLivroAberto(idLivro) {
    return registrar({
        tipo: 'livro',
        referencia: String(idLivro)
    })
}


export function registrarMensagemMoki(
    idMensagem = crypto.randomUUID()
) {
    return registrar({
        tipo: 'mensagem',
        referencia: idMensagem
    })
}


export function registrarLeitura(
    sessao,
    pulso
) {
    return registrar({
        tipo: 'leitura',
        sessao,
        pulso: Number(pulso)
    })
}