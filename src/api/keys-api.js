import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchKeys(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0.api}/keys`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    console.log(response.data);

    return response.data;
}

async function generateKey(token, keyName, expiration) {
    const response = await axios.post(`${feralAuthenticationServiceUrl.v0.api}/keys`, {
        keyName,
        expiration,
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