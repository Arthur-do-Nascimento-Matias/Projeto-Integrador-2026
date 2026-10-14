import { useEffect, useState } from "react";
import "./RedacoesReferencia.css";

// Exemplos de segurança caso o banco ainda não tenha redações cadastradas
const MODELOS_PADRAO = [
    {
        id_referencia: 1,
        titulo: "Caminhos para a inclusão digital nas escolas brasileiras",
        tema: "Os impactos da tecnologia na educação contemporânea",
        nota: 1000,
        banca: "ENEM",
        dica_moki:
            "Repare como o 1º parágrafo apresenta repertório sociocultural logo no início e já conecta com a tese!",
        resumo:
            "Na obra 'A Sociedade em Rede', o sociólogo Manuel Castells analisa como a revolução tecnológica remodelou as relações humanas...",
        texto_completo: `Na obra "A Sociedade em Rede", o sociólogo Manuel Castells analisa como a revolução tecnológica remodelou as relações humanas e o acesso ao saber. No contexto brasileiro contemporâneo, entretanto, a inserção das ferramentas digitais no ambiente escolar ocorre de maneira desigual. Isso se deve tanto à precariedade de infraestrutura em diversas regiões quanto à falta de formação pedagógica continuada para os docentes.\n\nEm primeira análise, cabe destacar que a democratização do ensino esbarra na exclusão digital. Segundo dados da pesquisa TIC Educação, milhares de escolas públicas ainda enfrentam conexões instáveis ou ausência de equipamentos adequados. Dessa forma, enquanto parte dos estudantes utiliza a tecnologia para expandir seu aprendizado, outra parcela permanece à margem desse processo, agravando o abismo educacional no país.\n\nAlém disso, a presença de computadores e celulares em sala de aula, por si só, não garante a construção do conhecimento. É fundamental que a escola atue na educação midiática dos jovens, estimulando o pensamento crítico diante da desinformação e capacitando os professores para integrar os recursos digitais ao currículo escolar.\n\nPortanto, medidas urgentes são necessárias para reverter esse cenário. Cabe ao Ministério da Educação (MEC), em parceria com os governos estaduais e municipais, ampliar os investimentos em infraestrutura tecnológica nas escolas públicas, por meio do direcionamento de verbas do Fundo de Universalização dos Serviços de Telecomunicações (Fust), além de oferecer cursos de capacitação digital para os educadores, a fim de tornar o ensino brasileiro verdadeiramente inclusivo e moderno.`
    },
    {
        id_referencia: 2,
        titulo: "O silêncio invisível do trabalho de cuidado no Brasil",
        tema: "Desafios para o enfrentamento da invisibilidade do trabalho de cuidado",
        nota: 980,
        banca: "ENEM",
        dica_moki:
            "Excelente uso de conectivos interparágrafos ('Nesse sentido', 'Ademais', 'Portanto') para garantir a Competência 4!",
        resumo:
            "A Constituição Federal de 1988 assegura a igualdade de direitos e a dignidade da pessoa humana como pilares da sociedade brasileira...",
        texto_completo: `A Constituição Federal de 1988 assegura a igualdade de direitos e a dignidade da pessoa humana como pilares da sociedade brasileira. Contudo, a histórica desvalorização do trabalho de cuidado realizado majoritariamente por mulheres impede a plena efetivação dessa garantia. Tal problemática decorre da herança patriarcal e da escassez de políticas públicas de apoio familiar.\n\nNesse sentido, a divisão sexual do trabalho naturalizou a ideia de que tarefas domésticas e o cuidado com crianças e idosos são obrigações exclusivamente femininas e não remuneradas. De acordo com o IBGE, as mulheres dedicam quase o dobro de horas semanais aos afazeres domésticos em comparação aos homens, o que limita sua inserção no mercado de trabalho formal e seus momentos de lazer.\n\nAdemais, a insuficiência de equipamentos públicos, como creches em tempo integral e centros de acolhimento para idosos, sobrecarrega sobretudo as famílias de baixa renda. Sem rede de apoio estatal, milhões de brasileiras precisam abandonar os estudos ou empregos formais.\n\nPortanto, cabe ao Governo Federal, em conjunto com o Ministério das Mulheres e o Ministério do Desenvolvimento Social, expandir a rede pública de creches e centros de assistência familiar, mediante investimento orçamentário prioritário, além de promover campanhas educativas sobre a corresponsabilidade doméstica, visando valorizar a economia do cuidado no Brasil.`
    },
    {
        id_referencia: 3,
        titulo: "Preservação ambiental e saberes tradicionais em questão",
        tema: "Comunidades tradicionais e a preservação do patrimônio socioambiental",
        nota: 960,
        banca: "ENEM",
        dica_moki:
            "Veja como a conclusão responde às 5 perguntas: Quem fará? O que fará? Como fará? Para quê? + Detalhamento.",
        resumo:
            "O pensador indígena Ailton Krenak, no livro 'Ideias para Adiar o Fim do Mundo', critica a visão predatória que separa a humanidade da natureza...",
        texto_completo: `O pensador indígena Ailton Krenak, no livro "Ideias para Adiar o Fim do Mundo", critica a visão predatória que separa a humanidade da natureza. Sob essa ótica, os povos e comunidades tradicionais brasileiros exercem papel vital na conservação da biodiversidade, mas enfrentam constante invisibilidade e ameaças aos seus territórios.\n\nEm primeiro plano, vale ressaltar que indígenas, quilombolas e ribeirinhos possuem modos de vida baseados no manejo sustentável dos recursos naturais. Áreas demarcadas e protegidas por essas populações apresentam os menores índices de desmatamento do país, comprovando que a preservação cultural está diretamente ligada à proteção climática.\n\nPor outro lado, o avanço ilegal de atividades exploratórias e a lentidão na regularização fundiária colocam em risco a sobrevivência física e simbólica desses grupos. A ausência de fiscalização rigorosa fragiliza direitos originários garantidos pela legislação.\n\nLogo, urge que o Ministério do Meio Ambiente e o Ministério dos Povos Indígenas fortaleçam a fiscalização ambiental e acelerem a titulação de terras tradicionais, por meio do uso de monitoramento via satélite e ampliação do efetivo do Ibama, com o intuito de proteger os guardiões da floresta e garantir o equilíbrio ecológico do país.`
    }
];

