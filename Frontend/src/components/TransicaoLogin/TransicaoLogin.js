import { flushSync } from 'react-dom'
import Moki from '../../assets/MOKI.png'
import './TransicaoLogin.css'

let transicaoAtiva = false

const esperar = (tempo) =>
  new Promise((resolve) => setTimeout(resolve, tempo))

export async function executarTransicaoLogin(abrirPainel) {
  if (transicaoAtiva) return

  transicaoAtiva = true

  let camada = null
  let navegou = false

  const animacoes = []
  const raiz = document.getElementById('root')
  const inertAnterior = raiz?.inert
  const overflowAnterior = document.documentElement.style.overflow

  function navegar() {
    if (navegou) return

    navegou = true
    flushSync(abrirPainel)
  }

  function mover(elemento, inicio, fim, duracao, atraso = 0) {
    const animacao = elemento.animate(
      [
        { transform: `translateY(${inicio})` },
        { transform: `translateY(${fim})` },
      ],
      {
        duration: duracao,
        delay: atraso,
        easing: 'cubic-bezier(.76, 0, .24, 1)',
        fill: 'forwards',
      }
    )

    animacoes.push(animacao)

    return animacao.finished
  }

  try {
    const movimentoReduzido = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (movimentoReduzido || !Element.prototype.animate) {
      navegar()
      return
    }

    camada = document.createElement('div')
    camada.className = 'login-transicao'
    camada.setAttribute('aria-hidden', 'true')

    const faixas = document.createElement('div')
    faixas.className = 'login-transicao-faixas'

    const colunas = Array.from({ length: 8 }, () => {
      const coluna = document.createElement('div')

      faixas.appendChild(coluna)

      return coluna
    })

    const mascote = document.createElement('div')
    mascote.className = 'login-transicao-mascote'

    const enquadramento = document.createElement('div')
    enquadramento.className = 'login-transicao-enquadramento'

    const imagem = new Image()
    imagem.src = Moki
    imagem.alt = ''

    const imagemPronta = imagem.decode().then(
      () => true,
      () => false
    )

    enquadramento.appendChild(imagem)
    mascote.appendChild(enquadramento)
    camada.append(faixas, mascote)

    // Fora do componente de login para continuar após a troca de rota.
    document.body.appendChild(camada)

    if (raiz) raiz.inert = true

    document.documentElement.style.overflow = 'hidden'

    // As faixas sobem da direita para a esquerda.
    await Promise.all(
      colunas.map((coluna, indice) =>
        mover(coluna, '101%', '0%', 640, (7 - indice) * 65)
      )
    )

    // A tela já está completamente laranja.
    navegar()

    const mostrarMascote = await Promise.race([
      imagemPronta,
      esperar(1000).then(() => false),
    ])

    if (mostrarMascote) {
      await mover(mascote, '110%', '0%', 640)
      await esperar(650)
      await mover(mascote, '0%', '-110%', 470)
    }

    // As faixas continuam subindo e revelam o painel.
    await Promise.all(
      colunas.map((coluna, indice) =>
        mover(coluna, '0%', '-101%', 600, (7 - indice) * 55)
      )
    )
  } catch (erro) {
    console.error('Erro na transição de login:', erro)

    // Uma falha visual não impede a entrada no painel.
    navegar()
  } finally {
    animacoes.forEach((animacao) => animacao.cancel())
    camada?.remove()

    if (raiz) raiz.inert = inertAnterior

    document.documentElement.style.overflow = overflowAnterior
    transicaoAtiva = false
  }
}
