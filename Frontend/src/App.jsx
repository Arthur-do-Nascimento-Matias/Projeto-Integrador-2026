import { useState } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Painel from "./pages/painel";

import Login from "./pages/Login";

import ChatBot from "./pages/painelChatBot";

import PainelBiblioteca from "./pages/PainelBiblioteca";

import PainelPerfil from "./pages/PainelPerfil";

import Configuracoes from "./components/Configuracoes/Configuracoes";

import FolhasCaindo from "./components/FolhasCaindo/FolhasCaindo";

import PainelRanking from "./pages/PainelRanking";

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

          <Routes>


            {/* INÍCIO */}

            <Route
              path="/"
              element={
                <>

                  {folhasAtivas && <FolhasCaindo />}

                  <Painel />

                </>
              }
            />


            {/* CHATBOT */}

            <Route
              path="/chatBot"
              element={<ChatBot />}
            />


            {/* LOGIN */}

            <Route
              path="/login"
              element={<Login />}
            />


            {/* BIBLIOTECA */}

            <Route
              path="/biblioteca"
              element={<PainelBiblioteca />}
            />


            {/* PERFIL */}

            <Route
              path="/perfil"
              element={<PainelPerfil />}
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

          <Route 

            path="/perfil" 
            element={<PainelPerfil />} 
          
          />

          <Route 
          
            path="/ranking"
            element={<PainelRanking />} 
            
          />


          </Routes>

        </BrowserRouter>

      </main>

    </>

  );

}


export default App;
