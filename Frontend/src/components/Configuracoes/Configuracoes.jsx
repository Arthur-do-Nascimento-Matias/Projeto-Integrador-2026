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

        <button onClick={() => alternarTema(setTema)} className="alternar-modo">
            {tema === "claro" ? "🌙 Modo escuro" : "☀️ Modo claro"}
        </button>


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

        </div>

        <div className="config-card config-password">
          <div className="config-texto">
            <h2>Trocar senha</h2>

            <p>Troque sua senha atual</p>
          </div>
          <button
            type="button"
            className="botao-trocar-senha"

          >
            Trocar senha 
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