import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchSessionsForCurrentUser(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0.api}/sessions/current`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    return response.data;
}

export default {
    fetchSessionsForCurrentUser,
};