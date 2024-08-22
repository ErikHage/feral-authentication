import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchRoles(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0}/roles`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    return response.data;
}

async function addRole(token, role) {
    const response = await axios.post(`${feralAuthenticationServiceUrl.v0}/roles`,
        {
            ...role,
        },
        {
            headers: {
                'x-feral-auth-token': token,
            },
        },
    );
    return response.data;
}

async function deleteRole(token, roleId) {
    await axios.delete(`${feralAuthenticationServiceUrl.v0}/roles/${roleId}`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
}

export default {
    fetchRoles,
    addRole,
    deleteRole,
};