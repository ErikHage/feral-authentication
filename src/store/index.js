import { nextTick } from 'vue';
import { defineStore } from 'pinia';

import authenticationApi from '@/api/authentication-api';
import rolesApi from "@/api/roles-api";
import usersApi from "@/api/users-api";
import sessionsApi from "@/api/sessions-api";
import keysApi from "@/api/keys-api";
import applicationsApi from "@/api/applications-api";

import storageUtils from "@/utils/storage-utils";
import jwtUtils from "@/utils/jwt-utils";

import { failureMessage } from "./alerts";
import { clearNotifications, notify } from "./notifications";

export const useAuthenticationStore = defineStore('authentication', {
    actions: {
        async authenticate(username, password) {
            try {
                this.loading = true;
                const token = await authenticationApi.login(username, password);
                storageUtils.setTokenInLocalStorage(token);
                this.token = token;
                this.isAuthenticated = true;
                this.showAppBar = true;
                this.loading = false;
                // Once FrAppShell has replaced the logged-out frame, whose toasts go with it
                await nextTick();
                notify('success', 'Login Succeeded!');
            } catch (err) {
                this.isAuthenticated = false;
                this.loading = false;
                notify('error', failureMessage(err, "Couldn't log in", {
                    401: 'the username or password is wrong',
                    // An unknown username
                    404: 'the username or password is wrong',
                }));
            }
        },
        async loginToApplication(applicationId, newTab) {
            try {
                const redirectUrl = await authenticationApi.loginToApplication(this.token, applicationId);
                console.log('login to application successful');
                console.log(`redirect to: ${redirectUrl}`);

                if (newTab) {
                    window.open(redirectUrl, '_blank');
                } else {
                    window.open(redirectUrl, '_self');
                }
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't open the application"));
            }
        },
        async logout() {
            // The last user's messages go; any said about this logout stay
            clearNotifications();
            let warning = null;
            try {
                await authenticationApi.logout(this.token);
            } catch (err) {
                // A 401: the token had expired, so the session was over anyway
                if (err.status !== 401) {
                    console.log(err);
                    warning = failureMessage(err, "Logged out here, but the service couldn't end the session");
                }
            }
            this.clearToken();
            this.showAppBar = false;
            this.loading = false;
            this.isAuthenticated = false;
            // So the next user to log in, without a reload, sees none of this one's data
            resetDataStores();
            if (warning) {
                // Once the logged-out frame has replaced FrAppShell, whose toasts go with it
                await nextTick();
                notify('warning', warning);
            }
        },
        tokenPresent() {
            return this.token !== null;
        },
        async verifyToken() {
            this.isAuthenticated = await authenticationApi.verifyToken(this.token);
        },
        // A token stored by an earlier visit counts once the service accepts it
        async restoreSession() {
            if (this.isAuthenticated || !this.tokenPresent()) {
                return;
            }
            try {
                await this.verifyToken();
            } catch {
                this.isAuthenticated = false;
            }
            if (!this.isAuthenticated) {
                this.clearToken();
                this.showAppBar = false;
            }
        },
        clearToken() {
            storageUtils.clearTokenFromStorage();
            this.token = null;
        },
    },
    state: () => {
        return {
            // Kept in localStorage too, so a reload can restore the session
            token: storageUtils.tryToLoadTokenFromStorage(),
            isAuthenticated: false,
            loading: false,
            showAppBar: storageUtils.tryToLoadTokenFromStorage() !== null,
        };
    },
    getters: {
        actor(state) {
            return jwtUtils.parseActorToken(state.token);
        },
    },
});

export const useRolesStore = defineStore('role', {
    actions: {
        async fetchRoles() {
            try {
                this.loading = true;
                this.rolesLoadError = null;
                this.roles = await rolesApi.fetchRoles(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.rolesLoadError = failureMessage(err, "Couldn't load the roles");
            }
            this.loading = false;
        },
        async addRole(role) {
            try {
                await rolesApi.addRole(storageUtils.tryToLoadTokenFromStorage(), role);
                notify('success', `Role ${role.scope}/${role.title} Added`);
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, `Couldn't add the role ${role.scope}/${role.title}`));
            }
        },
        async deleteRole(roleId) {
            try {
                await rolesApi.deleteRole(storageUtils.tryToLoadTokenFromStorage(), roleId);
                notify('success', 'Role Deleted.');
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't delete the role"));
            }
        },
    },
    state: () => {
        return {
            roles: [],
            loading: false,
            rolesLoadError: null,
        };
    },
});

