function Biblioteca() {

    fetch(`http://localhost:5000/livros`)
    .then(resp => resp.json())
    .then(data => 
        data.forEach(element => {
            const livro = document.createElement('div')
            livro.innerHTML = element
        })
    )

    return(
        <>

        </>
    )
}

export default Biblioteca
