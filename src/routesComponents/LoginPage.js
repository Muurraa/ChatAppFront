import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import {setUser} from "../redux/userSlice";

const LoginPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const doesntHaveAccountYet = () => navigate('/')

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const [autoLogin, setAutoLogin] = useState(false)

    const handleCheckboxChange = () => {
        setAutoLogin(!autoLogin)
    }

    const handleLogin = () => {
        fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    localStorage.setItem('token', data.token)
                    dispatch(setUser(data.user))

                    if (autoLogin) {
                        localStorage.setItem('autoLogin', 'true')
                    } else {
                        localStorage.removeItem('autoLogin')
                    }

                    navigate('/main')
                } else {
                    setErrorMessage(data.message)
                }
            })
            .catch((error) => {
                console.error(error)
                setErrorMessage('Login failed. Please try again.')
            })
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        const autoLogin = localStorage.getItem('autoLogin')

        if (token && autoLogin) {
            navigate('/main')
        }
    }, [navigate])

    return (
        <div className="loginPage VH100Width100 d-flex flex-Column a-center j-center">
            <p className="errorMessage">{errorMessage}</p>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <div className="checkbox-container d-flex a-center">
                <input
                    type="checkbox"
                    checked={autoLogin}
                    onChange={handleCheckboxChange}
                />
                <label htmlFor="autoLogin">Auto Login</label>
            </div>
            <button onClick={handleLogin} className="cursorPointer">
                Login
            </button>
            <p>
                Not a user yet? <span
                className="cursorPointer textUnderline"
                onClick={doesntHaveAccountYet}
            >Register</span>
            </p>
        </div>
    )
}

export default LoginPage;