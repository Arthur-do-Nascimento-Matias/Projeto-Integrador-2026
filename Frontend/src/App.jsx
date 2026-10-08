import { useEffect, useState } from 'react'

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import "./App.css";

import Painel from "./pages/painel";

import Login from "./pages/Login";

import ChatBot from "./pages/painelChatBot";

import PainelBiblioteca from "./pages/PainelBiblioteca";

import PainelPerfil from "./pages/PainelPerfil";

import Configuracoes from "./components/Configuracoes/Configuracoes";

import FolhasCaindo from "./components/FolhasCaindo/FolhasCaindo";

import MenuEsquerda from "./components/MenuEsquerda/MenuEsquerda";

import Ranking from "./components/ranking/ranking"

import PainelSimulados from "./pages/PainelSimulados";

function ConteudoApp({
  folhasAtivas,
  alterarFolhas
}) {

  const location = useLocation();

  const [draft, setDraft] = useState({
    id: '',
    name: '',
    username: '',
    bio: '',
    photoFile: null,
    atividadesConcluidas: []
  })

  useEffect(() => {
    async function carregarUsuario() {
      const token = localStorage.getItem('token')

      if (!token) {
        return
      }

      try {
        const resposta = await fetch(
          'http://localhost:3000/perfil',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const dados = await resposta.json()

        if (!resposta.ok || !dados.ok) {
          localStorage.removeItem('token')
          return
        }

        const usuario = dados.usuario

        setDraft({
          id: usuario.id_usuario || '',
          name: usuario.nome_de_exibicao || '',
          username: usuario.nome_de_usuario || '',
          bio: usuario.bio || '',
          photoFile: null,

          atividadesConcluidas: [
            Number(usuario.atvidades_concluidas_geral) || 0,
            Number(usuario.atvidades_concluidas_matematica) || 0,
            Number(usuario.atvidades_concluidas_portugues) || 0,
            Number(usuario.atvidades_concluidas_historia) || 0,
            Number(usuario.atvidades_concluidas_geografia) || 0,
            Number(usuario.atvidades_concluidas_ciencias) || 0,
            Number(usuario.atvidades_concluidas_ingles) || 0,
          ],
        })

      } catch (erro) {
        console.error('Erro ao carregar usuário:', erro)
      }
    }

    carregarUsuario()
  }, [])

  return (
    <>

      {/* SIDEBAR FIXA ENTRE AS ROTAS */}
      {location.pathname !== "/login" && <MenuEsquerda />}

      <Routes>

        {/* INÍCIO */}
        <Route
          path="/"
          element={
            <>
              {folhasAtivas && <FolhasCaindo />}
              <Painel 
                draft={draft}
                setDraft={setDraft}
              />
            </>
          }
        />

        
        {/* Ranking */}
        <Route
          path="/Ranking"
          element={<Ranking />}
        />


        {/* CHATBOT */}
        <Route
          path="/chatBot"
          element={<ChatBot />}
        />


        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login 
            draft={draft}
            setDraft={setDraft}
          />}
        />


        {/* BIBLIOTECA */}
        <Route
          path="/biblioteca"
          element={<PainelBiblioteca />}
        />


        {/* PERFIL */}
        <Route
          path="/perfil"
          element={<PainelPerfil 
            draft={draft}
            setDraft={setDraft} 
          />}
        />

        <Route
    path="/simulados"
    element={<PainelSimulados />}
/>


        {/* CONFIGURAÇÕES */}
        <Route
          path="/configuracoes"
          element={
            <Configuracoes
              folhasAtivas={folhasAtivas}
              alterarFolhas={alterarFolhas}
            />
          }
        />

      </Routes>

    </>
  );
}


function App() {

  const [folhasAtivas, setFolhasAtivas] = useState(() => {

    const valorSalvo = localStorage.getItem("folhasAtivas");

    if (valorSalvo === null) {
      return true;
    }

    return valorSalvo === "true";

  });


  function alterarFolhas(valor) {

    setFolhasAtivas(valor);

    localStorage.setItem("folhasAtivas", String(valor));

  }


  return (

    <>

      <main className="auth-page">

        {/* Elementos ambientais */}

        <div className="ambient-elements" aria-hidden="true">

          <div className="particle p-1" />

          <div className="particle p-2" />

          <div className="particle p-3" />

          <div className="particle p-4" />

        </div>


        <div className="forest-shape forest-shape-one" />

        <div className="forest-shape forest-shape-two" />


        <BrowserRouter>

          <ConteudoApp
            folhasAtivas={folhasAtivas}
            alterarFolhas={alterarFolhas}
          />

        </BrowserRouter>

      </main>

    </>

  );

}


export default App;
