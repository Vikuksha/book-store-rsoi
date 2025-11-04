import {createSlice} from "@reduxjs/toolkit";

// User Slice
const userSlice = createSlice({
    name: 'user',
    initialState: {
        status: false,
        user:{}
    },
    reducers: {
        // Login
        login: (state, action) => {
            let { name, email } = action.payload;
            state.status = true
            state.user = {
                name: name,
                role: 'customer',
                email: email
            }
        },
        // Register
        register: (state, action) => {
            let { name, email } = action.payload;
            state.status = true
            state.user = {
                name: name,
                role: 'customer',
                email: email
            }
        },
        // Logout
        logout: (state) => {
            state.status = false
            state.user = {}
        },
        // Restore user from localStorage
        restoreUser: (state, action) => {
            if (action.payload) {
                state.status = true
                state.user = action.payload
            }
        }
    }
})

const userReducer = userSlice.reducer
export const { login, register, logout, restoreUser } = userSlice.actions
export default userReducer
