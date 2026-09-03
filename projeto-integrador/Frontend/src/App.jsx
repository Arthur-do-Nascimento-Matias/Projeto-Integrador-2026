import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Painel from './pages/painel'
import Login from './pages/Login'
import ChatBot from './pages/painelChatBot';
import PainelBiblioteca from './pages/PainelBiblioteca';
import PainelPerfil from './pages/painel';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/chatBot" element={<ChatBot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Painel />} />
          <Route path='/biblioteca' element={<PainelBiblioteca />} />
         <Route path="/perfil" element={<PainelPerfil />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
