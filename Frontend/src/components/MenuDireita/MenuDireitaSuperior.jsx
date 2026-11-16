import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { nomePelaRota } from "../menuEsquerda/menuEsquerda";
import { apiFetch } from "../utils/api";
import "./MenuDireitaSuperior.css";

function MenuDireitaSuperior({ draft, compacto = false }) {
    const [posicao, setPosicao] = useState(null);

    useEffect(() => {
        if (!draft?.id) return;

        const controller = new AbortController();

        async function buscarPosicao() {
            try {
                const resp = await apiFetch(
                    "/ranking",
                    { signal: controller.signal }
                );

                if (!resp.ok) {
                    throw new Error("Erro ao buscar ranking");
                }

                const data = await resp.json();

                if (!data.ok || !Array.isArray(data.participantes)) {
                    throw new Error("Ranking inválido");
                }

                // Mesma ordenação utilizada no ranking
                const ordenados = [...data.participantes].sort((a, b) => {
                    const diferencaXP = Number(b.xp) - Number(a.xp);

                    if (diferencaXP !== 0) {
                        return diferencaXP;
                    }

                    // Desempate por ordem alfabética
                    const diferencaNome = String(a.nome ?? "")
                        .localeCompare(String(b.nome ?? ""), "pt-BR");

                    if (diferencaNome !== 0) {
                        return diferencaNome;
                    }

                    // Último desempate pelo ID
                    return Number(a.id) - Number(b.id);
                });

                const indice = ordenados.findIndex(
                    usuario => Number(usuario.id) === Number(draft.id)
                );

                setPosicao(indice !== -1 ? indice + 1 : null);

            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Erro ao buscar posição:", error);
                    setPosicao(null);
                }
            }
        }

        setPosicao(null);
        buscarPosicao();

        return () => controller.abort();

    }, [draft?.id]);

    const [anuncioAtual, setAnuncioAtual] = useState(0);

    useEffect(() => {
        const intervalo = setInterval(() => {
            setAnuncioAtual(atual => (atual + 1) % 4);
        }, 7000);

        return () => clearInterval(intervalo);
    }, []);

    if (compacto) {
        return (
            <>
                <Link
                    to="/Ranking"
                    state={{ transicaoDoRanking: true }}
                    className="menuDireitaProgresso-item"
                    aria-label={posicao === null ? "Ver ranking" : `Ver ranking, ${posicao}º lugar`}
                >
                    <strong>{posicao === null ? "—" : `${posicao}º`}</strong>
                    <span>Ranking</span>
                </Link>
                <div className="menuDireitaProgresso-item">
                    <strong><img src="/icons/fogueira-simiolab.svg" alt="" />{draft?.streak ?? "—"}</strong>
                    <span>Sequência</span>
                </div>
                <div className="menuDireitaProgresso-item">
                    <strong><img src="/icons/bateria-simiolab.svg" alt="" />{draft?.energia ?? "—"}</strong>
                    <span>Energia</span>
                </div>
            </>
        );
    }

    return (
        <section
            className="menuDireita-card menuDireitaSuperior"
            aria-labelledby="menuDireita-divisao-titulo"
        >
            <div className="painel-indicadores">
                <h4>
                    <img
                    src="/icons/fogueira-simiolab.svg"
                    alt="Sequencia:"
                    width={28}
                    height={28}
                    style={{ verticalAlign: "middle", marginInlineEnd: 6}}
                    /> 
                    <span className="painel-indicador-valor">{draft.streak}</span>
                    <span className="painel-divisoria-vertical" aria-hidden="true" />
                    <img
                    src="/icons/bateria-simiolab.svg"
                    alt="Energia:"
                    width={28}
                    height={28}
                    style={{ verticalAlign: "middle", marginInlineEnd: 6}}
                    /> 
                    <span className="painel-indicador-valor">{draft.energia}</span>
                </h4>
            </div>

            <hr className="painel-divisoria" />

            <div className="menuDireita-cabecalho">
                <h3 id="menuDireita-divisao-titulo">
                    Sua posição no ranking
                </h3>
            </div>

            <div className="menuDireitaSuperior-conteudo">
                <h3>
                    {posicao !== null
                        ? `${posicao}º lugar`
                        : "Carregando..."}
                </h3>

                <p>
                    Faça uma lição pra subir no ranking dessa semana
                    e competir com as outras pessoas.
                </p>
            </div>

            <Link
                to="/Ranking"
                className="menuDireitaSuperior-botao"
                onClick={() => nomePelaRota('/ranking')}
            >
                VER RANKING
            </Link>
            
            <h3 className="parceiros">Descubra nossos parceiros</h3>

            <div className="ad">
                <a
                    href="https://www.bing.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={anuncioAtual === 0 ? "ad-ativo" : ""}
                >
                    <img src="/ads/VIDA-TERRESTRE.png" alt="Vida terrestre" />
                </a>

                <a
                    href="https://peak.squareweb.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={anuncioAtual === 1 ? "ad-ativo" : ""}
                >
                    <img src="/ads/peak.jpeg" alt="Peak" />
                </a>

                <a
                    href="https://exemplo.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={anuncioAtual === 2 ? "ad-ativo" : ""}
                >
                    <img src="/ads/pjHelper.png" alt="PJ Helper" />
                </a>

                <a
                    href="https://exemplo.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={anuncioAtual === 3 ? "ad-ativo" : ""}
                >
                    <img src="/ads/boaTur.jpeg" alt="BoaTur" />
                </a>
            </div>

        </section>
    );
}

export default MenuDireitaSuperior;
