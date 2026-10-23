import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

// A datetime-local value (e.g. 2026-12-01T10:00) is local time; the service stores UTC
function convertToUTC(localDatetime) {
    return new Date(localDatetime).toISOString();
}

async function fetchKeys(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0}/keys`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });

    return response.data;
}

async function generateKey(token, keyName, expiration) {
    const response = await axios.post(`${feralAuthenticationServiceUrl.v0}/keys/generate`, {
        keyName,
        expiration: convertToUTC(expiration),
    }, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    return response.data;
}

export default {
    fetchKeys,
    generateKey,
};