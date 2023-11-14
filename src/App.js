import React from 'react'
import './App.css'
import {Route, Routes} from "react-router-dom";
import RegisterPage from "./routesComponents/RegisterPage";
import LoginPage from "./routesComponents/LoginPage";
import MainPage from "./routesComponents/MainPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<RegisterPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/main" element={
                    <ProtectedRoute>
                        <MainPage/>
                    </ProtectedRoute>
                }/>
            </Routes>
        </div>
    )
}

export default App
