import PainelIndex from "../components/Index/Index"

function Index({ mode, setMode, tema, setTema, alternarTema }) {
  return (
    <>

        <PainelIndex 
            mode={mode}
            setMode={setMode}
            tema={tema}
            setTema={setTema}
            alternarTema={alternarTema}
        />
    </>
)
}

export default Index
