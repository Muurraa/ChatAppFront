import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password1, setPassword1] = useState('')
    const [password2, setPassword2] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const alreadyHasAccount = () => navigate('/login')

    const registerUser = () => {
        if (username.length < 4 || username.length > 20) {
            setErrorMessage('Username must be between 4 and 20 characters')
            return
        }

        if (password1.length < 4 || password1.length > 20) {
            setErrorMessage('Password must be between 4 and 20 characters')
            return
        }

        if (!/[A-Z]/.test(password1)) {
            setErrorMessage('Password must contain at least one uppercase letter')
            return
        }

        if (password1 !== password2) {
            setErrorMessage('Passwords do not match')
            return
        }

        fetch('http://localhost:8000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password: password1}),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === 'User registered successfully') {
                    navigate('/login')
                } else {
                    setErrorMessage(data.message)
                }
            })
            .catch((error) => {
                console.error(error)
                setErrorMessage('Registration failed. Please try again.')
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

        <div className="registerPage VH100Width100 d-flex flex-Column a-center j-center">
            <p>{errorMessage}</p>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
            />
            <button
                onClick={registerUser}
                className="cursorPointer">
                Register
            </button>
            <p>
                Already a user? <span
                className="cursorPointer textUnderline"
                onClick={alreadyHasAccount}
            > Login
                </span>
            </p>

        </div>
    )
}

export default RegisterPage;
