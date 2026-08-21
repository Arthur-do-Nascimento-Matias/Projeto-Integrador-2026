import './header.css'
import simio from '../../assets/simio.png'

function Header() {
    return( 
    <>  
        <header className="cabecalho">
            <div className="logo-simiolab">
                <img src={simio} alt="" />
                <span className="logo-simio">
                    <span>S</span><span>i</span><span>m</span><span>i</span><span>o</span>
                </span>
                <span className="logo-lab">LAB</span>
            </div>
        </header>
    </>
    )
}

export default Header
