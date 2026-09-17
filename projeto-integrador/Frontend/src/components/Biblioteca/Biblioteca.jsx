import { useState, useEffect } from "react";
import "../Biblioteca/Biblioteca.css";

function Biblioteca() {

    const [capas, setCapas] = useState([]);

    useEffect(() => {

        fetch("http://localhost:5000/livros")
            .then(resp => resp.json())
            .then(data => {
                console.log(data);
                setCapas(data);
            });

        console.log("biblioteca");

    }, []);

    return (
        <>
            <div className="container">

                <div className="capas">

                    {capas.map((capa) => {

                        return (
                            <div
                                className="livro"
                                key={capa.id}
                            >
                                <img
                                    id={capa.id}
                                    className="capa"
                                    src={`data:image/jpeg;base64,${capa.img}`}
                                    alt={`Capa do livro ${capa.id}`}
                                    onClick={() =>
                                        window.open(
                                            `http://localhost:5000/abrirLivro?id=${capa.id}`,
                                            "_blank"
                                        )
                                    }
                                />
                            </div>
                        );

                    })}

                </div>

            </div>
        </>
    );
}

export default Biblioteca;  