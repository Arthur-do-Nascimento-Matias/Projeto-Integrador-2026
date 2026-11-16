export function resumirLicao(respostas, total, xpConclusao) {
    const xp = Number(xpConclusao)
    if (xpConclusao == null || xpConclusao === '' || !Number.isFinite(xp) || xp < 0) {
        throw new Error('O servidor não confirmou a recompensa. Tente salvar novamente.')
    }
    const acertos = respostas.filter(resposta => resposta.correta)
    return {
        xp: respostas.reduce((soma, resposta) => {
            const ganho = Number(resposta.xp)
            return soma + (Number.isFinite(ganho) && ganho > 0 ? ganho : 0)
        }, xp),
        acertos: acertos.length,
        tentativas: respostas.length,
        concluidas: new Set(acertos.map(resposta => resposta.questao)).size,
        total
    }
}
