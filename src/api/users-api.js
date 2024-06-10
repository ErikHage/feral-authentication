import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchUsers(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0.api}/users`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    return response.data;
}

export default {
    fetchUsers,
};