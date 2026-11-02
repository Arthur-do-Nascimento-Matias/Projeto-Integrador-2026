import { createPortal } from "react-dom";

import "./menuDireita.css";

import MenuDireitaSuperior from "./MenuDireitaSuperior";
import MenuDireitaInferior from "./MenuDireitaInferior";

function MenuDireita({ draft }) {
  /*
  return createPortal(
    <aside className="menuLateralDireita">
      <div className="menuDireita-cards">
        <MenuDireitaSuperior draft={draft} />
        <MenuDireitaInferior draft={draft} />
      </div>
    </aside>,
    document.body
  );
  */
}

export default MenuDireita;
