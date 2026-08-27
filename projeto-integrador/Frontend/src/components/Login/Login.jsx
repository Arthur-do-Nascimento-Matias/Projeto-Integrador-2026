import './login.css'
import { useRef } from 'react';

function Login() {
    
    const refContainer = useRef(null)
    const refRegisterBtn = useRef(null)
    const refLoginBtn = useRef(null)

    refRegisterBtn.current.addEventListener('click', () => {
        refContainer.current.classList.add('active');
    })

    refLoginBtn.current.addEventListener('click', () => {
        refContainer.current.classList.remove('active');
    })

    return(
        <>
          <div className="container" ref={refContainer}>
        <div className="form-box login">
            <form action="#">
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" placeholder="Username" required />
                    <i className='bx bxs-user'></i>
                </div>
                <div className="input-box">
                    <input type="password" placeholder="Password" required />
                    <i class='bx bxs-lock-alt' ></i>
                </div>
                <div className="forgot-link">
                    <a href="#">Forgot Password?</a>
                </div>
                <button type="submit" class="btn">Login</button>
                <p>or login with social platforms</p>
                <div className="social-icons">
                    <a href="#"><i className='bx bxl-google' ></i></a>
                    <a href="#"><i className='bx bxl-facebook' ></i></a>
                    <a href="#"><i className='bx bxl-github' ></i></a>
                    <a href="#"><i className='bx bxl-linkedin' ></i></a>
                </div>
            </form>
        </div>

        <div className="form-box register">
            <form action="#">
                <h1>Registration</h1>
                <div className="input-box">
                    <input type="text" placeholder="Username" required />
                    <i className='bx bxs-user'></i>
                </div>
                <div className="input-box">
                    <input type="email" placeholder="Email" required />
                    <i className='bx bxs-envelope' ></i>
                </div>
                <div className="input-box">
                    <input type="password" placeholder="Password" required />
                    <i className='bx bxs-lock-alt' ></i>
                </div>
                <button type="submit" class="btn">Register</button>
                <p>or register with social platforms</p>
                <div className="social-icons">
                    <a href="#"><i className='bx bxl-google' ></i></a>
                    <a href="#"><i className='bx bxl-facebook' ></i></a>
                    <a href="#"><i className='bx bxl-github' ></i></a>
                    <a href="#"><i className='bx bxl-linkedin' ></i></a>
                </div>
            </form>
        </div>

        <div className="toggle-box">
            <div className="toggle-panel toggle-left">
                <h1>Hello, Welcome!</h1>
                <p>Don't have an account?</p>
                <button className="btn register-btn" ref={refRegisterBtn}>Register</button>
            </div>

            <div className="toggle-panel toggle-right">
                <h1>Welcome Back!</h1>
                <p>Already have an account?</p>
                <button className="btn login-btn" ref={loginBtn}>Login</button>
            </div>
        </div>
    </div>
    </>
    )
}

export default Login
