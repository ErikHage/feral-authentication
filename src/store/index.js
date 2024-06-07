import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

import loginApi from '../api/login-api';

function parseActorToken(token) {
    // gotta be a better way to do this...
    return JSON.parse(JSON.stringify(jwtDecode(token)));
}

export const useUser = defineStore('user', {
    actions: {
        async authenticate(username, password) {
            try {
                this.loading = true;
                this.token = await loginApi.login(username, password);
                localStorage.setItem('token', this.token);
                this.showAppBar = true;
                this.error = null;
                this.errorMessage = '';
                this.loading = false;
                return true;
            } catch (err) {
                this.error = err;
                this.errorMessage = err.message;
                this.loading = false;
                return false;
            }
        },
        async logout() {
            await loginApi.logout(this.token);
            this.token = null;
            localStorage.removeItem('token');
            this.showAppBar = false;
            this.loading = false;
        },
    },
    state: () => {
        return {
            isAdmin: false,
            loading: false,
            token: localStorage.getItem('token' || null),
            error: null,
            errorMessage: '',
            showAppBar: localStorage.getItem('token') !== null,
        };
    },
    getters: {
        actor(state) {
            if (state.token !== null) {
                return parseActorToken(state.token);
            }
            return null;
        },
    },
});