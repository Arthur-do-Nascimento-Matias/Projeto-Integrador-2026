import './MenuDireita.css'

import simio from '../../assets/simio.png'


function MenuDireita() {
  return (
    <aside className="menuLateralDireita">

      <div className="cards">


        <section className="league-card">

          <div className="league-top">
            <h3>Divisão Ouro</h3>
          </div>


          <div className="card-body">

            <img
              src={simio}
              alt="Mascote Simio"
            />

            <p>
              Faça uma lição pra entrar no ranking dessa semana
              e competir com as outras pessoas.
            </p>

          </div>


          <a
            href="#"
            className="league-button"
          >
            VER DIVISÃO
          </a>

        </section>


        {/* ==================================================
            MISSÕES DO DIA
        ================================================== */}

        <section className="missoes-card">

          <div className="card-header">

            <h3>
              Missões do dia
            </h3>

            <a href="#">
              VER TODAS
            </a>

          </div>


          {/* As 3 missões serão inseridas aqui futuramente */}

          <div
            className="missao-lista"
            id="missaoLista"
          >
          </div>

        </section>

      </div>

    </aside>
  )
}


export default MenuDireita