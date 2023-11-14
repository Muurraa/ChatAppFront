import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useNavigate} from "react-router-dom";

const MessagesPage = () => {
    const user = useSelector((state) => state.user)
    const [usersWithConversations, setUsersWithConversations] = useState([])
    const [conversationMessages, setConversationMessages] = useState([])
    const [receiver, setReceiver] = useState(null)
    const [message, setMessage] = useState('')
    const [messageSendingInfo, setMessageSendingInfo] = useState("")
    const [refreshChatAfterMessage, setRefreshChatAfterMessage] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const authToken = getAuthToken()
        if (!authToken) {
            navigate('/login')
            return
        }

        fetch(`http://localhost:8000/api/user-conversations?username=${user.value.username}`, {
            method: 'GET',
            headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    const conversationUsers = data.conversations.map((conversation) => {
                        const userSender = conversation.users.find((u) => u.name !== user.value.username)
                        return {
                            user: userSender,
                            messages: conversation.messages,
                        }
                    })

                    if (receiver?.name) {
                        const updatedConversation = conversationUsers.find((conversation) => conversation.user.name === receiver.name)
                        setChatWithUser(updatedConversation.messages, updatedConversation.user)
                    }

                    setUsersWithConversations(conversationUsers)
                }
            })
            .catch((error) => {
                console.error('Failed to fetch users with conversations:', error)
            })
    }, [user.value, refreshChatAfterMessage])

    function getAuthToken() {
        const token = localStorage.getItem('token')
        if (token) {
            return `Bearer ${token}`
        }
        return ''
    }

    function setChatWithUser(chat, receiver) {
        setConversationMessages(chat)
        setReceiver(receiver)
    }

    const resetOnChangeChat = () => {
        setMessageSendingInfo('')
        setMessage('')
    }

    const handleSendMessage = async () => {
        setRefreshChatAfterMessage(true)
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
                            name: receiver.name,
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
            setRefreshChatAfterMessage(false)
        }
    }

    return (
        <>

            <div className="peopleToChatWithTab d-flex flex3 m10 flex-Column a-center textCenter gap10">
                {usersWithConversations.map((conversation, id) => (
                    <div
                        className="personsChatTab d-flex a-center j-center border1"
                        onClick={() => {
                            setChatWithUser(conversation.messages, conversation.user)
                            resetOnChangeChat()
                        }}
                        key={id}
                    >
                        <div>
                            <img src={conversation.user.userPicture} alt=""/>
                            <p>{conversation.user.name}</p>
                        </div>
                    </div>
                ))}
            </div>


            <div className="conversationTab d-flex flex7 flex-Column m10">

                <div className="messageList d-flex flex-Column flex9 overflowAuto">

                    {conversationMessages?.map((message, id) => (
                        <div
                            className={message.sender === user.value.username ? "messageSentByYou" : "messageSentByOtherUser"}
                            key={id}>
                            <p className="fontBold">{message.sender === user.value.username ? "You:" : message.sender}</p>
                            <p>{message.text}</p>
                        </div>
                    ))}
                </div>

                {conversationMessages?.length > 0 && (
                    <div className="sendMessageTab d-flex flex1 m10 gap10 a-center">
                        <textarea
                            placeholder="Type your message"
                            rows="3"
                            style={{resize: "none"}}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                            className="lightToDarkButton"
                            onClick={handleSendMessage}
                        >Send
                        </button>
                        <p>{messageSendingInfo}</p>
                    </div>
                )}
            </div>


        </>
    )
}

export default MessagesPage;
