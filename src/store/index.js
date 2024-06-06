import { defineStore } from "pinia";

import loginApi from '../api/login-api';

export const useUser = defineStore('user', {
    actions: {
        async authenticate(username, password) {
            try {
                this.token = await loginApi.login(username, password);
                this.showAppBar = true;
                this.alert = {
                    type: 'success',
                    message: 'Login Successful!',
                };
            } catch (err) {
                this.alert = {
                    type: 'error',
                    message: err.message,
                };
            }
        },
        async logout(){
            await loginApi.logout(this.token);
            this.token = null;
            this.showAppBar = false;
        },
    },
    state: () => {
        return {
            token: null,
            alert: null,
            showAppBar: false,
        };
    }
});