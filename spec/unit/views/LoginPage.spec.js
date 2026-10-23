import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../helpers/mount';
import LoginPage from '@/views/LoginPage.vue';
import { useAuthenticationStore } from '@/store';

// The store's actions are stubs. authenticate and restoreSession are given
// implementations that log in, where a test needs that
async function mountPage({ state = {}, query = {}, arrange = () => {} } = {}) {
    const router = { push: vi.fn() };
    const pinia = createTestingPinia({ initialState: { authentication: state } });
    const store = useAuthenticationStore(pinia);
    arrange(store);

    const wrapper = mountWithPlugins(LoginPage, {
        global: { plugins: [pinia], mocks: { $router: router, $route: { query } } },
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

        it('goes back to the page the guard sent them from', async () => {
            const { wrapper, router } = await mountPage({
                query: { redirect: '/admin/users?tab=2' },
                arrange: store => store.authenticate.mockImplementation(logsIn(store)),
            });

            await submit(wrapper, 'alice', 'secret');
            vi.advanceTimersByTime(500);

            expect(router.push).toHaveBeenCalledWith('/admin/users?tab=2');
        });

        it.each(['//evil.test/page', 'https://evil.test/page', 'admin/users'])(
            'goes to the applications page instead of a redirect to %s',
            async redirect => {
                const { wrapper, router } = await mountPage({
                    query: { redirect },
                    arrange: store => store.authenticate.mockImplementation(logsIn(store)),
                });

                await submit(wrapper, 'alice', 'secret');
                vi.advanceTimersByTime(500);

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

    // What counts as a session that still holds is the store's restoreSession; see its spec
    describe('opening the page', () => {
        it('restores a session from an earlier visit', async () => {
            const { store } = await mountPage();

            expect(store.restoreSession).toHaveBeenCalledTimes(1);
        });

        it('stays when there is no session to restore', async () => {
            const { router, store } = await mountPage();
            vi.advanceTimersByTime(1000);

            expect(router.push).not.toHaveBeenCalled();
            expect(store.loginToApplication).not.toHaveBeenCalled();
        });

        it('goes to the applications page when the session is restored', async () => {
            const { router } = await mountPage({
                arrange: store => store.restoreSession.mockImplementation(logsIn(store)),
            });

            vi.advanceTimersByTime(500);
            expect(router.push).toHaveBeenCalledWith('/dashboard/applications');
        });

        it('goes back to the page the guard sent them from when the session is restored', async () => {
            const { router } = await mountPage({
                query: { redirect: '/dashboard/profile' },
                arrange: store => store.restoreSession.mockImplementation(logsIn(store)),
            });

            vi.advanceTimersByTime(500);
            expect(router.push).toHaveBeenCalledWith('/dashboard/profile');
        });

        it('logs in to the application named by ?app= when the session is restored', async () => {
            window.history.replaceState(null, '', '/auth/login?app=app-1');

            const { router, store } = await mountPage({
                arrange: store => store.restoreSession.mockImplementation(logsIn(store)),
            });
            vi.advanceTimersByTime(1000);

            expect(store.loginToApplication).toHaveBeenCalledWith('app-1', false);
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
        ])('gives way to a spinner while %s', async (_, state) => {
            const { wrapper } = await mountPage({ state });

            expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
            expect(wrapper.find('.v-progress-circular').exists()).toBe(true);
        });

        it('comes back when the login fails', async () => {
            const { wrapper } = await mountPage({
                arrange: store => store.authenticate.mockImplementation(async () => {
                    store.loading = false;
                    store.isAuthenticated = false;
                }),
            });

            await submit(wrapper, 'alice', 'wrong');

            expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
        });
    });
});
