import { applicationId, authServiceUrl } from '../setup/config';

/**
 * The only place the suite calls `fetch`: feral-authentication-service
 * itself, and the app's address for the preflight. The browser makes the
 * app's own calls; this is for the preflight, and for cleaning up what a
 * test created.
 *
 * Every call has a short timeout, so a request the service never answers
 * can't hang a run. Nothing here throws or asserts: each call resolves to
 * `{ status, body }`, or `{ error }` when no reply came, and the caller
 * decides what that means.
 */

const requestTimeoutMs = 5_000;

async function call(method, path, { token, body } = {}) {
    try {
        const response = await fetch(`${authServiceUrl}${path}`, {
            method,
            headers: {
                ...(body === undefined ? {} : { 'content-type': 'application/json' }),
                ...(token === undefined ? {} : { 'x-feral-auth-token': token }),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: AbortSignal.timeout(requestTimeoutMs),
        });
        const text = await response.text();
        let parsed = text;
        try {
            parsed = JSON.parse(text);
        } catch {
            // not JSON; keep the text
        }
        return { status: response.status, body: parsed };
    } catch (err) {
        return { error: err.cause?.code || err.name || err.message };
    }
}

/** Any reply means the service is up: without a token, this answers 401. */
export const ping = () => call('POST', '/tokens/verify');

/** Logs in to the app's own application; `body.token` on success. */
export const login = (username, password) => call('POST', '/login', {
    body: { username, password, applicationId },
});

/** Ends the session behind `token`, so cleanup leaves none behind. */
export const logout = token => call('POST', '/logout', { token });

export const listUsers = token => call('GET', '/users', { token });

export const deleteUser = (token, userId) => call('DELETE', `/users/${userId}`, { token });

export const clearUserRoles = (token, userId) => call('DELETE', `/users/${userId}/roles`, { token });

export const clearUserApplications = (token, userId) => call('DELETE', `/users/${userId}/applications`, { token });

export const listRoles = token => call('GET', '/roles', { token });

export const deleteRole = (token, roleId) => call('DELETE', `/roles/${roleId}`, { token });

export const listApplications = token => call('GET', '/applications', { token });

/** The app's own address, outside the service; any status. */
export async function probeApp(url) {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutMs) });
        return { status: response.status };
    } catch (err) {
        return { error: err.cause?.code || err.name || err.message };
    }
}
