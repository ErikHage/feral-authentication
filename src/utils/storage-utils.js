function setTokenInLocalStorage(token) {
    localStorage.setItem('token', token);
}

function tryToLoadTokenFromStorage() {
    return localStorage.getItem('token') || null;
}

function clearTokenFromStorage() {
    localStorage.removeItem('token');
}

export default {
    setTokenInLocalStorage,
    tryToLoadTokenFromStorage,
    clearTokenFromStorage,
};