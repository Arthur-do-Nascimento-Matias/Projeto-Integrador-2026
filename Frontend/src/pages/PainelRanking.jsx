import MenuEsquerda from "../components/menuEsquerda/menuEsquerda";
import Ranking from "../components/ranking/ranking";

export default function PainelRanking() {
  return (
    <div className="rk-layout">
      <MenuEsquerda />
      <Ranking />
    </div>
  );
}