import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from "react-redux";
import {setUserPicture} from "../redux/userSlice";
import {useNavigate} from "react-router-dom";

const ProfilePage = () => {
    const [newPictureUrl, setNewPictureUrl] = useState('')
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword1, setNewPassword1] = useState('')
    const [newPassword2, setNewPassword2] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [imageErrorMessage, setImageErrorMessage] = useState('')
    const user = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    function isUserAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    }
    function redirectToLogin() {
        navigate('/login')
    }

    useEffect(() => {
        if (!isUserAuthenticated()) {
            redirectToLogin()
        }

    }, [])
    function getAuthToken() {
        const token = localStorage.getItem('token')
        if (token) {
            return `Bearer ${token}`
        }
        return ''
    }

    const clearPasswordInputs = () => {
        setOldPassword("")
        setNewPassword1("")
        setNewPassword2("")
    }
    const clearImageInput = () => setNewPictureUrl("")


    const changePicture = () => {
        if (!newPictureUrl) {
            setImageErrorMessage('Image URL cannot be empty')
        } else {
            fetch('http://localhost:8000/user/update-user-picture', {
                method: 'PUT',
                headers: {
                    'Authorization': getAuthToken(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({newPictureUrl}),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        clearImageInput()
                        dispatch(setUserPicture(data.newPictureUrl))
                        setImageErrorMessage ('Image changed successfully')
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
        }
    }
    const changePassword = () => {
        if (oldPassword) {
            if (oldPassword.length < 4) {
                setErrorMessage('Old password must be at least 4 characters long')
            } else if (newPassword1.length < 4 || newPassword1.length > 20) {
                setErrorMessage('Password must be between 4 and 20 characters')
            } else if (!/[A-Z]/.test(newPassword1)) {
                setErrorMessage('Password must contain at least one uppercase letter')
            } else if (newPassword1 !== newPassword2) {
                setErrorMessage('Passwords do not match')
            } else {
                setErrorMessage('')
                const token = getAuthToken()
                if (!token) {
                    setErrorMessage('No valid token found')
                } else {
                    fetch('http://localhost:8000/user/update-password', {
                        method: 'PUT',
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({username: user.value?.username, oldPassword, newPassword: newPassword1}),
                    })
                        .then((response) => {
                            if (response.status === 401) {
                                setErrorMessage('Unauthorized request')
                                return response.json()
                            }
                            return response.json()
                        })
                        .then((data) => {
                            if (data.success) {
                                clearPasswordInputs()
                                setErrorMessage('Password changed successfully')
                            } else {
                                setErrorMessage('Password change unsuccessful')
                                console.error('Password change unsuccessful')
                            }
                        })
                        .catch((error) => {
                            console.error('Change password error:', error)
                        })
                }
            }
        } else {
            setErrorMessage('Old password cannot be empty')
        }
    }

    return (
        <>
            <div className="d-flex flex-Column pad10 a-center">
                <img className="profileUserPicture" src={user.value?.userPicture} alt=""/>
                <input
                    className="profilePageInput"
                    type="text"
                    placeholder="enter your new image url"
                    value={newPictureUrl}
                    onChange={(e) => setNewPictureUrl(e.target.value)}
                />
                <button onClick={changePicture} className="changePictureButton lightToDarkButton">
                    Change picture
                </button>
                <p>{imageErrorMessage}</p>
            </div>

            <div className="d-flex flex-Column pad10 a-center width50">
                <p className="mBot10">{user?.value?.username}</p>
                <input
                    className="profilePageInput"
                    type="password"
                    placeholder="enter your old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <input
                    className="profilePageInput"
                    type="password"
                    placeholder="enter your new password"
                    value={newPassword1}
                    onChange={(e) => setNewPassword1(e.target.value)}
                />
                <input
                    className="profilePageInput"
                    type="password"
                    placeholder="repeat your new password"
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                />
                <p>{errorMessage}</p>
                <button onClick={changePassword} className="changePasswordButton lightToDarkButton">
                    Change password
                </button>
            </div>

        </>
    )
}

export default ProfilePage;

