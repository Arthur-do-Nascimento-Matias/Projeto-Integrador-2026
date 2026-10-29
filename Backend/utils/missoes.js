export const EVENTO_MISSOES = 'moki:missoes-atualizadas'

const API = 'http://localhost:3000'

let fila = Promise.resolve()

export async function carregarMissoes() {
    const token = localStorage.getItem('token')

    if (!token) {
        throw new Error(
            'Faça login para carregar suas missões.'
        )
    }

    const resposta = await fetch(`${API}/missoes/hoje`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
        throw new Error(
            dados.erro ||
            'Não foi possível carregar as missões.'
        )
    }

    return dados.missoes || []
}

function registrar(evento) {
    const token = localStorage.getItem('token')

    if (!token) {
        return Promise.reject(
            new Error('Faça login novamente.')
        )
    }

    const tarefa = fila.then(async () => {
        if (localStorage.getItem('token') !== token) {
            throw new Error('A conta conectada foi alterada.')
        }

        const resposta = await fetch(
            `${API}/missoes/evento`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(evento)
            }
        )

        const dados = await resposta.json()

        if (!resposta.ok) {
            throw new Error(
                dados.erro ||
                'Não foi possível registrar a missão.'
            )
        }

        window.dispatchEvent(
            new CustomEvent(EVENTO_MISSOES, {
                detail: dados
            })
        )

        return dados
    })

    // Uma falha não bloqueia as próximas ações.
    fila = tarefa.catch(() => {})

    return tarefa
}

export function registrarResposta(idAlternativa) {
    return registrar({
        tipo: 'resposta',
        id_alternativa: idAlternativa,
        evento_id: crypto.randomUUID()
    })
}

export function registrarAtividadeConcluida(
    materia,
    atividade
) {
    return registrar({
        tipo: 'atividade',
        materia,
        atividade
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

export function registrarMensagemMoki(idMensagem) {
    return registrar({
        tipo: 'mensagem',
        referencia: idMensagem
    })
}

export function registrarLeitura(sessao, pulso) {
    return registrar({
        tipo: 'leitura',
        sessao,
        pulso
    })
}