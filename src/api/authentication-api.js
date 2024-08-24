import axios from "axios";

import { applicationId, feralAuthenticationServiceUrl } from "@/utils/constants";

async function login(username, password) {
    try {
        const response = await axios.post(`${feralAuthenticationServiceUrl.v0}/login`, {
            username,
            password,
            applicationId,
        });

        return response.data.token;
    } catch (err) {
        console.log('Error:', err);
        throw new Error('Error logging in');
    }
}

async function loginToApplication(token, applicationId) {
    try {
        const response = await axios.get(`${feralAuthenticationServiceUrl.v0}/login/${applicationId}`, {
            headers: {
                'x-feral-auth-token': token,
            },
        });
        return response.data.redirectUrl;
    } catch (err) {
        console.log('Error:', err);
        throw new Error('Error logging in');
    }
}

async function logout(token) {
    await axios.post(`${feralAuthenticationServiceUrl.v0}/logout`, {}, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
}

async function verifyToken(token) {
    try {
        await axios.post(`${feralAuthenticationServiceUrl.v0}/tokens/verify`, {}, {
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
    loginToApplication,
    logout,
    verifyToken,
};
