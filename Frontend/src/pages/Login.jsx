import LoginScreen from '../components/Login/Login'

function Login({ draft, setDraft }) {
  return (
    <>

      <LoginScreen 
        draft={draft}
        setDraft={setDraft}
      />

    </>
)
}

export default Login