import LoginScreen from '../components/Login/Login'

function Login({ draft, setDraft, mode, setMode }) {
  return (
    <>

      <LoginScreen 
        draft={draft}
        setDraft={setDraft}
        mode={mode}
        setMode={setMode}
      />

    </>
)
}

export default Login
