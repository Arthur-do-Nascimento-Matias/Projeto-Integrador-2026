import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Painel from './pages/painel'
import Login from './pages/Login'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Painel />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
