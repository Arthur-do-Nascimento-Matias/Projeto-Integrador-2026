import { Link } from 'react-router-dom'
import moki from '../assets/MOKI.png'
import './NotFound.css'

function NotFound() {
    return (
        <section
            className="moki404"
            aria-labelledby="moki404-title"
        >
            <div className="moki404-content">
                <div className="moki404-illustration">
                    <span
                        className="moki404-question"
                        aria-hidden="true"
                    >
                        ?
                    </span>

                    <img
                        src={moki}
                        alt="Moki tentando encontrar o caminho"
                        className="moki404-image"
                    />

                    <span
                        className="moki404-shadow"
                        aria-hidden="true"
                    />
                </div>

                <span className="moki404-code">404</span>

                <span className="moki404-label">
                    PÁGINA NÃO ENCONTRADA
                </span>

                <h1 id="moki404-title">
                    O Moki saiu da trilha!
                </h1>

                <p>
                    Parece que esse caminho não existe.
                    Vamos voltar e continuar nossa aventura?
                </p>

                <Link to="/painel" className="moki404-button">
                    <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M19 12H5m0 0 6 6m-6-6 6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    Voltar para o início
                </Link>
            </div>
        </section>
    )
}

export default NotFound