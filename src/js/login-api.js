import axios from "axios";

async function login(username, password) {
    try {
        const response = await axios.post('http://localhost:8003/v0/auth/login', {
            username,
            password,
        });

        localStorage.setItem('feral-auth-token', response.data.token);
    } catch (err) {
        console.log('Error:', err);
        throw new Error('Error logging in');
    }
}

async function logout() {
    const token = localStorage.getItem('feral-auth-token');

    await axios.post('http://localhost:8003/v0/auth/logout', {}, {
        headers: {
            'x-feral-auth-token': token,
        },
    });
}

export default {
    login,
    logout,
};