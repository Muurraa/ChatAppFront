import {createSlice} from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {value:null},
    reducers: {
        setUser: (state, action) =>{
            state.value = action.payload
        },
        setUserPicture: (state, action) =>{
            state.value.userPicture = action.payload
        },
        unsetUser: (state) =>{
            state.value = null
        }
    },

})

export const {
    setUser,
    setUserPicture,
} = userSlice.actions
export default userSlice.reducer