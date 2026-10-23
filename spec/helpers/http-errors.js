// An error as the HTTP client rejects with it: the service answered `status`
export function httpError(status) {
    return Object.assign(new Error(`Request failed with status code ${status}`), {
        isAxiosError: true,
        status,
        response: { status },
    });
}

// An error as the HTTP client rejects with it when the service doesn't answer
export function noAnswer() {
    return Object.assign(new Error('Network Error'), { isAxiosError: true });
}
