import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import httpStatus from 'http-status';
import server from '../env';

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})


export const AuthProvider = ({ children }) => {

    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);

    

    let handleRegister = async (name, username, password) => {
        try {
            let request = await client.post('/register', { name: name, username: username, password: password });
            if (request.status === httpStatus.CREATED) {
                return { message: request.data.message };
            }
            
        } catch (error) {
            if (error.status === httpStatus.FOUND) {
                error.message = error.response.data.message;
            }
            throw error;
        }
        
    }

    let handleLogin = async (username, password) => {
        try {
            const request = await client.post('/login', { username: username, password: password });
            if (request.status === httpStatus.OK) {
                localStorage.setItem('token', request.data.token);
                return { message: request.data };
            }
            
        } catch (error) {
            throw error;
        }
    }

    let getHistoryOfUser = async() => {
        try {
            let request = await client.get('/get_all_activity', {
                params: {
                    token: localStorage.getItem('token')
                }
            });
            return request.data;
        } catch (error) {
            throw error;
        }
    }

    const addToUserHistory = async(meetingCode) => {
        try{
            let request = await client.post('/add_to_activity', {
                token: localStorage.getItem('token'),
                meetingCode: meetingCode
            });
            return request;
        } catch(error) {
            throw error;
        }
    }

    const data = {
        userData, setUserData, handleRegister, handleLogin, getHistoryOfUser, addToUserHistory
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};