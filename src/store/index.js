import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

import authenticationApi from '@/api/authentication-api';
import rolesApi from "@/api/roles-api";

function parseActorToken(token) {
    if (token !== null) {
        // gotta be a better way to do this...
        return JSON.parse(JSON.stringify(jwtDecode(token)));
    }
    return null;
}

function tryToLoadTokenFromStorage() {
    const token = localStorage.getItem('token') || null;

    console.log('loading token from storage: ', token);

    return token;
}

function clearTokenFromStorage() {
    localStorage.removeItem('token');
}

export const useUser = defineStore('user', {
    actions: {
        async authenticate(username, password) {
            try {
                this.loading = true;
                const token = await authenticationApi.login(username, password);
                localStorage.setItem('token', token);
                this.isAuthenticated = true;
                this.showAppBar = true;
                this.error = null;
                this.errorMessage = '';
                this.loading = false;
            } catch (err) {
                this.isAuthenticated = false;
                this.error = err;
                this.errorMessage = err.message;
                this.loading = false;
            }
        },
        async logout() {
            await authenticationApi.logout(tryToLoadTokenFromStorage());
            clearTokenFromStorage();
            this.showAppBar = false;
            this.loading = false;
        },
        async verifyToken() {
            this.isAuthenticated = await authenticationApi.verifyToken(tryToLoadTokenFromStorage());
        },
    },
    state: () => {
        return {
            isAuthenticated: false,
            loading: false,
            error: null,
            errorMessage: '',
            showAppBar: localStorage.getItem('token') !== null,
        };
    },
    getters: {
        actor() {
            const token = tryToLoadTokenFromStorage();

            if (token !== null) {
                return parseActorToken(token);
            }
            return null;
        },
    },
});

export const useRoles = defineStore('role', {
    actions: {
        async fetchRoles() {
            this.roles = await rolesApi.fetchRoles(tryToLoadTokenFromStorage());
            console.log('fetchRoles in store ', this.roles);
        },
    },
    state: () => {
        return {
            roles: [],
        };
    },
});