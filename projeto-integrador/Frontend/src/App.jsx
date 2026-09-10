import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Painel from './pages/painel'
import Login from './pages/Login'
import ChatBot from './pages/painelChatBot';
import PainelBiblioteca from './pages/PainelBiblioteca';
import PainelPerfil from './pages/PainelPerfil';

function App() {

  return (
    <>

    
    <main className="auth-page">
      {/* Elementos ambientais para dar vida à floresta */}
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

          <Route path="/chatBot" element={<ChatBot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Painel />} />
          <Route path='/biblioteca' element={<PainelBiblioteca />} />
          <Route path="/perfil" element={<PainelPerfil />} />

        </Routes>
      </BrowserRouter>
      
      </main>
    </>
  )
}

export default App
