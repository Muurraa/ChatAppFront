import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useNavigate} from "react-router-dom";

const AllUsersPage = () => {
    const [users, setUsers] = useState([])
    const user = useSelector((state) => state.user)
    const [showMessageInput, setShowMessageInput] = useState(false)
    const [receiver, setReceiver] = useState(null)
    const [message, setMessage] = useState('')
    const [messageSendingInfo, setMessageSendingInfo] = useState("")
    const navigate = useNavigate()


    useEffect(() => {
        const authToken = getAuthToken()
        if (!authToken) {
            navigate('/login')
            return
        }

        fetch('http://localhost:8000/user/all-users', {
            method: 'GET',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    const currentUser = user.value
                    const filteredUsers = data.users.filter((selectedUser) => selectedUser.username !== currentUser.username)
                    setUsers(filteredUsers)
                }
            })
            .catch((error) => {
                console.error('Failed to fetch user data:', error)
            })
    }, [user.value])

    function getAuthToken() {
        const token = localStorage.getItem('token')
        if (token) {
            return `Bearer ${token}`
        }
        return ''
    }

    const handleWriteMessage = (selectedUser) => {
        setReceiver(selectedUser)
        setShowMessageInput(true)
    }

    const handleSendMessage = async () => {
        if (message && receiver) {
            if (message.length < 3 || message.length > 1000) {
                setMessageSendingInfo("message has to be between 3-1000 letters")
                return
            }

            try {
                const authToken = getAuthToken()
                if (!authToken) {
                    return
                }

                const response = await fetch('http://localhost:8000/api/send-message', {
                    method: 'POST',
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sender: {
                            name: user.value.username,
                            userPicture: user.value.userPicture,
                            id: user.value.id
                        },
                        receiver: {
                            name: receiver.username,
                            userPicture: receiver.userPicture,
                            id: receiver.id,
                        },
                        message
                    }),
                })

                const data = await response.json()

                if (data.success) {
                    setMessageSendingInfo("message sent successfully")
                }
            } catch (error) {
                console.error('Failed to send message:', error)
            }
            setMessage('')
        }
    }
    const removeMessageValue = () => {
        setMessageSendingInfo("")
        setMessage("")
    }


    return (
        <div className="usersContainer d-flex flex7">
            {users.map((selectedUser) => (
                <div className="userDiv d-flex m10 gap10" key={selectedUser.username}>
                    <div>
                        <img src={selectedUser.userPicture} alt={selectedUser.username}/>
                    </div>
                    <div className="d-flex flex-Column j-center a-center gap10">
                        <p>{selectedUser.username}</p>
                        <button
                            className="usersWriteMessage lightToDarkButton"
                            onClick={() => handleWriteMessage(selectedUser)}
                        >
                            Write message
                        </button>
                    </div>
                </div>
            ))}
            {showMessageInput && (
                <div className="messageInputOverlay">
                    <div className="messageInputContainer flex-Column">
                        <textarea
                            placeholder="Type your message"
                            rows="5"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className="cursorPointer lightToDarkButton" onClick={handleSendMessage}>Send Message</button>
                        <button className="cursorPointer lightToDarkButton" onClick={() => {
                            removeMessageValue()
                            setShowMessageInput(false)
                        }}>Go back
                        </button>
                        <div className="bgTransparent">
                            {messageSendingInfo && <p className="error-message">{messageSendingInfo}</p>}
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default AllUsersPage;

