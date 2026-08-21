import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Painel from './pages/painel'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Painel />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
