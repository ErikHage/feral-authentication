import { defineStore } from 'pinia';

import authenticationApi from '@/api/authentication-api';
import rolesApi from "@/api/roles-api";

import storageUtils from "@/utils/storage-utils";
import jwtUtils from "@/utils/jwt-utils";

export const useAuthenticationStore = defineStore('authentication', {
    actions: {
        async authenticate(username, password) {
            try {
                this.loading = true;
                const token = await authenticationApi.login(username, password);
                storageUtils.setTokenInLocalStorage(token);
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
            await authenticationApi.logout(storageUtils.tryToLoadTokenFromStorage());
            storageUtils.clearTokenFromStorage();
            this.showAppBar = false;
            this.loading = false;
            this.isAuthenticated = false;
        },
        async verifyToken() {
            this.isAuthenticated = await authenticationApi.verifyToken(storageUtils.tryToLoadTokenFromStorage());
        },
    },
    state: () => {
        return {
            isAuthenticated: false,
            loading: false,
            error: null,
            errorMessage: '',
            showAppBar: storageUtils.tryToLoadTokenFromStorage() !== null,
        };
    },
    getters: {
        actor() {
            const token = storageUtils.tryToLoadTokenFromStorage();

            if (token !== null) {
                return jwtUtils.parseActorToken(token);
            }
            return null;
        },
    },
});

export const useRolesStore = defineStore('role', {
    actions: {
        async fetchRoles() {
            try {
                this.roles = await rolesApi.fetchRoles(storageUtils.tryToLoadTokenFromStorage());
                console.log(this.roles);
            } catch (err) {
                console.log(err);
                // some kind of error popup
            }
        },
        async addRole(role) {
            try {
                await rolesApi.addRole(storageUtils.tryToLoadTokenFromStorage(), role);
            } catch (err) {
                console.log(err);
                // some kind of error popup
            }
        },
        async deleteRole(roleId) {
            try {
                await rolesApi.deleteRole(storageUtils.tryToLoadTokenFromStorage(), roleId);
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

export const useUsersStore = defineStore('users', {
    actions: {
        async fetchRoles() {
            try {
                this.users = await rolesApi.fetchRoles(storageUtils.tryToLoadTokenFromStorage());
                console.log(this.users);
            } catch (err) {
                console.log(err);
                // some kind of error popup
            }
        },
    },
    state: () => {
        return {
            users: [],
        };
    }
});