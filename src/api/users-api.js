import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchUsers(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0.api}/users`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    console.log('fetchedUsers: ', response.data);

    return response.data.map(user => ({
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        lastLogin: user.lastLogin || '-', // TODO display in local time
        isSuspended: user.isSuspended ? "Y" : "N",
    }));
}

async function upsertUser(token, user) {
    const requestData = {
        userId: user.userId !== '' ? user.userId : undefined,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
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