import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function login(username, password) {
    try {
        const response = await axios.post(`${feralAuthenticationServiceUrl.v0.auth}/login`, {
            username,
            password,
            // TODO how to handle this? some kind of user-applications table?
            applicationId: 'e3304693-9a9f-48a0-ad03-f45bb3b73884',
        });

        return response.data.token;
    } catch (err) {
        console.log('Error:', err);
        throw new Error('Error logging in');
    }
}

async function logout(token) {
    await axios.post(`${feralAuthenticationServiceUrl.v0.auth}/logout`, {}, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
}

async function verifyToken(token) {
    try {
        await axios.post(`${feralAuthenticationServiceUrl.v0.auth}/tokens/verify`, {}, {
            headers: {
                'x-feral-auth-token': token,
            },
        });
    } catch (err) {
        console.log('token is invalid');
        return false;
    }

    return true;
}

export default {
    login,
    logout,
    verifyToken,
};