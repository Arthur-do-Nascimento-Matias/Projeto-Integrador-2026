import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { executarTransicaoLogin } from '../TransicaoLogin/TransicaoLogin'

import './Login.css'

import simio from '../../assets/simio.png'

const emptyRegister = {
  displayName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function PasswordField({ id, label, value, onChange, invalid }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>

      <div className="auth-password">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={
            id === 'login-password'
              ? 'current-password'
              : 'new-password'
          }
          placeholder="Digite sua senha"
          value={value}
          onChange={onChange}
          aria-invalid={invalid}
        />

        <button
          type="button"
          className={`password-toggle ${visible ? 'is-visible' : ''}`}
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          <span aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function Login({ draft, setDraft }) {

  const navigate = useNavigate()
  const loginEmAndamento = useRef(false)
  const [loginLoading, setLoginLoading] = useState(false)

  const [mode, setMode] = useState('login')

  const [loginData, setLoginData] = useState({
    user: '',
    password: '',
  })

  const [registerData, setRegisterData] = useState(emptyRegister)

  const [loginMessage, setLoginMessage] = useState({
    type: '',
    text: '',
  })

  const [registerMessage, setRegisterMessage] = useState({
    type: '',
    text: '',
  })

  const [recoverOpen, setRecoverOpen] = useState(false)
  const [recoverEmail, setRecoverEmail] = useState('')
  const [recoverSent, setRecoverSent] = useState(false)

  // =========================
  // VERIFICAÇÃO DE E-MAIL
  // =========================

  const [verificationOpen, setVerificationOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  // =========================
  // CARREGAMENTO DO CADASTRO
  // =========================

  const [registerLoading, setRegisterLoading] = useState(false)

  // =========================
  // MICROINTERAÇÃO DE ERRO
  // =========================

  const [isShaking, setIsShaking] = useState(false)

  const triggerShake = () => {
    setIsShaking(true)

    setTimeout(() => {
      setIsShaking(false)
    }, 400)
  }

  function changeMode(nextMode) {
    setMode(nextMode)

    setLoginMessage({
      type: '',
      text: '',
    })

    setRegisterMessage({
      type: '',
      text: '',
    })

    // Ao trocar de tela, fecha a verificação
    setVerificationOpen(false)
    setVerificationCode('')
  }

  // =========================
  // LOGIN
  // =========================

  async function handleLogin(event) {
  event.preventDefault()

  if (loginEmAndamento.current) return

  if (!loginData.user.trim() || !loginData.password) {
    setLoginMessage({
      type: 'error',
      text: 'Preencha o usuário e a senha.',
    })

    triggerShake()
    return
  }

  loginEmAndamento.current = true
  setLoginLoading(true)
  setLoginMessage({ type: '', text: '' })

  let loginConcluido = false

  try {
    const resposta = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOuUsuario: loginData.user.trim(),
        senha: loginData.password,
      }),
    })

    const dados = await resposta.json()

    if (!resposta.ok || !dados.ok || !dados.token) {
      setLoginMessage({
        type: 'error',
        text: dados.message || 'Não foi possível entrar. Confira seus dados.',
      })

      triggerShake()
      return
    }

    // A rota privada precisa encontrar o token antes da navegação.
    localStorage.setItem('token', dados.token)

    setLoginMessage({
      type: 'success',
      text: 'Tudo certo! A aventura vai começar.',
    })

    await executarTransicaoLogin(() => {
      navigate('/', { replace: true })
    })

    loginConcluido = true
  } catch (erro) {
    console.error('Erro ao entrar:', erro)

    setLoginMessage({
      type: 'error',
      text: 'Não foi possível concluir o login. Tente novamente.',
    })

    triggerShake()
  } finally {
    loginEmAndamento.current = false

    if (!loginConcluido) {
      setLoginLoading(false)
    }
  }
}

  // =========================
  // ENVIA CADASTRO
  // =========================

  function handleRegister(event) {
    event.preventDefault()

    if (
      !registerData.displayName.trim() ||
      !registerData.username.trim() ||
      !registerData.email.trim() ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
      setRegisterMessage({
        type: 'error',
        text: 'Preencha todos os campos para criar sua conta.',
      })

      triggerShake()
      return
    }

    if (!registerData.email.includes('@')) {
      setRegisterMessage({
        type: 'error',
        text: 'Informe um endereço de e-mail válido.',
      })

      triggerShake()
      return
    }

    if (registerData.password.length < 6) {
      setRegisterMessage({
        type: 'error',
        text: 'A senha precisa ter pelo menos 6 caracteres.',
      })

      triggerShake()
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterMessage({
        type: 'error',
        text: 'As senhas não coincidem.',
      })

      triggerShake()
      return
    }

    // Começa o carregamento
    setRegisterLoading(true)

    // NÃO cadastra no banco ainda.
    // Apenas pede ao backend para enviar o código.

    fetch('http://localhost:3000/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nomeExibição: registerData.displayName,
        nomeUsuario: registerData.username,
        email: registerData.email,
        senha: registerData.password
      })
    })
      .then(resp => resp.json())
      .then(dados => {

        if (!dados.ok) {
          setRegisterMessage({
            type: 'error',
            text: dados.message || 'Não foi possível enviar o código.',
          })

          triggerShake()
          return
        }

        // Código foi enviado.
        setVerificationOpen(true)
        setVerificationCode('')

        setRegisterMessage({
          type: 'success',
          text: 'Código enviado! Verifique seu e-mail.',
        })
      })
      .catch(() => {

        setRegisterMessage({
          type: 'error',
          text: 'Não foi possível conectar ao servidor.',
        })

        triggerShake()

      })
      .finally(() => {

        // Finaliza o carregamento
        setRegisterLoading(false)

      })
  }

  // =========================
  // VERIFICA CÓDIGO
  // =========================

  function handleVerification(event) {
    event.preventDefault()

    if (verificationCode.length !== 6) {
      setRegisterMessage({
        type: 'error',
        text: 'Digite o código de 6 dígitos enviado para seu e-mail.',
      })

      triggerShake()
      return
    }

    fetch('http://localhost:3000/cadastro/verificar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: registerData.email,
        codigo: verificationCode
      })
    })
      .then(resp => resp.json())
      .then(dados => {

        if (!dados.ok) {
          setRegisterMessage({
            type: 'error',
            text: dados.message || 'Código incorreto.',
          })

          triggerShake()
          return
        }

        // O backend confirmou o código
        // e cadastrou os dados no banco.

        setVerificationOpen(false)
        setVerificationCode('')
        setRegisterData(emptyRegister)

        setRegisterMessage({
          type: 'success',
          text: 'Conta criada com sucesso! Agora você pode entrar.',
        })

        changeMode('login')
      })
      .catch(() => {

        setRegisterMessage({
          type: 'error',
          text: 'Não foi possível conectar ao servidor.',
        })

        triggerShake()

      })
  }

  // =========================
  // RECUPERAÇÃO
  // =========================

  function handleRecover(event) {
    event.preventDefault()

    if (!recoverEmail.trim() || !recoverEmail.includes('@')) {
      triggerShake()
      return
    }

    setRecoverSent(true)
  }

  function closeRecover() {
    setRecoverOpen(false)
    setRecoverSent(false)
    setRecoverEmail('')
  }

  return (
    <>
      {/* Elementos ambientais para dar vida à floresta */}

      <div className="ambient-elements" aria-hidden="true">
        <div className="particle p-1" />
        <div className="particle p-2" />
        <div className="particle p-3" />
        <div className="particle p-4" />
      </div>

      <div className="forest-shape forest-shape-one" />
      <div className="forest-shape forest-shape-two" />

      <section
        className={`auth-container ${
          mode === 'register' ? 'is-register' : ''
        } ${isShaking ? 'is-shaking' : ''}`}
        aria-label="Acesso ao SimioLab"
      >

        {/* O MACACO VIAJANTE */}

        <div
          className={`transition-simio ${
            mode === 'register' ? 'to-right' : 'to-left'
          }`}
          aria-hidden="true"
        >
          <img src={simio} alt="Simio" />
        </div>

        <div
          className={`form-box login-form ${
            mode === 'login' ? 'active-form' : ''
          }`}
          aria-hidden={mode !== 'login'}
          inert={mode !== 'login'}
        >

          <form onSubmit={handleLogin} noValidate>

            <p className="form-eyebrow stagger-1">
              BEM-VINDO DE VOLTA
            </p>

            <h1 className="stagger-2">
              Entrar
            </h1>

            <p className="form-intro stagger-3">
              Continue explorando sua trilha de aprendizagem.
            </p>

            <div className="auth-field stagger-4">

              <label htmlFor="login-user">
                E-mail ou usuário
              </label>

              <input
                id="login-user"
                type="text"
                autoComplete="username"
                placeholder="nome@exemplo.com"
                value={loginData.user}
                onChange={(event) =>
                  setLoginData({
                    ...loginData,
                    user: event.target.value,
                  })
                }
                aria-invalid={loginMessage.type === 'error'}
              />

            </div>

            <div className="stagger-5">

              <PasswordField
                id="login-password"
                label="Senha"
                value={loginData.password}
                onChange={(event) =>
                  setLoginData({
                    ...loginData,
                    password: event.target.value,
                  })
                }
                invalid={loginMessage.type === 'error'}
              />

            </div>

            <button
              type="button"
              className="forgot-button stagger-6"
              onClick={() => setRecoverOpen(true)}
            >
              Esqueci minha senha
            </button>

            {loginMessage.text && (
              <p
                className={`form-message ${loginMessage.type} stagger-6`}
                role="status"
              >
                {loginMessage.text}
              </p>
            )}

              <button
                type="submit"
                className="primary-button stagger-7"
                disabled={loginLoading}
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>

            <p className="mobile-switch stagger-8">
              Ainda não tem uma conta?{' '}

              <button
                type="button"
                onClick={() => changeMode('register')}
              >
                Cadastre-se
              </button>
            </p>

          </form>

        </div>

        {/* =========================
            CADASTRO
        ========================= */}

        <div
          className={`form-box register-form ${
            mode === 'register' ? 'active-form' : ''
          }`}
          aria-hidden={mode !== 'register'}
          inert={mode !== 'register'}
        >

          <form onSubmit={handleRegister} noValidate>

            <p className="form-eyebrow stagger-1">
              COMECE SUA JORNADA
            </p>

            <h1 className="stagger-2">
              Criar conta
            </h1>

            <p className="form-intro stagger-3">
              Prepare-se para aprender explorando.
            </p>

            <div className="register-grid stagger-4">

              {/* Nome de exibição */}

              <div className="auth-field">

                <label htmlFor="register-display-name">
                  Nome de exibição
                </label>

                <input
                  id="register-display-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Como você quer ser chamado?"
                  value={registerData.displayName}
                  onChange={(event) =>
                    setRegisterData({
                      ...registerData,
                      displayName: event.target.value,
                    })
                  }
                  aria-invalid={registerMessage.type === 'error'}
                />

              </div>

              {/* Nome de usuário */}

              <div className="auth-field">

                <label htmlFor="register-username">
                  Nome de usuário
                </label>

                <input
                  id="register-username"
                  type="text"
                  autoComplete="username"
                  placeholder="@seuusuario"
                  value={registerData.username}
                  onChange={(event) =>
                    setRegisterData({
                      ...registerData,
                      username: event.target.value,
                    })
                  }
                  aria-invalid={registerMessage.type === 'error'}
                />

              </div>

              {/* E-mail */}

              <div className="auth-field full-field">

                <label htmlFor="register-email">
                  E-mail
                </label>

                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nome@exemplo.com"
                  value={registerData.email}
                  onChange={(event) =>
                    setRegisterData({
                      ...registerData,
                      email: event.target.value,
                    })
                  }
                  aria-invalid={registerMessage.type === 'error'}
                />

              </div>

              {/* Senha */}

              <PasswordField
                id="register-password"
                label="Senha"
                value={registerData.password}
                onChange={(event) =>
                  setRegisterData({
                    ...registerData,
                    password: event.target.value,
                  })
                }
                invalid={registerMessage.type === 'error'}
              />

              {/* Confirmar senha */}

              <PasswordField
                id="register-confirm"
                label="Confirmar senha"
                value={registerData.confirmPassword}
                onChange={(event) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: event.target.value,
                  })
                }
                invalid={registerMessage.type === 'error'}
              />

            </div>

            {registerMessage.text && !verificationOpen && (
              <p
                className={`form-message ${registerMessage.type} stagger-5`}
                role="status"
              >
                {registerMessage.text}
              </p>
            )}

            <button
              type="submit"
              className="primary-button stagger-6"
              disabled={registerLoading}
            >
              {registerLoading
                ? 'Enviando código para seu e-mail...'
                : 'Criar minha conta'}
            </button>

            <p className="mobile-switch stagger-7">
              Já possui uma conta?{' '}

              <button
                type="button"
                onClick={() => changeMode('login')}
                disabled={registerLoading}
              >
                Entrar
              </button>
            </p>

          </form>

        </div>

        <div className="toggle-box">

          <div className="toggle-panel toggle-left">

            <div className="brand-lockup">
              <span>
                Simio<strong>LAB</strong>
              </span>
            </div>

            <p className="panel-kicker">
              APRENDER É EXPLORAR
            </p>

            <h2>
              Olá, explorador!
            </h2>

            <p>
              Crie sua conta e comece uma jornada cheia de descobertas.
            </p>

            <button
              type="button"
              onClick={() => changeMode('register')}
              tabIndex={mode === 'login' ? 0 : -1}
            >
              Criar conta
            </button>

          </div>

          <div className="toggle-panel toggle-right">

            <div className="brand-lockup">
              <span>
                Simio<strong>LAB</strong>
              </span>
            </div>

            <p className="panel-kicker">
              QUE BOM TER VOCÊ AQUI
            </p>

            <h2>
              Bem-vindo de volta!
            </h2>

            <p>
              Sua próxima descoberta está esperando por você na floresta.
            </p>

            <button
              type="button"
              onClick={() => changeMode('login')}
              tabIndex={mode === 'register' ? 0 : -1}
            >
              Entrar
            </button>

          </div>

        </div>

      </section>

      {recoverOpen && (

        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && closeRecover()
          }
        >

          <section
            className={`recover-modal ${
              isShaking ? 'is-shaking' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recover-title"
          >

            <button
              type="button"
              className="modal-close"
              onClick={closeRecover}
              aria-label="Fechar"
            >
              ×
            </button>

            {recoverSent ? (

              <div className="recover-success animate-success">

                <div
                  className="modal-icon success-icon"
                  aria-hidden="true"
                >
                  ✔
                </div>

                <h2 id="recover-title">
                  Tudo certo!
                </h2>

                <p>
                  Simulamos o envio do seu mapa de acesso para:
                </p>

                <strong>
                  {recoverEmail}
                </strong>

                <button
                  type="button"
                  className="primary-button"
                  onClick={closeRecover}
                >
                  Entendi, vamos lá!
                </button>

              </div>

            ) : (

              <form
                onSubmit={handleRecover}
                noValidate
                className="animate-fade-up"
              >

                <div
                  className="modal-icon"
                  aria-hidden="true"
                >
                  ✦
                </div>

                <h2 id="recover-title">
                  Recuperar senha
                </h2>

                <p>
                  Esqueceu o caminho? Informe seu e-mail para receber
                  as instruções.
                </p>

                <div className="auth-field">

                  <label htmlFor="recover-email">
                    E-mail
                  </label>

                  <input
                    id="recover-email"
                    type="email"
                    autoFocus
                    placeholder="nome@exemplo.com"
                    value={recoverEmail}
                    onChange={(event) =>
                      setRecoverEmail(event.target.value)
                    }
                  />

                </div>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Enviar instruções
                </button>

              </form>

            )}

          </section>

        </div>

      )}

      {verificationOpen && (

        <div
          className="modal-backdrop"
          role="presentation"
        >

          <section
            className={`recover-modal ${
              isShaking ? 'is-shaking' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-title"
          >

            <button
              type="button"
              className="modal-close"
              onClick={() => {
                setVerificationOpen(false)
                setVerificationCode('')
              }}
              aria-label="Fechar"
            >
              ×
            </button>

            <div
              className="modal-icon"
              aria-hidden="true"
            >
              ✉
            </div>

            <h2 id="verification-title">
              Verifique seu e-mail
            </h2>

            <p>
              Enviamos um código de 6 dígitos para:
            </p>

            <strong>
              {registerData.email}
            </strong>

            <form
              onSubmit={handleVerification}
              noValidate
              className="animate-fade-up"
            >

              <div className="auth-field">

                <label htmlFor="verification-code">
                  Código de verificação
                </label>

                <input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(event) => {
                    const valor = event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)

                    setVerificationCode(valor)
                  }}
                />

              </div>

              {registerMessage.text && (
                <p
                  className={`form-message ${registerMessage.type}`}
                  role="status"
                >
                  {registerMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="primary-button"
              >
                Verificar e criar conta
              </button>

              <button
                type="button"
                className="forgot-button"
                onClick={() => {
                  setVerificationOpen(false)
                  setVerificationCode('')
                }}
              >
                Voltar
              </button>

            </form>

          </section>

        </div>

      )}

    </>
  )
}

export default Login