function RedacoesReferencia() {
    const [modelos, setModelos] = useState(MODELOS_PADRAO);
    const [modeloAberto, setModeloAberto] = useState(null);

    useEffect(() => {
        buscarModelosDoBanco();
    }, []);

    async function buscarModelosDoBanco() {
        try {
            const resposta = await fetch("http://localhost:3000/redacoesReferencia");
            if (!resposta.ok) return;

            const dados = await resposta.json();
            if (Array.isArray(dados) && dados.length > 0) {
                setModelos(dados);
            }
        } catch (erro) {
            // Se a rota ainda não existir no backend, mantém os modelos padrão sem quebrar a página
            console.log("Usando redações de referência padrão.");
        }
    }

    return (
        <section className="referenciasSecao">
            <div className="simuladosTituloSecao">
                <div>
                    <span>REDAÇÕES MODELO</span>
                    <h2>Inspire-se em redações exemplares</h2>
                    <p>
                        Analise a estrutura, os repertórios e os conectivos de
                        textos com notas altas para melhorar a sua escrita.
                    </p>
                </div>
            </div>

            <div className="referenciasGrade">
                {modelos.map((item) => {
                    const id = item.id_referencia || item.id;
                    const titulo = item.titulo || "Redação Modelo";
                    const tema = item.tema || item.titulo_tema || "Tema ENEM";
                    const nota = item.nota || 1000;
                    const texto = item.texto_completo || item.texto || "";
                    const resumo =
                        item.resumo ||
                        texto.slice(0, 140) + "...";

                    return (
                        <article key={id} className="referenciaCard">
                            <div className="referenciaCardTopo">
                                <span className="referenciaBanca">
                                    {item.banca || "ENEM"}
                                </span>
                                <span className="referenciaNota">
                                    Nota {nota}
                                </span>
                            </div>

                            <div className="referenciaCardCorpo">
                                <small className="referenciaTemaLabel">
                                    Tema: {tema}
                                </small>
                                <h3>{titulo}</h3>
                                <p className="referenciaTrecho">“{resumo}”</p>
                            </div>

                            <button
                                className="referenciaBotaoLer"
                                onClick={() =>
                                    setModeloAberto({
                                        ...item,
                                        titulo,
                                        tema,
                                        nota,
                                        texto_completo: texto
                                    })
                                }
                            >
                                <span>Ler redação completa</span>
                                <span>→</span>
                            </button>
                        </article>
                    );
                })}
            </div>

            {/* MODAL DE LEITURA DA REDAÇÃO MODELO */}
            {modeloAberto && (
                <div
                    className="referenciaModalFundo"
                    onClick={() => setModeloAberto(null)}
                >
                    <div
                        className="referenciaModalCaixa"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="referenciaModalTopo">
                            <div>
                                <span className="referenciaNotaDestaque">
                                    NOTA {modeloAberto.nota} • MODELO DE REFERÊNCIA
                                </span>
                                <h3>{modeloAberto.titulo}</h3>
                                <p>Tema: {modeloAberto.tema}</p>
                            </div>

                            <button
                                className="referenciaBotaoFechar"
                                onClick={() => setModeloAberto(null)}
                            >
                                ✕
                            </button>
                        </header>

                        {modeloAberto.dica_moki && (
                            <div className="referenciaDicaMoki">
                                <span>🐵</span>
                                <p>
                                    <strong>Olhar do Moki:</strong>{" "}
                                    {modeloAberto.dica_moki}
                                </p>
                            </div>
                        )}

                        <div className="referenciaTextoCompleto">
                            {(modeloAberto.texto_completo || "")
                                .split("\n\n")
                                .map((paragrafo, index) => (
                                    <p key={index}>{paragrafo}</p>
                                ))}
                        </div>

                        <footer className="referenciaModalRodape">
                            <button onClick={() => setModeloAberto(null)}>
                                Fechar leitura
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </section>
    );
}

export default RedacoesReferencia;