import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchUsers(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0.api}/users`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    console.log('fetchedUsers: ', response.data);
    return response.data;
}

async function upsertUser(token, user) {
    const requestData = {
        userId: user.userId !== '' ? user.userId : undefined,
        username: user.username,
        password: user.password,
    };

    const response = await axios.post(`${feralAuthenticationServiceUrl.v0.api}/users`,
        requestData,
        {
            headers: {
                'x-feral-auth-token': token,
            },
        });
    return response.data;
}

async function deleteUser(token, userId) {
    await axios.delete(`${feralAuthenticationServiceUrl.v0.api}/users/${userId}`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
}

export default {
    fetchUsers,
    upsertUser,
    deleteUser,
};