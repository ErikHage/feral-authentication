import { createPinia, setActivePinia } from 'pinia';
import { tokenFor } from '../../helpers/tokens';
import { useAuthenticationStore, useUsersStore, useApplicationsStore } from '@/store';
import authenticationApi from '@/api/authentication-api';

vi.mock('@/api/authentication-api', () => ({
    default: {
        login: vi.fn(),
        loginToApplication: vi.fn(),
        logout: vi.fn(),
        verifyToken: vi.fn(),
    },
}));

const tokenKey = 'feral-token';

// A store created after `token` was stored, as on a reload
function storeWith(token) {
    localStorage.setItem(tokenKey, token);
    setActivePinia(createPinia());
    return useAuthenticationStore();
}

describe('useAuthenticationStore', () => {
    let store;

    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
        store = useAuthenticationStore();
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(window, 'open').mockImplementation(() => null);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('starts logged out with no alert', () => {
            expect(store.$state).toEqual({
                token: null,
                isAuthenticated: false,
                loading: false,
                alertVisible: false,
                alertType: 'success',
                alertMessage: null,
                showAppBar: false,
            });
        });

        it('keeps a token that is already stored, and shows the app bar', () => {
            store = storeWith('a-token');

            expect(store.token).toBe('a-token');
            expect(store.showAppBar).toBe(true);
        });

        it('is not authenticated until the stored token is verified', () => {
            store = storeWith('a-token');

            expect(store.isAuthenticated).toBe(false);
        });
    });

    describe('setAlertMessage', () => {
        it('shows the alert, then hides it after 3 seconds', () => {
            store.setAlertMessage('success', 'saved');

            expect(store.alertVisible).toBe(true);
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe('saved');

            vi.advanceTimersByTime(2999);
            expect(store.alertVisible).toBe(true);

            vi.advanceTimersByTime(1);
            expect(store.alertVisible).toBe(false);
        });
    });

    describe('authenticate', () => {
        it('stores the token and shows the app bar', async () => {
            authenticationApi.login.mockResolvedValue('a-token');

            await store.authenticate('alice', 'secret');

            expect(authenticationApi.login).toHaveBeenCalledWith('alice', 'secret');
            expect(localStorage.getItem(tokenKey)).toBe('a-token');
            expect(store.token).toBe('a-token');
            expect(store.isAuthenticated).toBe(true);
            expect(store.showAppBar).toBe(true);
            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe('Login Succeeded!');
        });

        it('is loading while the login is in flight', async () => {
            let finishLogin;
            authenticationApi.login.mockReturnValue(new Promise(resolve => { finishLogin = resolve; }));

            const authenticating = store.authenticate('alice', 'secret');

            expect(store.loading).toBe(true);
            finishLogin('a-token');
            await authenticating;
            expect(store.loading).toBe(false);
        });

        it('shows the error and stores nothing when the login fails', async () => {
            authenticationApi.login.mockRejectedValue(new Error('Error logging in'));

            await store.authenticate('alice', 'wrong');

            expect(localStorage.getItem(tokenKey)).toBeNull();
            expect(store.isAuthenticated).toBe(false);
            expect(store.showAppBar).toBe(false);
            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Error logging in');
        });
    });

    describe('loginToApplication', () => {
        beforeEach(() => {
            store = storeWith('a-token');
            authenticationApi.loginToApplication.mockResolvedValue('https://app.test/sso?token=x');
        });

        it("replaces this page with the application's redirect url", async () => {
            await store.loginToApplication('app-1', false);

            expect(authenticationApi.loginToApplication).toHaveBeenCalledWith('a-token', 'app-1');
            expect(window.open).toHaveBeenCalledWith('https://app.test/sso?token=x', '_self');
        });

        it('replaces this page when no newTab is given', async () => {
            await store.loginToApplication('app-1');

            expect(window.open).toHaveBeenCalledWith('https://app.test/sso?token=x', '_self');
        });

        it('opens the redirect url in a new tab when asked', async () => {
            await store.loginToApplication('app-1', true);

            expect(window.open).toHaveBeenCalledWith('https://app.test/sso?token=x', '_blank');
        });

        it('shows the error and opens nothing when it fails', async () => {
            authenticationApi.loginToApplication.mockRejectedValue(new Error('Error logging in'));

            await store.loginToApplication('app-1', false);

            expect(window.open).not.toHaveBeenCalled();
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Error logging in');
        });
    });

    describe('logout', () => {
        beforeEach(() => {
            store = storeWith('a-token');
            store.$patch({ isAuthenticated: true, showAppBar: true, loading: true });
        });

        it('logs out the token, forgets it and hides the app bar', async () => {
            authenticationApi.logout.mockResolvedValue();

            await store.logout();

            expect(authenticationApi.logout).toHaveBeenCalledWith('a-token');
            expect(localStorage.getItem(tokenKey)).toBeNull();
            expect(store.token).toBeNull();
            expect(store.isAuthenticated).toBe(false);
            expect(store.showAppBar).toBe(false);
            expect(store.loading).toBe(false);
        });

        it("forgets the user's data in the other stores", async () => {
            authenticationApi.logout.mockResolvedValue();
            const usersStore = useUsersStore();
            const applicationsStore = useApplicationsStore();
            const loggedOut = JSON.parse(JSON.stringify({ users: usersStore.$state, applications: applicationsStore.$state }));
            usersStore.$patch({ users: [{ userId: 'user-1' }], selectedUser: { details: {} } });
            applicationsStore.$patch({ applications: [{ applicationId: 'app-1' }], userAllowedApplications: [{}] });

            await store.logout();

            expect(usersStore.$state).toEqual(loggedOut.users);
            expect(applicationsStore.$state).toEqual(loggedOut.applications);
        });

        it('still logs out locally when the token has already expired', async () => {
            authenticationApi.logout.mockRejectedValue(Object.assign(new Error('expired'), { status: 401 }));

            await store.logout();

            expect(localStorage.getItem(tokenKey)).toBeNull();
            expect(store.isAuthenticated).toBe(false);
            expect(store.alertVisible).toBe(false);
        });

        it('logs out locally without saying so when the service fails', async () => {
            // current behavior: the error branch is an empty "show some error" placeholder
            authenticationApi.logout.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }));

            await store.logout();

            expect(localStorage.getItem(tokenKey)).toBeNull();
            expect(store.isAuthenticated).toBe(false);
            expect(store.alertVisible).toBe(false);
        });
    });

    describe('tokenPresent', () => {
        it('is true when a token is stored', () => {
            store = storeWith('a-token');

            expect(store.tokenPresent()).toBe(true);
        });

        it('is false when no token is stored', () => {
            expect(store.tokenPresent()).toBe(false);
        });
    });

    describe('verifyToken', () => {
        it('is authenticated when the service accepts the stored token', async () => {
            store = storeWith('a-token');
            authenticationApi.verifyToken.mockResolvedValue(true);

            await store.verifyToken();

            expect(authenticationApi.verifyToken).toHaveBeenCalledWith('a-token');
            expect(store.isAuthenticated).toBe(true);
        });

        it('is not authenticated when the service rejects it', async () => {
            store.$patch({ isAuthenticated: true });
            authenticationApi.verifyToken.mockResolvedValue(false);

            await store.verifyToken();

            expect(store.isAuthenticated).toBe(false);
        });
    });

    describe('restoreSession', () => {
        it('checks nothing when no token is stored', async () => {
            await store.restoreSession();

            expect(authenticationApi.verifyToken).not.toHaveBeenCalled();
            expect(store.isAuthenticated).toBe(false);
        });

        it('is authenticated when the service accepts the stored token', async () => {
            store = storeWith('a-token');
            authenticationApi.verifyToken.mockResolvedValue(true);

            await store.restoreSession();

            expect(authenticationApi.verifyToken).toHaveBeenCalledWith('a-token');
            expect(store.isAuthenticated).toBe(true);
            expect(store.token).toBe('a-token');
        });

        it('checks nothing once authenticated', async () => {
            store = storeWith('a-token');
            store.$patch({ isAuthenticated: true });

            await store.restoreSession();

            expect(authenticationApi.verifyToken).not.toHaveBeenCalled();
        });

        it.each([
            ['the service rejects it', () => authenticationApi.verifyToken.mockResolvedValue(false)],
            ['checking it fails', () => authenticationApi.verifyToken.mockRejectedValue(new Error('Network Error'))],
        ])('forgets the token and hides the app bar when %s', async (_, arrange) => {
            store = storeWith('a-token');
            arrange();

            await store.restoreSession();

            expect(store.isAuthenticated).toBe(false);
            expect(store.token).toBeNull();
            expect(localStorage.getItem(tokenKey)).toBeNull();
            expect(store.showAppBar).toBe(false);
        });
    });

    it('clearToken forgets the stored token', () => {
        store = storeWith('a-token');

        store.clearToken();

        expect(localStorage.getItem(tokenKey)).toBeNull();
        expect(store.token).toBeNull();
    });

    describe('actor', () => {
        const alice = { userId: 'user-1', sessionId: 'session-1' };
        const bob = { userId: 'user-2', sessionId: 'session-2' };

        it('is the payload of the stored token', () => {
            store = storeWith(tokenFor(alice));

            expect(store.actor).toEqual(alice);
        });

        it('is null when no token is stored', () => {
            expect(store.actor).toBeNull();
        });

        it('follows the token when someone else logs in', async () => {
            store = storeWith(tokenFor(alice));
            expect(store.actor).toEqual(alice);
            authenticationApi.logout.mockResolvedValue();
            authenticationApi.login.mockResolvedValue(tokenFor(bob));

            await store.logout();
            expect(store.actor).toBeNull();
            await store.authenticate('bob', 'secret');

            expect(store.actor).toEqual(bob);
        });
    });
});
