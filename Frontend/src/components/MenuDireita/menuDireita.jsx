import "./menuDireita.css";

import MenuDireitaSuperior from "./MenuDireitaSuperior";
import MenuDireitaInferior from "./MenuDireitaInferior";

function MenuDireita({ draft }) {
  return (
    <aside className="menuLateralDireita">
      <div className="menuDireita-cards">
        <MenuDireitaSuperior />

        <MenuDireitaInferior 
            draft={draft}
        />
      </div>
    </aside>
  );
}

export default MenuDireita;