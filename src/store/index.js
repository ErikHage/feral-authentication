import { defineStore } from 'pinia';

import authenticationApi from '@/api/authentication-api';
import rolesApi from "@/api/roles-api";

import storageUtils from "@/utils/storage-utils";
import jwtUtils from "@/utils/jwt-utils";
import usersApi from "@/api/users-api";

export const useAuthenticationStore = defineStore('authentication', {
    actions: {
        async authenticate(username, password) {
            try {
                this.loading = true;
                const token = await authenticationApi.login(username, password);
                storageUtils.setTokenInLocalStorage(token);
                this.isAuthenticated = true;
                this.showAppBar = true;
                this.loading = false;
                this.setAlertMessage("success", "Login Succeeded!");
            } catch (err) {
                this.isAuthenticated = false;
                this.loading = false;
                this.setAlertMessage("error", err.message);
            }
        },
        async logout() {
            try {
                await authenticationApi.logout(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                if (err.status === 401) {
                    // token must already be expired, don't worry about it
                } else {
                    // show some error
                }
            }
            storageUtils.clearTokenFromStorage();
            this.showAppBar = false;
            this.loading = false;
            this.isAuthenticated = false;
        },
        async verifyToken() {
            this.isAuthenticated = await authenticationApi.verifyToken(storageUtils.tryToLoadTokenFromStorage());
        },
        setAlertMessage(type, message) {
            this.alertVisible = true;
            this.alertType = type;
            this.alertMessage = message;
            setTimeout(() => {
                this.alertVisible = false;
            }, 3000)
        }
    },
    state: () => {
        return {
            isAuthenticated: false,
            loading: false,
            alertVisible: false,
            alertType: 'success',
            alertMessage: null,
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
                this.loading = true;
                this.roles = await rolesApi.fetchRoles(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                // some kind of error popup
            }
            this.loading = false;
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
            loading: false,
        };
    },
});

export const useUsersStore = defineStore('users', {
    actions: {
        async fetchUsers() {
            try {
                this.loading = true;
                this.users = await usersApi.fetchUsers(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', 'error loading users');
            }
            this.loading = false;
        },
        async addUser(user) {
            try {
                await usersApi.addUser(storageUtils.tryToLoadTokenFromStorage(), user);
                this.setAlertMessage('success', 'User added successfully!');
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', 'error adding user');
            }
        },
        async deleteUser(userId) {
            try {
                await usersApi.deleteUser(storageUtils.tryToLoadTokenFromStorage(), userId);
                this.setAlertMessage('success', 'User deleted successfully.');
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', 'error deleting user');
            }
        },
        async selectUser(userId) {
            console.log('select User', userId);
            const token = storageUtils.tryToLoadTokenFromStorage();
            const userDetails = this.users.find(user => user.userId === userId);
            const userRoles = await usersApi.fetchUserRoles(token, userId);
            const rolesByScope = userRoles.roles.reduce((acc, role) => {
                if (!acc[role.scope]) {
                    acc[role.scope] = [];
                }
                acc[role.scope].push(role);
                return acc;
            }, {});

            this.selectedUser = {
                details: userDetails,
                roles: userRoles.roles,
                rolesByScope,
            };
        },
        clearSelectedUser() {
            this.selectedUser = null;
        },
        async fetchUserRoles(userId) {
            try {
                await usersApi.fetchUserRoles(storageUtils.tryToLoadTokenFromStorage(), userId);
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', 'error loading user roles');
            }
        },
        async setUserRoles(userId, roleIds) {
            try {
                await usersApi.setUserRoles(storageUtils.tryToLoadTokenFromStorage(), userId, roleIds);
                this.setAlertMessage('success', 'User Roles Updated!');
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', 'error setting user roles');
            }
        },
        async clearUserRoles(userId) {
            try {
                await usersApi.clearUserRoles(storageUtils.tryToLoadTokenFromStorage(), userId);
                this.setAlertMessage('success', 'User Roles Updated!');
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', 'error clearing user roles');
            }
        },
        setAlertMessage(type, message) {
            this.alertVisible = true;
            this.alertType = type;
            this.alertMessage = message;
            setTimeout(() => {
                this.alertVisible = false;
            }, 3000)
        }
    },
    state: () => {
        return {
            users: [],
            selectedUser: null,
            loading: false,
            alertVisible: false,
            alertType: 'success',
            alertMessage: null,
        };
    }
});