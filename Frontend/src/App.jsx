import { useEffect, useState } from 'react'
import { apiFetch } from '/src/components/utils/api'
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
import MenuEsquerda from "./components/menuEsquerda/menuEsquerda";
import Ranking from "./components/ranking/ranking";
import Instagram from "./components/Instagram/instagram"
import Github from './components/Git/git';
import PainelFeed from './pages/PainelFeed'
import NotFound from './pages/NotFound'
import RedefinirSenha from './components/recuperarSenha/RedefinirSenha';

export function alternarTema(setTema) {
  setTema(anterior =>
    anterior === "claro" ? "escuro" : "claro"
  );
}

function RotaPrivada({ children }) {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


import PainelSimulados from "./pages/PainelSimulados";

import Simulados from "./components/simulados/simulados";

function ConteudoApp({
  folhasAtivas,
  alterarFolhas
}) {

  const navigate = useNavigate();
  const location = useLocation();

  const estaNoIndex = location.pathname === '/';
  const estaNoLogin = location.pathname === '/login';
  const estaNoInstagram = location.pathname === "/instagram";
  const estaNoGit = location.pathname.toLowerCase().replace(/\/+$/, "") === "/github";
  const estaNaRedefinicaoSenha = location.pathname === "/redefinir-senha";

  const [draft, setDraft] = useState({
    id: '',
    name: '',
    username: '',
    bio: '',
    photo: null,
    atividadesConcluidas: [],
    total_perguntas: '',
    streak: null,
    energia: null
  });


  useEffect(() => {

    if (estaNoLogin || estaNoIndex || estaNaRedefinicaoSenha || estaNoInstagram || estaNoGit) return;

    async function carregarUsuario() {

      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      try {

        const resposta = await apiFetch(
          '/perfil',
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
          photo: usuario.foto_perfil_texto || '',

          atividadesConcluidas: [
            Number(usuario.atvidades_concluidas_geral) || 0,
            Number(usuario.atvidades_concluidas_matematica) || 0,
            Number(usuario.atvidades_concluidas_portugues) || 0,
            Number(usuario.atvidades_concluidas_historia) || 0,
            Number(usuario.atvidades_concluidas_geografia) || 0,
            Number(usuario.atvidades_concluidas_ciencias) || 0,
            Number(usuario.atvidades_concluidas_ingles) || 0,
          ],

          total_perguntas: usuario.total_perguntas,
          streak: usuario.streak,
          energia: usuario.energia
        });

      } catch (erro) {

        console.error('Erro ao carregar usuário:', erro);

      }
    }

    carregarUsuario();

  }, [
    estaNoLogin,
    estaNoIndex,
    estaNoInstagram,
    estaNoGit,
    navigate
  ]);

  // Confere a virada do dia com a aba aberta e ao voltar para ela.
  useEffect(() => {
    if (estaNoLogin || estaNoIndex || estaNaRedefinicaoSenha || estaNoInstagram || estaNoGit) return;
    const obterDia = () => new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    let diaSincronizado = obterDia();
    let carregando = false;
    let cancelado = false;

    async function conferirEnergia() {
      const dia = obterDia();
      if (cancelado || carregando || dia === diaSincronizado || document.visibilityState === 'hidden') return;
      const token = localStorage.getItem('token');
      if (!token) return;
      carregando = true;
      try {
        const resposta = await apiFetch('/perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dados = await resposta.json();
        if (cancelado || token !== localStorage.getItem('token') || !resposta.ok || !dados.ok) return;
        setDraft(anterior => String(anterior.id) === String(dados.usuario.id_usuario)
          ? { ...anterior, energia: dados.usuario.energia }
          : anterior);
        diaSincronizado = dia;
      } catch (erro) {
        console.error('Erro ao renovar energia:', erro);
      } finally {
        carregando = false;
      }
    }

    const intervalo = window.setInterval(conferirEnergia, 30000);
    window.addEventListener('focus', conferirEnergia);
    document.addEventListener('visibilitychange', conferirEnergia);
    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      window.removeEventListener('focus', conferirEnergia);
      document.removeEventListener('visibilitychange', conferirEnergia);
    };
  }, [estaNoLogin, estaNoIndex, estaNaRedefinicaoSenha, estaNoInstagram, estaNoGit]);

  const [mode, setMode] = useState('login')


  const [tema, setTema] = useState(() => {
    const temaSalvo = localStorage.getItem("tema");
    const escolhaManual = localStorage.getItem("temaManual");

    if (escolhaManual === "true" && temaSalvo) {
      return temaSalvo;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "escuro"
      : "claro";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-tema", tema);
    localStorage.setItem("tema", tema);
  }, [tema]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    function atualizarTema(evento) {
      const escolhaManual = localStorage.getItem("temaManual");

      if (escolhaManual !== "true") {
        setTema(evento.matches ? "escuro" : "claro");
      }
    }

    mediaQuery.addEventListener("change", atualizarTema);

    return () => {
      mediaQuery.removeEventListener("change", atualizarTema);
    };
  }, []);

  return (

    <main className={estaNoIndex ? 'index-page' : 'auth-page'}>


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

      {!estaNoLogin && !estaNoIndex && !estaNoInstagram && !estaNoGit && !estaNaRedefinicaoSenha && (
        <MenuEsquerda />
      )}


      {/* ROTAS */}

      <Routes>

        <Route
          path="/redefinir-senha"
          element={
            <RedefinirSenha />
          }
        />

        {/* PÁGINA INICIAL PÚBLICA */}

        <Route
          path="/"
          element={<PainelIndex
            mode={mode}
            setMode={setMode}
            tema={tema}
            setTema={setTema}
            alternarTema={alternarTema}
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
        {/* simulados */}
        <Route
          path="/simulados"
          element={<Simulados />}
        />

        <Route path="*"
          element={<NotFound />}
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

        <Route
          path="/feed"
          element={
            <RotaPrivada>
              <PainelFeed />
            </RotaPrivada>
          }
        />

        <Route
          path="/instagram"
          element={
            <Instagram />
          }
        />
        <Route
          path="/github"
          element={
            <Github />
          }
        />

        {/* RANKING */}

        <Route
          path="/Ranking"
          element={
            <RotaPrivada>
              <Ranking usuarioId={draft.id} />
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

        <Route
          path="/simulados"
          element={<PainelSimulados />}
        />


        {/* CONFIGURAÇÕES */}

        <Route
          path="/configuracoes"
          element={
            <RotaPrivada>
              <Configuracoes
                folhasAtivas={folhasAtivas}
                alterarFolhas={alterarFolhas}
                tema={tema}
                setTema={setTema}
              />
            </RotaPrivada>
          }
        />

      </Routes>

    </main>
  );
}


const titulosPorRota = {
  "/": "SimioLab | Educação gamificada",
  "/login": "Entrar | SimioLab",
  "/simulados": "Simulados | SimioLab",
  "/biblioteca": "Biblioteca | SimioLab",
  "/ranking": "Ranking | SimioLab",
  "/chatBot": "SimIA | SimioLab",
  "/feed": "Feed | SimioLab",
  "/perfil": "Perfil | SimioLab",
  "/configuracoes": "Configurações | SimioLab",
}

function TituloDaAba() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = titulosPorRota[pathname] ?? titulosPorRota["/"]
  }, [pathname])

  return null
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
      <TituloDaAba />

      <ConteudoApp
        folhasAtivas={folhasAtivas}
        alterarFolhas={alterarFolhas}
      />

    </BrowserRouter>

  );
}

export default App;
