import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import "./menuDireita.css";

import MenuDireitaSuperior from "./MenuDireitaSuperior";
import MenuDireitaInferior from "./MenuDireitaInferior";

const consultaCompacta = "(max-width: 1100px), (max-width: 1400px) and (pointer: coarse)";

function observarLargura(atualizar) {
  const media = window.matchMedia(consultaCompacta);
  media.addEventListener("change", atualizar);
  return () => media.removeEventListener("change", atualizar);
}

function lerModoCompacto() {
  return window.matchMedia(consultaCompacta).matches;
}

export default function MenuDireita({ draft }) {
  const compacto = useSyncExternalStore(observarLargura, lerModoCompacto, () => false);

  const cards = (
    <div className="menuDireita-cards">
      <MenuDireitaSuperior draft={draft} compacto={compacto} />
      <MenuDireitaInferior draft={draft} compacto={compacto} />
    </div>
  );

  if (compacto) {
    return (
      <>
        <div className="menuDireitaProgresso-espaco" aria-hidden="true" />
        {createPortal(
          <section className="menuDireitaProgresso" aria-label="Seu progresso">
            {cards}
          </section>,
          document.body
        )}
      </>
    );
  }

  return createPortal(
    <aside className="menuLateralDireita">{cards}</aside>,
    document.body
  );
}
