// Each store's alert hides after a while. A store keeps one timer, so a new
// alert restarts the clock instead of being hidden early by an older one's
const hideTimers = new WeakMap();

export function showAlert(store, type, message) {
    clearTimeout(hideTimers.get(store));
    store.alertVisible = true;
    store.alertType = type;
    store.alertMessage = message;
    hideTimers.set(store, setTimeout(() => {
        store.alertVisible = false;
    }, 3000));
}

// The service's error bodies all say "Something went wrong!", so the reason
// comes from the status
const reasons = {
    401: 'your session has expired; log in again',
    403: "you don't have permission",
    404: "it wasn't found",
    409: 'it already exists',
};

function reasonFor(status) {
    if (reasons[status]) {
        return reasons[status];
    }
    return status >= 500 ? `the service failed (${status})` : `the service refused it (${status})`;
}

/**
 * What failed, and why, for an alert: "Couldn't add the role: it already
 * exists". `reasonsByStatus` overrides the reason for a status, as a login's
 * 401 means a wrong password rather than an expired session.
 */
export function failureMessage(err, whatFailed, reasonsByStatus = {}) {
    // Some api functions wrap the HTTP client's error in their own
    const httpError = err.isAxiosError ? err : err.cause;

    if (!httpError?.isAxiosError) {
        return whatFailed;
    }
    if (!httpError.response) {
        return `${whatFailed}: the service didn't answer`;
    }
    const { status } = httpError.response;
    return `${whatFailed}: ${reasonsByStatus[status] ?? reasonFor(status)}`;
}
