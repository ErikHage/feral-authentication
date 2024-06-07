import { defineStore } from 'pinia';

import loginApi from '../api/login-api';

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
        async logout(){
            await loginApi.logout(this.token);
            this.token = null;
            localStorage.removeItem('token');
            this.showAppBar = false;
            this.loading = false;
        },
    },
    state: () => {
        return {
            loading: false,
            token: localStorage.getItem('token' || null),
            error: null,
            errorMessage: '',
            showAppBar: localStorage.getItem('token') !== null,
        };
    }
});