import axios from "axios";

async function login(username, password) {
    try {
        const response = await axios.post('http://localhost:8003/v0/auth/login', {
            username,
            password,
        });

        // todo handle cookie or token
    } catch (err) {
        console.log('Error:', err);
        throw new Error('Error logging in');
    }
}

export default {
    login,
};