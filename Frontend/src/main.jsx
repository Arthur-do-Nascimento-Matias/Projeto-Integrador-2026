import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './responsiveA16.css'
import './responsiveS24.css'
import './responsiveIphone15.css'
import App from './App.jsx'

const tamanhoTextoSalvo =
  localStorage.getItem("tamanhoTexto") ||
  "normal";

document.documentElement.dataset.tamanhoTexto =
  tamanhoTextoSalvo;
createRoot(document.getElementById('root')).render(

    <App />

)
