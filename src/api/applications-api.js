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

export default {
    fetchApplications,
    createApplication,
};