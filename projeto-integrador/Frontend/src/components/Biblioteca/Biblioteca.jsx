import { useState, useEffect } from "react";
import '../Biblioteca/Biblioteca.css'

function Biblioteca() {

    const [capas, setCapas] = useState([]);

    useEffect(() => {

            fetch(`http://localhost:5000/livros`)
            .then(resp => resp.json())
            .then(data => {

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
                            className="capa"
                            key={index}
                            src={`data:image/jpeg;base64,${capa}`}
                            alt={`Capa ${index + 1}`}
                            width="200"
                        />
                        )
                    })}

            </div>
        </>
    )
}

export default Biblioteca
