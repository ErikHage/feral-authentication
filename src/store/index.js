import { defineStore } from 'pinia';

import authenticationApi from '@/api/authentication-api';
import rolesApi from "@/api/roles-api";
import usersApi from "@/api/users-api";
import sessionsApi from "@/api/sessions-api";
import keysApi from "@/api/keys-api";
import applicationsApi from "@/api/applications-api";

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
                this.loading = false;
                this.setAlertMessage('success', 'Login Succeeded!');
            } catch (err) {
                this.isAuthenticated = false;
                this.loading = false;
                this.setAlertMessage('error', err.message);
            }
        },
        async loginToApplication(applicationId) {
            try {
                const html = await authenticationApi.loginToApplication(storageUtils.tryToLoadTokenFromStorage(), applicationId);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;

                // Extract and append the form to the body
                const form = tempDiv.querySelector('form');
                document.body.appendChild(form);
                form.submit();
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
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
            this.clearToken();
            this.showAppBar = false;
            this.loading = false;
            this.isAuthenticated = false;
        },
        tokenPresent() {
            const maybeToken = storageUtils.tryToLoadTokenFromStorage();
            return maybeToken !== null;
        },
        async verifyToken() {
            this.isAuthenticated = await authenticationApi.verifyToken(storageUtils.tryToLoadTokenFromStorage());
        },
        clearToken() {
            storageUtils.clearTokenFromStorage();
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
                this.setAlertMessage('error', err.message);
            }
            this.loading = false;
        },
        async addRole(role) {
            try {
                await rolesApi.addRole(storageUtils.tryToLoadTokenFromStorage(), role);
                this.setAlertMessage('success', `Role ${role.scope}/${role.title} Added`);
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
        },
        async deleteRole(roleId) {
            try {
                await rolesApi.deleteRole(storageUtils.tryToLoadTokenFromStorage(), roleId);
                this.setAlertMessage('success', 'Role Deleted.');
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
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
            roles: [],
            loading: false,
            alertVisible: false,
            alertType: 'success',
            alertMessage: null,
        };
    },
});

export const useUsersStore = defineStore('user', {
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
        async updateUser(userDetails) {
            try {
                await usersApi.updateUser(storageUtils.tryToLoadTokenFromStorage(), userDetails);
                this.setAlertMessage('success', 'User updated successfully!');
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', 'error updating user');
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

export const useSessionsStore = defineStore('session', {
    actions: {
        async fetchUserSessions() {
            try {
                this.loading = true;
                this.sessions = await sessionsApi.fetchSessionsForCurrentUser(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
            this.loading = false;
        },
        async deleteSessionById(sessionId) {
            try {
                await sessionsApi.deleteSessionById(storageUtils.tryToLoadTokenFromStorage(), sessionId);
                this.setAlertMessage('success', `Session ${sessionId} revoked`);
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
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
            sessions: [],
            loading: false,
            alertVisible: false,
            alertType: 'success',
            alertMessage: null,
        };
    },
});

export const useKeysStore = defineStore('key', {
    actions: {
        async fetchKeys() {
            try {
                this.loading = true;
                this.availableKeys = await keysApi.fetchKeys(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
            this.loading = false;
        },
        async generateKey(keyName, expiration) {
            try {
                this.loading = true;
                this.keys = await keysApi.generateKey(storageUtils.tryToLoadTokenFromStorage(), keyName, expiration);
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
            this.loading = false;
        },
        async selectKey(keyId) {
            try {
                console.log('selecting key with id', keyId);
                this.loading = true;
                console.log('this.availableKeys', this.availableKeys);
                const keyDetails = this.availableKeys.find(key => key.keyId === keyId);
                console.log('found key', keyDetails);

                this.selectedKey = {
                    keyDetails,
                };
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
            this.loading = false;
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
            availableKeys: [],
            loading: false,
            alertVisible: false,
            alertType: 'success',
            alertMessage: null,
        };
    },
});

export const useApplicationsStore = defineStore('application', {
    actions: {
        async fetchApplications() {
            try {
                this.loading = true;
                this.applications = await applicationsApi.fetchApplications(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
            this.loading = false;
        },
        async selectApplication(applicationId) {
            try {
                this.loading = true;
                console.log(this.applications);
                const applicationDetails = this.applications.find(
                    application => application.applicationId === applicationId);
                console.log(this.applicationDetails);

                this.selectedApplication = {
                    applicationDetails,
                    // TODO key details
                };
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
            this.loading = false;
        },
        async createApplication(application) {
            try {
                this.loading = true;
                await applicationsApi.createApplication(storageUtils.tryToLoadTokenFromStorage(), application);
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
            this.loading = false;
        },
        async rotateAuthenticationKey(applicationId, newKeyId) {
            try {
                await applicationsApi.rotateAuthenticationKey(
                    storageUtils.tryToLoadTokenFromStorage(), applicationId, newKeyId);
                this.setAlertMessage('success', `Key Rotated!`);
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
        },
        async fetchApplicationsForCurrentUser() {
            try {
                this.loading = true;
                this.userAllowedApplications = await applicationsApi.fetchApplicationsForUser(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.setAlertMessage('error', err.message);
            }
            this.loading = false;
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
            applications: [],
            userAllowedApplications: [],
            selectedApplication: null,
            loading: false,
            alertVisible: false,
            alertType: 'success',
            alertMessage: null,
        };
    },
});
