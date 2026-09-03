import { useState, useEffect } from "react";
import '../Biblioteca/Biblioteca.css'

function Biblioteca() {

    const [capas, setCapas] = useState([]);
    
    useEffect(() => {

            fetch(`http://localhost:5000/livros`)
            .then(resp => resp.json())
            .then(data => {

                console.log(data)
                setCapas(data)

                }
            )

                console.log('biblioteca')

        }, [])

    return(
        <>
        <div className="capas">

                    {capas.map((capa, index) => {
                        return(
                        <img
                            id={capa.id}
                            className="capa"
                            key={index}
                            src={`data:image/jpeg;base64,${capa.img}`}
                            alt={`Capa ${index + 1}`}
                            width="200"
                            onClick={() => window.open(`http://localhost:5000/abrirLivro?id=${capa.id}`)}
                        />
                        )
                    })}

            </div>
        </>
    )
}

export default Biblioteca
