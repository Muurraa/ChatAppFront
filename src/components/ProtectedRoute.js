import React from 'react';
import {Navigate,} from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
    const hasToken = !!localStorage.getItem('token')

    if (hasToken) {
        return children
    } else {
        return <Navigate to="/login" />
    }
};

export default ProtectedRoute;
