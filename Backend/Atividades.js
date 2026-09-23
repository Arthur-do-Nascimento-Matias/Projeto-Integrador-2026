class Atividades{
    constructor(nome, pergunta, alternativa1, alternativa2, alternativa3, respostaCertas) {
        this.nome = nome
        this.pergunta = pergunta
        this.alternativas = [alternativa1, alternativa2, alternativa3]
        this.respostaCertas = respostaCertas
    }
}

module.exports = Atividades
