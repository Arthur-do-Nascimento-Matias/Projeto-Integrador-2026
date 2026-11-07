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
            <h2>Aparência</h2>
            <p>Alterne entre o modo claro e escuro.</p>
          </div>

          <button
            type="button"
            className="simio-tema"
            role="switch"
            aria-label="Modo escuro"
            aria-checked={tema === "escuro"}
            onClick={() => alternarTema(setTema)}
          >
            <svg
              className="simio-tema-lua"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"
                fill="currentColor"
              />
            </svg>

            <svg
              className="simio-tema-sol"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <path
                d="M12 2v2m0 16v2M2 12h2m16 0h2
         M5 5l1.5 1.5m11 11L19 19
         M5 19l1.5-1.5m11-11L19 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <span className="simio-tema-bolinha" aria-hidden="true" />
          </button>
        </div>


        <div className="config-card">

          <div className="config-texto">
            <h2>Folhas caindo</h2>

            <p>
              Exibir folhas caindo na tela inicial.
            </p>
          </div>

          <button
            type="button"
            className={`switch ${folhasAtivas ? "ativo" : ""
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