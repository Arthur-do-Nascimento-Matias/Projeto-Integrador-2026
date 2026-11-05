import "./Configuracoes.css";
import { alternarTema } from "../../App";
import { useNavigate } from "react-router-dom";

import {
  executarTransicaoLogin
} from "../TransicaoLogin/TransicaoLogin";


function Configuracoes({
  folhasAtivas,
  alterarFolhas,
  tema,
  setTema
}) {
  const navigate = useNavigate();


  async function sairDaConta() {
    const confirmar = window.confirm(
      "Deseja realmente sair da sua conta?"
    );

    if (!confirmar) return;

    await executarTransicaoLogin(() => {
      localStorage.removeItem("token");

      navigate("/login", {
        replace: true
      });
    });
  }


  return (
    <div className="configuracoes">

      <h1>Configurações</h1>

      <div className="config-lista">

        <div className="config-card">

          <div className="config-texto">
            <h2>Folhas caindo</h2>

            <p>
              Exibir folhas caindo na tela inicial.
            </p>
          </div>

          <button
            type="button"
            className={`switch ${
              folhasAtivas ? "ativo" : ""
            }`}
            onClick={() =>
              alterarFolhas(!folhasAtivas)
            }
            aria-label="Ativar ou desativar folhas caindo"
          >
            <span className="switch-bolinha" />
          </button>

          <button onClick={() => alternarTema(setTema)}>
              {tema === "claro" ? "🌙 Modo escuro" : "☀️ Modo claro"}
          </button>

        </div>


        <div className="config-card config-card-conta">

          <div className="config-texto">
            <h2>Sair da conta</h2>

            <p>
              Encerre sua sessão neste dispositivo.
            </p>
          </div>

          <button
            type="button"
            className="botao-sair"
            onClick={sairDaConta}
          >
            Sair
          </button>

        </div>

      </div>

    </div>
  );
}

export default Configuracoes;