
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {nomePelaRota} from "../menuEsquerda/menuEsquerda";

import "./MenuDireitaSuperior.css";

function MenuDireitaSuperior({ draft }) {
    const [posicao, setPosicao] = useState(null);

    useEffect(() => {
        if (!draft?.id) return;

        const controller = new AbortController();

        async function buscarPosicao() {
            try {
                const resp = await fetch(
                    "http://localhost:3000/ranking",
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

    return (
        <section
            className="menuDireita-card menuDireitaSuperior"
            aria-labelledby="menuDireita-divisao-titulo"
        >
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
        </section>
    );
}

export default MenuDireitaSuperior;
