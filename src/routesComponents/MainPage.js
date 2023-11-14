import React, {useEffect, useState} from 'react';
import MainPageToolbar from "../components/MainPageToolbar";
import ProfilePage from "./ProfilePage";
import AllUsersPage from "./AllUsersPage";
import PostsPage from "./PostsPage";
import MessagesPage from "./MessagesPage";
import {useSelector} from "react-redux";
import {setUser} from "../redux/userSlice";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

const MainPage = () => {
    const [selectedButton, setSelectedButton] = useState(null)
    const user = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const changeBetweenTabs = () => {
        switch (selectedButton) {
            case 'Profile':
                return <ProfilePage/>
            case 'Messages':
                return <MessagesPage/>
            case 'Posts':
                return <PostsPage/>
            case 'Users':
                return <AllUsersPage/>
            default:
                return <ProfilePage/>
        }
    }


    function getAuthToken() {
        const token = localStorage.getItem('token')
        const autoLogin = localStorage.getItem('autoLogin')
        if (token && autoLogin && !user.value?.username) {
            return `Bearer ${token}`
        }
        return ""
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        const autoLogin = localStorage.getItem('autoLogin')
        if (token && autoLogin && !user.value?.username) {
            fetch('http://localhost:8000/user/user-profile', {
                method: 'GET',
                headers: {
                    'Authorization': getAuthToken(),
                    'Content-Type': 'application/json',
                },
            })

                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        dispatch(setUser(data.user))
                    } else {
                        navigate('/login')
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
        } else if (!user.value?.username && !autoLogin) {
            navigate('/login')
        }
    }, [])


    return (
        <div className="mainPage VH100Width100 d-flex flex-Column a-center j-center flex-Column">

            <div className="mainPageHeader d-flex flex1 VH100Width100 a-center j-SpaceAround">
                <MainPageToolbar setSelectedButton={setSelectedButton}/>
            </div>

            <div className="d-flex flex7 VH100Width100 overflowAuto">
                {changeBetweenTabs()}
            </div>

        </div>
    )
}

export default MainPage;
