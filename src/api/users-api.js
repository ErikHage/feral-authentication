import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchUsers(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0}/users`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });

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

async function addUser(token, user) {
    const requestData = {
        userId: user.userId !== '' ? user.userId : undefined,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        password: user.password,
    };

    const response = await axios.post(`${feralAuthenticationServiceUrl.v0}/users`,
        requestData,
        {
            headers: {
                'x-feral-auth-token': token,
            },
        });
    return response.data;
}

async function updateUser(token, userData) {
    const requestData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
    };

    const response = await axios.put(`${feralAuthenticationServiceUrl.v0}/users/${userData.userId}`,
        requestData,
        {
            headers: {
                'x-feral-auth-token': token,
            },
        });

    return response.data;
}

async function deleteUser(token, userId) {
    await axios.delete(`${feralAuthenticationServiceUrl.v0}/users/${userId}`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
}

async function fetchUserRoles(token, userId) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0}/users/${userId}/roles`,
        {
            headers: {
                'x-feral-auth-token': token,
            },
        });
    console.log('user roles', response.data);
    return response.data;
}

async function setUserRoles(token, userId, roleIds) {
    await axios.post(`${feralAuthenticationServiceUrl.v0}/users/${userId}/roles`,
        {
            roleIds,
        },
        {
            headers: {
                'x-feral-auth-token': token,
            },
        });
}

async function clearUserRoles(token, userId) {
    await axios.delete(`${feralAuthenticationServiceUrl.v0}/users/${userId}/roles`,
        {
            headers: {
                'x-feral-auth-token': token,
            },
        });
}

async function fetchUserApplications(token, userId) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0}/users/${userId}/applications`,
        {
            headers: {
                'x-feral-auth-token': token,
            },
        });
    console.log('user applications', response.data);
    return response.data;
}

async function setUserApplications(token, userId, applicationIds) {
    await axios.post(`${feralAuthenticationServiceUrl.v0}/users/${userId}/applications`,
        {
            applicationIds,
        },
        {
            headers: {
                'x-feral-auth-token': token,
            },
        });
}

async function clearUserApplications(token, userId) {
    await axios.delete(`${feralAuthenticationServiceUrl.v0}/users/${userId}/applications`,
        {
            headers: {
                'x-feral-auth-token': token,
            },
        });
}

export default {
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,

    fetchUserRoles,
    setUserRoles,
    clearUserRoles,

    fetchUserApplications,
    setUserApplications,
    clearUserApplications,
};