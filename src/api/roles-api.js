import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/api/constants";

async function fetchRoles(token) {
    try {
        const response = await axios.get(`${feralAuthenticationServiceUrl.v0.api}/roles`, {
            headers: {
                'x-feral-auth-token': token,
            },
        });
        return response.data;
    } catch (err) {
        console.log('Error:', err);
        throw new Error('Error fetching roles');
    }
}

export default {
    fetchRoles,
};