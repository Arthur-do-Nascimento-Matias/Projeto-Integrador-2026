import "./menuDireita.css";

import MenuDireitaSuperior from "./MenuDireitaSuperior";
import MenuDireitaInferior from "./MenuDireitaInferior";

function MenuDireita() {
  return (
    <aside className="menuLateralDireita">
      <div className="menuDireita-cards">
        <MenuDireitaSuperior />

        <MenuDireitaInferior />
      </div>
    </aside>
  );
}

export default MenuDireita;