import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resumirLicao } from './resultadoLicao.js'

test('conta erros, questões únicas e XP confirmado, inclusive bônus de missão', () => {
    const resumo = resumirLicao([
        { questao: 1, correta: false, xp: 0 },
        { questao: 1, correta: true, xp: 10 },
        { questao: 2, correta: true, xp: 0 },
        { questao: 3, correta: true, xp: 0 }
    ], 3, 50)
    assert.deepEqual(resumo, { xp: 60, acertos: 3, tentativas: 4, concluidas: 3, total: 3 })
    assert.equal(Math.round(resumo.acertos / resumo.tentativas * 100), 75)
})

test('aceita lição curta e recompensa zero sem inventar XP', () => {
    assert.deepEqual(resumirLicao([{ questao: 7, correta: true, xp: 0 }], 1, 0),
        { xp: 0, acertos: 1, tentativas: 1, concluidas: 1, total: 1 })
    assert.equal(resumirLicao([], 0, '0').xp, 0)
    assert.throws(() => resumirLicao([], 0, undefined), /não confirmou/)
})
