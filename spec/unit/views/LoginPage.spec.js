import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../helpers/mount';
import LoginPage from '@/views/LoginPage.vue';
import { useAuthenticationStore } from '@/store';

// The store's actions are stubs. authenticate and verifyToken are given
// implementations that log in, where a test needs that
async function mountPage({ state = {}, arrange = () => {} } = {}) {
    const router = { push: vi.fn() };
    const pinia = createTestingPinia({ initialState: { authentication: state } });
    const store = useAuthenticationStore(pinia);
    arrange(store);

    const wrapper = mountWithPlugins(LoginPage, {
        global: { plugins: [pinia], mocks: { $router: router } },
    });
    await flushPromises();

    return { wrapper, router, store };
}

const logsIn = store => async () => { store.isAuthenticated = true; };

async function submit(wrapper, username, password) {
    const [usernameField, passwordField] = wrapper.findAll('input');
    await usernameField.setValue(username);
    await passwordField.setValue(password);
    await wrapper.find('form').trigger('submit');
    await flushPromises();
}

describe('LoginPage', () => {
    beforeEach(() => {
        // Only setTimeout, so flushPromises (setImmediate) still runs
        vi.useFakeTimers({ toFake: ['setTimeout'] });
    });

    afterEach(() => {
        vi.useRealTimers();
        window.history.replaceState(null, '', '/');
    });

    it('asks for a username and a password', async () => {
        const { wrapper } = await mountPage();

        const inputs = wrapper.findAll('input');
        expect(inputs.map(input => input.attributes('type'))).toEqual(['text', 'password']);
        expect(wrapper.text()).toContain('Username');
        expect(wrapper.text()).toContain('Password');
    });

    it('shows the rooster logo from the asset path', async () => {
        const { wrapper } = await mountPage();

        expect(wrapper.findComponent({ name: 'VImg' }).props('src')).toBe('/assets-test/ai-rooster.jpg');
    });

    it('shows the store alert', async () => {
        const { wrapper } = await mountPage({
            state: { alertVisible: true, alertType: 'error', alertMessage: 'Error logging in' },
        });

        expect(wrapper.find('.v-alert').text()).toContain('Error logging in');
    });

    describe('submitting', () => {
        it('logs in with what was typed', async () => {
            const { wrapper, store } = await mountPage();

            await submit(wrapper, 'alice', 'secret');

            expect(store.authenticate).toHaveBeenCalledWith('alice', 'secret');
        });

        it('goes to the applications page half a second after logging in', async () => {
            const { wrapper, router } = await mountPage({
                arrange: store => store.authenticate.mockImplementation(logsIn(store)),
            });

            await submit(wrapper, 'alice', 'secret');

            vi.advanceTimersByTime(499);
            expect(router.push).not.toHaveBeenCalled();
            vi.advanceTimersByTime(1);
            expect(router.push).toHaveBeenCalledWith('/dashboard/applications');
        });

        it('stays on the page when the login fails', async () => {
            const { wrapper, router, store } = await mountPage();

            await submit(wrapper, 'alice', 'wrong');
            vi.advanceTimersByTime(1000);

            expect(router.push).not.toHaveBeenCalled();
            expect(store.loginToApplication).not.toHaveBeenCalled();
        });

        it('logs in to the application named by ?app= instead', async () => {
            window.history.replaceState(null, '', '/auth/login?app=app-1');
            const { wrapper, router, store } = await mountPage({
                arrange: store => store.authenticate.mockImplementation(logsIn(store)),
            });

            await submit(wrapper, 'alice', 'secret');
            vi.advanceTimersByTime(1000);

            expect(store.loginToApplication).toHaveBeenCalledWith('app-1', false);
            expect(router.push).not.toHaveBeenCalled();
        });
    });

    describe('opening the page with a stored token', () => {
        it('checks nothing when no token is stored', async () => {
            const { store } = await mountPage();

            expect(store.verifyToken).not.toHaveBeenCalled();
        });

        it('goes to the applications page when the token is still valid', async () => {
            const { router, store } = await mountPage({
                arrange: store => {
                    store.tokenPresent.mockReturnValue(true);
                    store.verifyToken.mockImplementation(logsIn(store));
                },
            });

            expect(store.verifyToken).toHaveBeenCalledTimes(1);
            vi.advanceTimersByTime(500);
            expect(router.push).toHaveBeenCalledWith('/dashboard/applications');
            expect(store.clearToken).not.toHaveBeenCalled();
        });

        it('logs in to the application named by ?app= when the token is still valid', async () => {
            window.history.replaceState(null, '', '/auth/login?app=app-1');

            const { router, store } = await mountPage({
                arrange: store => {
                    store.tokenPresent.mockReturnValue(true);
                    store.verifyToken.mockImplementation(logsIn(store));
                },
            });
            vi.advanceTimersByTime(1000);

            expect(store.loginToApplication).toHaveBeenCalledWith('app-1', false);
            expect(router.push).not.toHaveBeenCalled();
        });

        it('forgets a token the service rejects, and stays', async () => {
            const { router, store } = await mountPage({
                arrange: store => store.tokenPresent.mockReturnValue(true),
            });
            vi.advanceTimersByTime(1000);

            expect(store.clearToken).toHaveBeenCalledTimes(1);
            expect(router.push).not.toHaveBeenCalled();
        });

        it('forgets the token when checking it fails', async () => {
            const { router, store } = await mountPage({
                arrange: store => {
                    store.tokenPresent.mockReturnValue(true);
                    store.verifyToken.mockRejectedValue(new Error('Network Error'));
                },
            });
            vi.advanceTimersByTime(1000);

            expect(store.clearToken).toHaveBeenCalledTimes(1);
            expect(router.push).not.toHaveBeenCalled();
        });
    });

    describe('the submit button', () => {
        it('is shown before logging in', async () => {
            const { wrapper } = await mountPage();

            expect(wrapper.find('button[type="submit"]').text()).toBe('Submit');
            expect(wrapper.find('.v-progress-circular').exists()).toBe(false);
        });

        it.each([
            ['loading', { loading: true }],
            ['logged in', { isAuthenticated: true }],
        ])('is still shown, with no spinner, while %s', async (_, state) => {
            // current behavior: v-if="showLoginButton" tests the method itself, which is
            // always truthy, so the spinner never shows and Submit can be pressed again
            const { wrapper } = await mountPage({ state });

            expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
            expect(wrapper.find('.v-progress-circular').exists()).toBe(false);
        });
    });
});
