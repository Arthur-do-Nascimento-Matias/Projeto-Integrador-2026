
import { useEffect, useState } from 'react'

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate
} from "react-router-dom";

import "./App.css";

import PainelIndex from "./pages/Index";
import Painel from "./pages/painel";
import Login from "./pages/Login";
import ChatBot from "./pages/painelChatBot";
import PainelBiblioteca from "./pages/PainelBiblioteca";
import PainelPerfil from "./pages/PainelPerfil";
import Configuracoes from "./components/Configuracoes/Configuracoes";
import FolhasCaindo from "./components/FolhasCaindo/FolhasCaindo";
import MenuEsquerda from "./components/MenuEsquerda/MenuEsquerda";
import Ranking from "./components/ranking/ranking";


function RotaPrivada({ children }) {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function ConteudoApp({
  folhasAtivas,
  alterarFolhas
}) {

  const navigate = useNavigate();
  const location = useLocation();

  const estaNoIndex = location.pathname === '/';
  const estaNoLogin = location.pathname === '/login';

  const [draft, setDraft] = useState({
    id: '',
    name: '',
    username: '',
    bio: '',
    photoFile: null,
    atividadesConcluidas: []
  });


  useEffect(() => {

    if (estaNoLogin || estaNoIndex) return;

    async function carregarUsuario() {

      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      try {

        const resposta = await fetch(
          'http://localhost:3000/perfil',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok || !dados.ok) {

          localStorage.removeItem('token');
          navigate('/login', { replace: true });

          return;
        }

        const usuario = dados.usuario;

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
        });

      } catch (erro) {

        console.error('Erro ao carregar usuário:', erro);

      }
    }

    carregarUsuario();

  }, [estaNoLogin, estaNoIndex, navigate]);

  const [mode, setMode] = useState('login')

  return (

    <main className={estaNoIndex ? 'index-page' : 'auth-page'}>

      {/* FUNDO DA FLORESTA - NÃO APARECE NO INDEX */}

      {!estaNoIndex && (
        <>
          <div className="ambient-elements" aria-hidden="true">
            <div className="particle p-1" />
            <div className="particle p-2" />
            <div className="particle p-3" />
            <div className="particle p-4" />
          </div>

          <div className="forest-shape forest-shape-one" />
          <div className="forest-shape forest-shape-two" />
        </>
      )}


      {/* SIDEBAR FIXA ENTRE AS ROTAS */}

      {!estaNoLogin && !estaNoIndex && (
        <MenuEsquerda />
      )}


      {/* ROTAS */}

      <Routes>

        {/* PÁGINA INICIAL PÚBLICA */}

        <Route
          path="/"
          element={<PainelIndex 
              mode={mode}
              setMode={setMode}
          />}
        />


        {/* PAINEL PRINCIPAL */}

        <Route
          path="/painel"
          element={
            <RotaPrivada>
              <>
                {folhasAtivas && <FolhasCaindo />}

                <Painel
                  draft={draft}
                  setDraft={setDraft}
                />
              </>
            </RotaPrivada>
          }
        />


        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <Login
              draft={draft}
              setDraft={setDraft}
              mode={mode}
              setMode={setMode}
            />
          }
        />


        {/* RANKING */}

        <Route
          path="/Ranking"
          element={
            <RotaPrivada>
              <Ranking />
            </RotaPrivada>
          }
        />


        {/* CHATBOT */}

        <Route
          path="/chatBot"
          element={
            <RotaPrivada>
              <ChatBot />
            </RotaPrivada>
          }
        />


        {/* BIBLIOTECA */}

        <Route
          path="/biblioteca"
          element={
            <RotaPrivada>
              <PainelBiblioteca />
            </RotaPrivada>
          }
        />


        {/* PERFIL */}

        <Route
          path="/perfil"
          element={
            <RotaPrivada>
              <PainelPerfil
                draft={draft}
                setDraft={setDraft}
              />
            </RotaPrivada>
          }
        />


        {/* CONFIGURAÇÕES */}

        <Route
          path="/configuracoes"
          element={
            <RotaPrivada>
              <Configuracoes
                folhasAtivas={folhasAtivas}
                alterarFolhas={alterarFolhas}
              />
            </RotaPrivada>
          }
        />

      </Routes>

    </main>
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

    <BrowserRouter>

      <ConteudoApp
        folhasAtivas={folhasAtivas}
        alterarFolhas={alterarFolhas}
      />

    </BrowserRouter>

  );
}

export default App;
