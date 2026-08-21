import './menuDireita.css'
import simio from '../../assets/simio.png'

function MenuDireita() {
    return(
        <>
        <div className="menuLateralDireita">

            <div className="cards">

           <div className="league-card">
        <div className="card-header">
            <h3>Divisão Ouro</h3>
            <a href="#">VER DIVISÃO</a>
        </div>

        <div className="card-body">
            <img src={simio} alt="Dormindo" />
            <p>
                Faça uma lição pra entrar no ranking dessa semana e competir com as outras pessoas.
            </p>
        </div>
        </div>

        <div className="missoes-card">
            <div className="card-header">
                <h3>Missões do dia</h3>
                <a href="#">VER TODAS</a>
            </div>
            <div className="missao-lista" id="missaoLista"></div>
        </div>

    </div>
    </div>
    </>
    )
}

export default MenuDireita