// Each store's latest selectUser, so an earlier, slower one can't overwrite
// the user chosen after it
const latestSelections = new WeakMap();

function startSelection(store) {
    const selection = (latestSelections.get(store) ?? 0) + 1;
    latestSelections.set(store, selection);
    return selection;
}

const isLatestSelection = (store, selection) => latestSelections.get(store) === selection;

function groupedByScope(roles) {
    return roles.reduce((acc, role) => {
        if (!acc[role.scope]) {
            acc[role.scope] = [];
        }
        acc[role.scope].push(role);
        return acc;
    }, {});
}

export const useUsersStore = defineStore('user', {
    actions: {
        async fetchUsers() {
            try {
                this.loading = true;
                this.usersLoadError = null;
                this.users = await usersApi.fetchUsers(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.usersLoadError = failureMessage(err, "Couldn't load the users");
            }
            this.loading = false;
        },
        async addUser(user) {
            try {
                await usersApi.addUser(storageUtils.tryToLoadTokenFromStorage(), user);
                notify('success', 'User added successfully!');
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't add the user"));
            }
        },
        async updateUser(userDetails) {
            try {
                await usersApi.updateUser(storageUtils.tryToLoadTokenFromStorage(), userDetails);
                notify('success', 'User updated successfully!');
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't update the user"));
            }
        },
        async deleteUser(userId) {
            try {
                await usersApi.deleteUser(storageUtils.tryToLoadTokenFromStorage(), userId);
                notify('success', 'User deleted successfully.');
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't delete the user"));
            }
        },
        async selectUser(userId) {
            const selection = startSelection(this);
            try {
                const token = storageUtils.tryToLoadTokenFromStorage();
                const userDetails = this.users.find(user => user.userId === userId)
                    ?? await usersApi.fetchUser(token, userId);
                const userRoles = await usersApi.fetchUserRoles(token, userId);
                const userApplications = await usersApi.fetchUserApplications(token, userId);
                if (!isLatestSelection(this, selection)) {
                    return;
                }
                this.selectedUser = {
                    details: userDetails,
                    roles: userRoles.roles,
                    rolesByScope: groupedByScope(userRoles.roles),
                    applications: userApplications,
                };
                this.selectedUserLoadError = null;
            } catch (err) {
                console.log(err);
                if (!isLatestSelection(this, selection)) {
                    return;
                }
                this.selectedUser = null;
                this.selectedUserLoadError = failureMessage(err, "Couldn't load the user");
            }
        },
        // The logged-in user, for their profile: no admin role needed
        async loadCurrentUser() {
            try {
                const token = storageUtils.tryToLoadTokenFromStorage();
                this.currentUserLoadError = null;
                const details = await usersApi.fetchCurrentUser(token);
                const { roles } = await usersApi.fetchCurrentUserRoles(token);
                this.currentUser = { details, roles, rolesByScope: groupedByScope(roles) };
            } catch (err) {
                console.log(err);
                this.currentUser = null;
                this.currentUserLoadError = failureMessage(err, "Couldn't load your profile");
            }
        },
        // Resolves to whether it saved
        async updateCurrentUser(names) {
            try {
                await usersApi.updateCurrentUser(storageUtils.tryToLoadTokenFromStorage(), names);
                notify('success', 'User updated successfully!');
                return true;
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't save your details"));
                return false;
            }
        },
        clearSelectedUser() {
            // A selection still loading is dropped too
            startSelection(this);
            this.selectedUser = null;
            this.selectedUserLoadError = null;
        },
        // Each of these four resolves to whether it saved
        async setUserRoles(userId, roleIds) {
            try {
                await usersApi.setUserRoles(storageUtils.tryToLoadTokenFromStorage(), userId, roleIds);
                notify('success', 'User Roles Updated!');
                return true;
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't update the user's roles"));
                return false;
            }
        },
        async clearUserRoles(userId) {
            try {
                await usersApi.clearUserRoles(storageUtils.tryToLoadTokenFromStorage(), userId);
                notify('success', 'User Roles Updated!');
                return true;
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't update the user's roles"));
                return false;
            }
        },
        async setUserApplications(userId, applicationIds) {
            try {
                await usersApi.setUserApplications(storageUtils.tryToLoadTokenFromStorage(), userId, applicationIds);
                notify('success', 'User Applications Updated!');
                return true;
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't update the user's applications"));
                return false;
            }
        },
        async clearUserApplications(userId) {
            try {
                await usersApi.clearUserApplications(storageUtils.tryToLoadTokenFromStorage(), userId);
                notify('success', 'User Applications Updated!');
                return true;
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't update the user's applications"));
                return false;
            }
        },
    },
    state: () => {
        return {
            users: [],
            selectedUser: null,
            currentUser: null,
            loading: false,
            usersLoadError: null,
            selectedUserLoadError: null,
            currentUserLoadError: null,
        };
    }
});

export const useSessionsStore = defineStore('session', {
    actions: {
        async fetchUserSessions() {
            try {
                this.loading = true;
                this.sessionsLoadError = null;
                this.sessions = await sessionsApi.fetchSessionsForCurrentUser(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.sessionsLoadError = failureMessage(err, "Couldn't load your sessions");
            }
            this.loading = false;
        },
        async deleteSessionById(sessionId) {
            try {
                await sessionsApi.deleteSessionById(storageUtils.tryToLoadTokenFromStorage(), sessionId);
                notify('success', `Session ${sessionId} revoked`);
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't revoke the session"));
            }
        },
    },
    state: () => {
        return {
            sessions: [],
            loading: false,
            sessionsLoadError: null,
        };
    },
});

export const useKeysStore = defineStore('key', {
    actions: {
        async fetchKeys() {
            try {
                this.loading = true;
                this.keysLoadError = null;
                this.availableKeys = await keysApi.fetchKeys(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.keysLoadError = failureMessage(err, "Couldn't load the keys");
            }
            this.loading = false;
        },
        async generateKey(keyName, expiration) {
            try {
                this.loading = true;
                await keysApi.generateKey(storageUtils.tryToLoadTokenFromStorage(), keyName, expiration);
                notify('success', `Key ${keyName} generated`);
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, `Couldn't generate the key ${keyName}`));
            }
            this.loading = false;
        },
        async selectKey(keyId) {
            console.log('selecting key with id', keyId);
            console.log('this.availableKeys', this.availableKeys);
            const keyDetails = this.availableKeys.find(key => key.keyId === keyId);
            console.log('found key', keyDetails);

            this.selectedKey = {
                keyDetails,
            };
        },
    },
    state: () => {
        return {
            availableKeys: [],
            loading: false,
            keysLoadError: null,
        };
    },
});

export const useApplicationsStore = defineStore('application', {
    actions: {
        async fetchApplications() {
            try {
                this.loading = true;
                this.applicationsLoadError = null;
                this.applications = await applicationsApi.fetchApplications(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.applicationsLoadError = failureMessage(err, "Couldn't load the applications");
            }
            this.loading = false;
        },
        async selectApplication(applicationId) {
            console.log(this.applications);
            const applicationDetails = this.applications.find(
                application => application.applicationId === applicationId);

            this.selectedApplication = {
                applicationDetails,
                // TODO key details
            };
        },
        async createApplication(application) {
            try {
                this.loading = true;
                await applicationsApi.createApplication(storageUtils.tryToLoadTokenFromStorage(), application);
                notify('success', `Application ${application.applicationName} created`);
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, `Couldn't create the application ${application.applicationName}`));
            }
            this.loading = false;
        },
        // Resolves to whether it saved
        async updateApplication(application) {
            try {
                await applicationsApi.updateApplication(storageUtils.tryToLoadTokenFromStorage(), application);
                notify('success', `Application ${application.applicationName} saved`);
                return true;
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err,
                    `Couldn't save the application ${application.applicationName}`,
                    { 409: 'another application has that name or scope' }));
                return false;
            }
        },
        async rotateAuthenticationKey(applicationId, newKeyId) {
            try {
                await applicationsApi.rotateAuthenticationKey(
                    storageUtils.tryToLoadTokenFromStorage(), applicationId, newKeyId);
                notify('success', `Key Rotated!`);
            } catch (err) {
                console.log(err);
                notify('error', failureMessage(err, "Couldn't rotate the key"));
            }
        },
        async fetchApplicationsForCurrentUser() {
            try {
                this.loading = true;
                this.userApplicationsLoadError = null;
                this.userAllowedApplications = await applicationsApi.fetchApplicationsForUser(storageUtils.tryToLoadTokenFromStorage());
            } catch (err) {
                console.log(err);
                this.userApplicationsLoadError = failureMessage(err, "Couldn't load your applications");
            }
            this.loading = false;
        },
    },
    state: () => {
        return {
            applications: [],
            userAllowedApplications: [],
            selectedApplication: null,
            loading: false,
            applicationsLoadError: null,
            userApplicationsLoadError: null,
        };
    },
});

function resetDataStores() {
    for (const useStore of [useRolesStore, useUsersStore, useSessionsStore, useKeysStore, useApplicationsStore]) {
        useStore().$reset();
    }
}
