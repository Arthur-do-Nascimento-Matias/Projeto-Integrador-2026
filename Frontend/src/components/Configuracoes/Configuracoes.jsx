import "./Configuracoes.css";
import MenuEsquerda from "../MenuEsquerda/MenuEsquerda";

function Configuracoes({
  folhasAtivas,
  alterarFolhas
}) {
  return (
    <>

      <div className="configuracoes">

        <h1>Configurações</h1>

        <div className="config-card">

          <div className="config-texto">
            <h2>Folhas caindo</h2>

            <p>
              Exibir folhas caindo na tela inicial.
            </p>
          </div>

          <button
            className={`switch ${folhasAtivas ? "ativo" : ""}`}
            onClick={() => alterarFolhas(!folhasAtivas)}
            aria-label="Ativar ou desativar folhas caindo"
          >
            <span className="switch-bolinha" />
          </button>

        </div>

      </div>
    </>
  );
}

export default Configuracoes;