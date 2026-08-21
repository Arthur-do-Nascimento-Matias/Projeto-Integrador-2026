import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Painel from './pages/painel'
import ChatBot from './pages/painelChatBot';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Painel />} />
          <Route path="/chatBot" element={<ChatBot />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
