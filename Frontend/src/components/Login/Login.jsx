import { useState } from 'react'
import './Login.css'
import simio from '../../assets/simio.png'

const emptyRegister = {
  name: '',
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
          autoComplete={id === 'login-password' ? 'current-password' : 'new-password'}
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

function Login() {
  const [mode, setMode] = useState('login')
  const [loginData, setLoginData] = useState({ user: '', password: '' })
  const [registerData, setRegisterData] = useState(emptyRegister)
  const [loginMessage, setLoginMessage] = useState({ type: '', text: '' })
  const [registerMessage, setRegisterMessage] = useState({ type: '', text: '' })
  
  const [recoverOpen, setRecoverOpen] = useState(false)
  const [recoverEmail, setRecoverEmail] = useState('')
  const [recoverSent, setRecoverSent] = useState(false)
  
  // Estado para controlar a microinteração de erro
  const [isShaking, setIsShaking] = useState(false)

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 400)
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setLoginMessage({ type: '', text: '' })
    setRegisterMessage({ type: '', text: '' })
  }

  function handleLogin(event) {
    event.preventDefault()

    if (!loginData.user.trim() || !loginData.password) {
      setLoginMessage({ type: 'error', text: 'Preencha o usuário e a senha.' })
      triggerShake()
      return
    }

    setLoginMessage({ type: 'success', text: 'Tudo certo! A aventura vai começar.' })
  }

  function handleRegister(event) {
    event.preventDefault()

    if (!registerData.name.trim() || !registerData.email.trim() || !registerData.password || !registerData.confirmPassword) {
      setRegisterMessage({ type: 'error', text: 'Preencha todos os campos para criar sua conta.' })
      triggerShake()
      return
    }

    if (!registerData.email.includes('@')) {
      setRegisterMessage({ type: 'error', text: 'Informe um endereço de e-mail válido.' })
      triggerShake()
      return
    }

    if (registerData.password.length < 6) {
      setRegisterMessage({ type: 'error', text: 'A senha precisa ter pelo menos 6 caracteres.' })
      triggerShake()
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterMessage({ type: 'error', text: 'As senhas não coincidem.' })
      triggerShake()
      return
    }

    setRegisterMessage({ type: 'success', text: 'Sua mochila está pronta! Conectando...' })
  }

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

      <section className={`auth-container ${mode === 'register' ? 'is-register' : ''} ${isShaking ? 'is-shaking' : ''}`} aria-label="Acesso ao SimioLab">
        
        {/* O MACACO VIAJANTE */}
        <div className={`transition-simio ${mode === 'register' ? 'to-right' : 'to-left'}`} aria-hidden="true">
          <img src={simio} alt="Simio" />
        </div>

        <div className={`form-box login-form ${mode === 'login' ? 'active-form' : ''}`} aria-hidden={mode !== 'login'} inert={mode !== 'login'}>
          <form onSubmit={handleLogin} noValidate>
            <p className="form-eyebrow stagger-1">BEM-VINDO DE VOLTA</p>
            <h1 className="stagger-2">Entrar</h1>
            <p className="form-intro stagger-3">Continue explorando sua trilha de aprendizagem.</p>

            <div className="auth-field stagger-4">
              <label htmlFor="login-user">E-mail ou usuário</label>
              <input
                id="login-user"
                type="text"
                autoComplete="username"
                placeholder="nome@exemplo.com"
                value={loginData.user}
                onChange={(event) => setLoginData({ ...loginData, user: event.target.value })}
                aria-invalid={loginMessage.type === 'error'}
              />
            </div>

            <div className="stagger-5">
              <PasswordField
                id="login-password"
                label="Senha"
                value={loginData.password}
                onChange={(event) => setLoginData({ ...loginData, password: event.target.value })}
                invalid={loginMessage.type === 'error'}
              />
            </div>

            <button type="button" className="forgot-button stagger-6" onClick={() => setRecoverOpen(true)}>Esqueci minha senha</button>
            
            {loginMessage.text && <p className={`form-message ${loginMessage.type} stagger-6`} role="status">{loginMessage.text}</p>}
            
            <button type="submit" className="primary-button stagger-7">Entrar</button>
            <p className="mobile-switch stagger-8">Ainda não tem uma conta? <button type="button" onClick={() => changeMode('register')}>Cadastre-se</button></p>
          </form>
        </div>

        <div className={`form-box register-form ${mode === 'register' ? 'active-form' : ''}`} aria-hidden={mode !== 'register'} inert={mode !== 'register'}>
          <form onSubmit={handleRegister} noValidate>
            <p className="form-eyebrow stagger-1">COMECE SUA JORNADA</p>
            <h1 className="stagger-2">Criar conta</h1>
            <p className="form-intro stagger-3">Prepare-se para aprender explorando.</p>

            <div className="register-grid stagger-4">
              <div className="auth-field full-field">
                <label htmlFor="register-name">Nome</label>
                <input id="register-name" type="text" autoComplete="name" placeholder="Seu nome" value={registerData.name} onChange={(event) => setRegisterData({ ...registerData, name: event.target.value })} aria-invalid={registerMessage.type === 'error'} />
              </div>
              <div className="auth-field full-field">
                <label htmlFor="register-email">E-mail</label>
                <input id="register-email" type="email" autoComplete="email" placeholder="nome@exemplo.com" value={registerData.email} onChange={(event) => setRegisterData({ ...registerData, email: event.target.value })} aria-invalid={registerMessage.type === 'error'} />
              </div>
              <PasswordField id="register-password" label="Senha" value={registerData.password} onChange={(event) => setRegisterData({ ...registerData, password: event.target.value })} invalid={registerMessage.type === 'error'} />
              <PasswordField id="register-confirm" label="Confirmar" value={registerData.confirmPassword} onChange={(event) => setRegisterData({ ...registerData, confirmPassword: event.target.value })} invalid={registerMessage.type === 'error'} />
            </div>

            {registerMessage.text && <p className={`form-message ${registerMessage.type} stagger-5`} role="status">{registerMessage.text}</p>}
            
            <button type="submit" className="primary-button stagger-6">Criar minha conta</button>
            <p className="mobile-switch stagger-7">Já possui uma conta? <button type="button" onClick={() => changeMode('login')}>Entrar</button></p>
          </form>
        </div>

        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            {/* O TEXTO DO LOGO AGORA FICA SOZINHO (A IMAGEM CORRE POR FORA) */}
            <div className="brand-lockup">
              <span>Simio<strong>LAB</strong></span>
            </div>
            <p className="panel-kicker">APRENDER É EXPLORAR</p>
            <h2>Olá, explorador!</h2>
            <p>Crie sua conta e comece uma jornada cheia de descobertas.</p>
            <button type="button" onClick={() => changeMode('register')} tabIndex={mode === 'login' ? 0 : -1}>Criar conta</button>
          </div>

          <div className="toggle-panel toggle-right">
            {/* O TEXTO DO LOGO AGORA FICA SOZINHO (A IMAGEM CORRE POR FORA) */}
            <div className="brand-lockup">
              <span>Simio<strong>LAB</strong></span>
            </div>
            <p className="panel-kicker">QUE BOM TER VOCÊ AQUI</p>
            <h2>Bem-vindo de volta!</h2>
            <p>Sua próxima descoberta está esperando por você na floresta.</p>
            <button type="button" onClick={() => changeMode('login')} tabIndex={mode === 'register' ? 0 : -1}>Entrar</button>
          </div>
        </div>
      </section>

      {recoverOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeRecover()}>
          <section className={`recover-modal ${isShaking ? 'is-shaking' : ''}`} role="dialog" aria-modal="true" aria-labelledby="recover-title">
            <button type="button" className="modal-close" onClick={closeRecover} aria-label="Fechar">×</button>
            
            {recoverSent ? (
              <div className="recover-success animate-success">
                <div className="modal-icon success-icon" aria-hidden="true">✔</div>
                <h2 id="recover-title">Tudo certo!</h2>
                <p>Simulamos o envio do seu mapa de acesso para:</p>
                <strong>{recoverEmail}</strong>
                <button type="button" className="primary-button" onClick={closeRecover}>Entendi, vamos lá!</button>
              </div>
            ) : (
              <form onSubmit={handleRecover} noValidate className="animate-fade-up">
                <div className="modal-icon" aria-hidden="true">✦</div>
                <h2 id="recover-title">Recuperar senha</h2>
                <p>Esqueceu o caminho? Informe seu e-mail para receber as instruções.</p>
                <div className="auth-field">
                  <label htmlFor="recover-email">E-mail</label>
                  <input id="recover-email" type="email" autoFocus placeholder="nome@exemplo.com" value={recoverEmail} onChange={(event) => setRecoverEmail(event.target.value)} />
                </div>
                <button type="submit" className="primary-button">Enviar instruções</button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default Login
