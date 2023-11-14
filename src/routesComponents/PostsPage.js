import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useNavigate} from "react-router-dom";

const PostsPage = () => {
    const user = useSelector((state) => state.user)

    const [showPostInput, setShowPostInput] = useState(false)
    const [showCreatePost, setShowCreatePost] = useState(false)
    const [showSendMessage, setShowSendMessage] = useState(false)
    const [postTitle, setPostTitle] = useState("")
    const [postImage, setPostImage] = useState("")
    const [showPostCreationMessage, setShowPostCreationMessage] = useState("")
    const [posts, setPosts] = useState([])
    const [selectedPost, setSelectedPost] = useState(null)
    const [commentText, setCommentText] = useState("")
    const [message, setMessage] = useState("")
    const [displayMessage, setDisplayMessage] = useState('')
    const [sortOrder, setSortOrder] = useState('desc')
    const [sortCriteria, setSortCriteria] = useState('time')
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

    const handleUserPostClick = (post) => {
        setSelectedPost(post)
        setShowPostInput(!showPostInput)
    }

    const handleCreatePostClick = () => {
        setShowCreatePost(!showCreatePost)
    }

    const handleWriteMessageClick = () => {
        setShowPostInput(false)
        setMessage("")
        setShowSendMessage(true)
    }

    const checkPostLength = (postTitle) => {
        return postTitle.length >= 3 && postTitle.length <= 30
    }

    const createPost = () => {
        if (checkPostLength(postTitle)) {
            fetch('http://localhost:8000/api/create-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creator: {
                        name: user.value.username,
                        picture: user.value.userPicture,
                    },
                    title: postTitle,
                    image: postImage,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        setShowPostCreationMessage("Post created successfully")
                        setPostTitle("")
                        setPostImage("")
                        fetchPosts()
                    } else {
                        setShowPostCreationMessage("Failed to create the post")
                        setPostTitle("")
                        setPostImage("")
                    }
                })
        } else {
            setShowPostCreationMessage("Post title has to be between 3-30 letters")
        }
    }

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/get-posts')
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setPosts(data.posts)
                } else {
                    console.error('Failed to fetch posts:', data.message)
                }
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error)
        }
    }

    const handleLikeClick = () => {
        if (selectedPost) {
            const {likes} = selectedPost
            const {username} = user.value

            const userIndex = likes.findIndex((like) => like.name === username)
            const isLiked = userIndex === -1

            fetch('http://localhost:8000/api/update-posts-likes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: selectedPost.id,
                    username: username,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        const updatedLikes = isLiked
                            ? [...likes, {name: username}]
                            : likes.filter((like) => like.name !== username)

                        const updatedPost = {...selectedPost, likes: updatedLikes}

                        setSelectedPost(updatedPost)

                        setPosts((prevPosts) =>
                            prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
                        )
                    } else {
                        console.error('Failed to update post likes:', data.message)
                    }
                })
        }
    }

    const createComment = () => {
        if (commentText) {
            fetch('http://localhost:8000/api/create-comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: selectedPost.id,
                    name: user.value.username,
                    comment: commentText,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        const updatedPost = {...selectedPost}
                        updatedPost.comments.push({
                            name: user.value.username,
                            comment: commentText,
                        })
                        setSelectedPost(updatedPost)
                        setCommentText("")
                    } else {
                        console.error('Failed to create a comment:', data.message)
                    }
                })
        }
    }

    const handleSendPostMessage = async () => {
        if (message.length >= 3 && message.length <= 1000) {
            if (message && selectedPost) {
                const sender = user.value
                const receiver = selectedPost.creator

                if (!sender || !receiver) {
                    setDisplayMessage('Invalid sender or receiver information')
                    return
                }

                try {
                    const response = await fetch('http://localhost:8000/api/send-message', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'YOUR_AUTH_TOKEN',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sender: {
                                name: user.value.username,
                                userPicture: user.value.userPicture,
                                id: user.value.id,
                            },
                            receiver: {
                                name: receiver.name,
                                userPicture: receiver.picture,
                                id: receiver.id,
                            },
                            message,
                        }),
                    })

                    const data = await response.json()

                    if (data.success) {
                    } else {
                        setDisplayMessage('Failed to send message: ' + data.message)
                    }
                } catch (error) {
                    setDisplayMessage('Failed to send message: ' + error.message)
                }
                setMessage('')
                setShowSendMessage(false)
            } else {
                setDisplayMessage('Invalid sender or receiver information')
            }
        } else {
            setDisplayMessage('Message has to be between 3-1000 letters')
        }
    }

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    }
    const handleSortClick = (criteria) => {
        if (criteria === sortCriteria) {
            toggleSortOrder()
        } else {
            setSortCriteria(criteria)
            setSortOrder('desc')
        }
    }
    const handleSortIcons = (criteria) => {
        return criteria === sortCriteria ? (sortOrder === 'asc' ? '🡻' : '🡹') : ''
    }
    const sortPosts = (posts) => {
        return posts.slice().sort((post1, post2) => {
            switch (sortCriteria) {
                case 'comments':
                    return sortOrder === 'asc'
                        ? post1.comments.length - post2.comments.length
                        : post2.comments.length - post1.comments.length
                case 'likes':
                    return sortOrder === 'asc'
                        ? post1.likes.length - post2.likes.length
                        : post2.likes.length - post1.likes.length
                case 'time':
                    const date1 = new Date(post1.date)
                    const date2 = new Date(post2.date)

                    if (sortOrder === 'asc') {
                        return date1 - date2
                    } else {
                        return date2 - date1
                    }
                default:
                    return 0
            }
        })
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    return (
        <>
            <div className="div d-flex flex-Column heightWidth100">

                <div className="postsHeader">
                    <div className="postsSortDiv d-flex a-center">
                        <div className="postsSorting d-flex pad10 gap10">
                            <p>Sort by: </p>
                            <button className="cursorPointer lightToDarkButton"
                                    onClick={() => handleSortClick('likes')}>
                                Likes amount <span>{handleSortIcons('likes')}</span>
                            </button>
                            <button className="cursorPointer lightToDarkButton"
                                    onClick={() => handleSortClick('comments')}>
                                Comments amount <span>{handleSortIcons('comments')}</span>
                            </button>
                            <button className="cursorPointer lightToDarkButton" onClick={() => handleSortClick('time')}>
                                Time created <span>{handleSortIcons('time')}</span>
                            </button>

                        </div>
                        <button className="cursorPointer borderNone lightToDarkButton "
                                onClick={handleCreatePostClick}>Create Post
                        </button>
                    </div>
                </div>

                {showCreatePost && (
                    <div className="messageInputOverlay">
                        <div className="postInputContainer flex-Column">
                            <input
                                type="text"
                                placeholder="title value"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="image value"
                                value={postImage}
                                onChange={(e) => setPostImage(e.target.value)}
                            />
                            <button
                                className="cursorPointer lightToDarkButton"
                                onClick={createPost}
                            >Create post
                            </button>
                            <button className="cursorPointer lightToDarkButton" onClick={() => {
                                setShowCreatePost(false)
                                setShowPostCreationMessage("")
                                setPostTitle("")
                                setPostImage("")
                            }}>Go back
                            </button>
                            {showPostCreationMessage && <p className="error-message">{showPostCreationMessage}</p>}
                        </div>
                    </div>
                )}

                <div className="div d-flex heightWidth100 flexWrap">
                    {sortPosts(posts).map((post) => {
                        return (
                            <div className="usersPost m10" onClick={() => handleUserPostClick(post)} key={post.id}>
                                <img src={post.image} alt=""/>
                                <p>{post.title}</p>
                                <p>Likes: <span>{post.likes.length}</span></p>
                                <p>Comments: <span>{post.comments.length}</span></p>
                            </div>
                        )
                    })}
                </div>

                {showPostInput && selectedPost && (
                    <div className="postInputOverlay">
                        <div className="clickedPostContainer">
                            <div className="postDiv d-flex a-center align-end heightWidth100">
                                <div className="d-flex flex1 j-flexEnd heightWidth100">
                                    <img
                                        className="postedImage borderWhite2"
                                        src={selectedPost.image}
                                        alt=""
                                    />
                                </div>
                                <div className="d-flex flex1 flex-Column align-flexStart heightWidth100">
                                    <div className="postOwnerDiv d-flex flex1 heightWidth100">
                                        <div className="d-flex flex1">
                                            <img className="postOwnerPictureInPost m10 borderWhite2"
                                                 src={selectedPost.creator.picture}
                                                 alt=""/>
                                        </div>
                                        <div className="d-flex flex3 flex-Column">
                                            <p className="textWhite fontBold">{selectedPost.creator.name}</p>
                                            {selectedPost.creator.name !== user.value.username && (
                                                <button className="cursorPointer lightToDarkButton"
                                                        onClick={handleWriteMessageClick}>
                                                    Write message
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="d-flex  flex-Column  heightWidth100">
                                        <p className="textWhite">{selectedPost.title}</p>
                                        <div className="d-flex a-center mLeft10">
                                            <button onClick={handleLikeClick}
                                                    className="postLikeButton cursorPointer lightToDarkButton">
                                                {selectedPost.likes.some((like) => like.name === user.value.username) ? 'Unlike' : 'Like'}
                                            </button>
                                            <p className="textWhite ">Likes: <span>{selectedPost.likes.length}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="postAdjust d-flex heightWidth100 a-center j-center align-flexStart padBotTop10 pad10">
                                <div className="messageInputContainer">
                                      <textarea
                                          placeholder="Type your comment"
                                          value={commentText}
                                          onChange={(e) => setCommentText(e.target.value)}
                                      />
                                    <button className="cursorPointer lightToDarkButton" onClick={createComment}>
                                        Send Comment
                                    </button>
                                    <button className="cursorPointer lightToDarkButton"
                                            onClick={() => setShowPostInput(false)}>
                                        Go back
                                    </button>
                                </div>
                            </div>


                            <div className="postAdjust d-flex flex-Column heightWidth100 a-center">
                                <div className="postCommentList">
                                    {selectedPost.comments.map((comment, index) => (
                                        <div className="postComment m5" key={index}>
                                            <p className="textWhite fontBold pBot0">{comment.name}:</p>
                                            <p className="textWhite">{comment.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showSendMessage && (
                    <div className="messageInputOverlay">
                        <div className="messageInputContainer flex-Column">
                            <textarea
                                placeholder="Type your message"
                                rows="5"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button className="cursorPointer lightToDarkButton" onClick={handleSendPostMessage}>Send
                                Message
                            </button>
                            <button className="cursorPointer lightToDarkButton" onClick={() => {
                                setShowSendMessage(false)
                                setDisplayMessage("")
                            }}>Go back
                            </button>
                            <div className="bgTransparent">
                                {displayMessage && <p className="error-message">{displayMessage}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </>
    )
}

export default PostsPage;
