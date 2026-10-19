import { createPinia, setActivePinia } from 'pinia';
import { tokenFor } from '../../helpers/tokens';
import { useAuthenticationStore } from '@/store';
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
                isAuthenticated: false,
                loading: false,
                alertVisible: false,
                alertType: 'success',
                alertMessage: null,
                showAppBar: false,
            });
        });

        it('shows the app bar when a token is already stored', () => {
            localStorage.setItem(tokenKey, 'a-token');
            setActivePinia(createPinia());

            expect(useAuthenticationStore().showAppBar).toBe(true);
        });

        it('is still not authenticated when a token is already stored', () => {
            // current behavior: only authenticate or verifyToken sets isAuthenticated,
            // so a reload leaves a stored token unverified until the login page runs
            localStorage.setItem(tokenKey, 'a-token');
            setActivePinia(createPinia());

            expect(useAuthenticationStore().isAuthenticated).toBe(false);
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
            localStorage.setItem(tokenKey, 'a-token');
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
            localStorage.setItem(tokenKey, 'a-token');
            store.$patch({ isAuthenticated: true, showAppBar: true, loading: true });
        });

        it('logs out the token, forgets it and hides the app bar', async () => {
            authenticationApi.logout.mockResolvedValue();

            await store.logout();

            expect(authenticationApi.logout).toHaveBeenCalledWith('a-token');
            expect(localStorage.getItem(tokenKey)).toBeNull();
            expect(store.isAuthenticated).toBe(false);
            expect(store.showAppBar).toBe(false);
            expect(store.loading).toBe(false);
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
            localStorage.setItem(tokenKey, 'a-token');

            expect(store.tokenPresent()).toBe(true);
        });

        it('is false when no token is stored', () => {
            expect(store.tokenPresent()).toBe(false);
        });
    });

    describe('verifyToken', () => {
        it('is authenticated when the service accepts the stored token', async () => {
            localStorage.setItem(tokenKey, 'a-token');
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

    it('clearToken forgets the stored token', () => {
        localStorage.setItem(tokenKey, 'a-token');

        store.clearToken();

        expect(localStorage.getItem(tokenKey)).toBeNull();
    });

    describe('actor', () => {
        const alice = { userId: 'user-1', sessionId: 'session-1' };
        const bob = { userId: 'user-2', sessionId: 'session-2' };

        it('is the payload of the stored token', () => {
            localStorage.setItem(tokenKey, tokenFor(alice));

            expect(store.actor).toEqual(alice);
        });

        it('is null when no token is stored', () => {
            expect(store.actor).toBeNull();
        });

        it('keeps the first actor it read after the token changes', () => {
            // current behavior: the getter reads localStorage, which isn't reactive,
            // so Pinia caches its first result. Logging in as someone else without a
            // page reload still reports the first user
            localStorage.setItem(tokenKey, tokenFor(alice));
            expect(store.actor).toEqual(alice);

            localStorage.setItem(tokenKey, tokenFor(bob));

            expect(store.actor).toEqual(alice);
        });
    });
});
