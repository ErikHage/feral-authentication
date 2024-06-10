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

function setTokenInLocalStorage(token) {
    localStorage.setItem('token', token);
}

function tryToLoadTokenFromStorage() {
    return localStorage.getItem('token') || null;
}

function clearTokenFromStorage() {
    localStorage.removeItem('token');
}

export const useAuthenticationStore = defineStore('authentication', {
    actions: {
        async authenticate(username, password) {
            try {
                this.loading = true;
                const token = await authenticationApi.login(username, password);
                setTokenInLocalStorage(token);
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
            this.isAuthenticated = false;
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
            showAppBar: tryToLoadTokenFromStorage() !== null,
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

export const useRolesStore = defineStore('role', {
    actions: {
        async fetchRoles() {
            try {
                this.roles = await rolesApi.fetchRoles(tryToLoadTokenFromStorage());
                console.log(this.roles);
            } catch (err) {
                console.log(err);
                // some kind of error popup
            }
        },
        async addRole(role) {
            try {
                await rolesApi.addRole(tryToLoadTokenFromStorage(), role);
            } catch (err) {
                console.log(err);
                // some kind of error popup
            }
        },
        async deleteRole(roleId) {
            try {
                await rolesApi.deleteRole(tryToLoadTokenFromStorage(), roleId);
            } catch (err) {
                console.log(err);
                // some kind of error popup
            }
        }
    },
    state: () => {
        return {
            roles: [],
        };
    },
});