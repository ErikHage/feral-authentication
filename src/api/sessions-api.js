import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchSessionsForCurrentUser(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0}/sessions/current`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    return response.data;
}

async function deleteSessionById(token, sessionId) {
    await axios.delete(`${feralAuthenticationServiceUrl.v0}/sessions/${sessionId}`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
}

export default {
    fetchSessionsForCurrentUser,
    deleteSessionById,
};