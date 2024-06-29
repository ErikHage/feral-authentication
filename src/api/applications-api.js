import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchApplications(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0.api}/applications`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });

    return response.data;
}

async function createApplication(token, application) {
    const response = await axios.post(`${feralAuthenticationServiceUrl.v0.api}/applications`, application, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    return response.data;
}

async function rotateAuthenticationKey(token, applicationId, newKeyId) {
    await axios.post(`${feralAuthenticationServiceUrl.v0.api}/applications/${applicationId}/rotate-key`, {
        newKeyId,
    }, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
}

async function fetchApplicationsForUser(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0.api}/users/current/applications`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });

    return response.data;
}

export default {
    fetchApplications,
    createApplication,
    rotateAuthenticationKey,

    fetchApplicationsForUser,
};
