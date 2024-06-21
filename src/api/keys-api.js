import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

function convertToUTC(localDatetime) {
    const localDate = new Date(localDatetime);
    return new Date(
        localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getUTCDate(),
        localDate.getUTCHours(),
        localDate.getUTCMinutes(),
        localDate.getUTCSeconds()
    ).toISOString();
}

async function fetchKeys(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0.api}/keys`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });

    return response.data;
}

async function generateKey(token, keyName, expiration) {
    const response = await axios.post(`${feralAuthenticationServiceUrl.v0.api}/keys/generate`, {
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