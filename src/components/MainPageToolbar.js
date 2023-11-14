import React from 'react'
import {useNavigate} from "react-router-dom";

const MainPageToolbar = ({ setSelectedButton }) => {
    const navigate = useNavigate()
    const goBackToLoginPage = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('autoLogin')
        navigate('/login')
    }

    return (
        <>
            <button onClick={() => setSelectedButton('Profile')}>Profile</button>
            <button onClick={() => setSelectedButton('Messages')}>Messages</button>
            <button onClick={() => setSelectedButton('Posts')}>Posts</button>
            <button onClick={() => setSelectedButton('Users')}>Users</button>
            <button onClick={goBackToLoginPage}>Logout</button>
        </>
    )
}

export default MainPageToolbar




