const tokenKey = 'feral-token';

function setTokenInLocalStorage(token) {
    localStorage.setItem(tokenKey, token);
}

function tryToLoadTokenFromStorage() {
    return localStorage.getItem(tokenKey) || null;
}

function clearTokenFromStorage() {
    localStorage.removeItem(tokenKey);
}

export default {
    setTokenInLocalStorage,
    tryToLoadTokenFromStorage,
    clearTokenFromStorage,
};