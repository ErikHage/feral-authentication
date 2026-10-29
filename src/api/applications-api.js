import axios from "axios";

import { feralAuthenticationServiceUrl } from "@/utils/constants";

async function fetchApplications(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0}/applications`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });

    return response.data;
}

async function createApplication(token, application) {
    const response = await axios.post(`${feralAuthenticationServiceUrl.v0}/applications`, application, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    return response.data;
}

// Only the fields an application's details page edits: its key pair changes
// by rotation
async function updateApplication(token, { applicationId, applicationName, applicationUrl, scope }) {
    const response = await axios.put(`${feralAuthenticationServiceUrl.v0}/applications/${applicationId}`, {
        applicationName, applicationUrl, scope,
    }, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
    return response.data;
}

async function rotateAuthenticationKey(token, applicationId, newKeyId) {
    await axios.post(`${feralAuthenticationServiceUrl.v0}/applications/${applicationId}/rotate-key`, {
        newKeyId,
    }, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
}

async function fetchApplicationsForUser(token) {
    const response = await axios.get(`${feralAuthenticationServiceUrl.v0}/users/current/applications`, {
        headers: {
            'x-feral-auth-token': token,
        },
    });

    return response.data;
}

export default {
    fetchApplications,
    createApplication,
    updateApplication,
    rotateAuthenticationKey,

    fetchApplicationsForUser,
};
