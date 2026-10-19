import { flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { mountWithPlugins } from '../../../helpers/mount';
import { buttonLabelled } from '../../../helpers/fields';
import ActiveSessions from '@/views/dashboard/ActiveSessions.vue';
import { useAuthenticationStore, useSessionsStore } from '@/store';

const current = { sessionId: 'session-1', scope: 'feral', roles: 'feral/admin', expiration: '2026-10-19T13:00:00Z' };
const remote = { sessionId: 'session-2', scope: 'harvest', roles: 'harvest/user', expiration: '2026-10-19T14:00:00Z' };

async function mountSessions({ state = {} } = {}) {
    const pinia = createTestingPinia({ initialState: { session: { sessions: [current, remote], ...state } } });
    useAuthenticationStore(pinia).actor = { userId: 'user-1', sessionId: 'session-1' };
    const sessionsStore = useSessionsStore(pinia);

    const wrapper = mountWithPlugins(ActiveSessions, { global: { plugins: [pinia] } });
    await flushPromises();

    return { wrapper, sessionsStore };
}

const cardFor = (wrapper, sessionId) => wrapper.findAll('.v-card')
    .find(card => card.find('.v-card-title').text() === sessionId);

describe('ActiveSessions', () => {
    it('loads the sessions', async () => {
        const { sessionsStore } = await mountSessions();

        expect(sessionsStore.fetchUserSessions).toHaveBeenCalledTimes(1);
    });

    it('shows a card per session', async () => {
        const { wrapper } = await mountSessions();

        expect(wrapper.find('h2').text()).toBe('Active Sessions');
        expect(wrapper.findAll('.v-card-title').map(title => title.text())).toEqual(['session-1', 'session-2']);
    });

    it("shows each session's scope, roles and expiration", async () => {
        const { wrapper } = await mountSessions();

        const values = cardFor(wrapper, 'session-2').findAll('input').map(input => input.element.value);
        expect(values).toEqual(['harvest', 'harvest/user', '2026-10-19T14:00:00Z']);
    });

    it('marks the current session with a star', async () => {
        const { wrapper } = await mountSessions();

        const currentCard = cardFor(wrapper, 'session-1');
        const remoteCard = cardFor(wrapper, 'session-2');
        expect(currentCard.find('.v-card-subtitle').text()).toBe('current session');
        expect(currentCard.find('.mdi-star').exists()).toBe(true);
        expect(remoteCard.find('.v-card-subtitle').text()).toBe('remote session');
        expect(remoteCard.find('.mdi-star').exists()).toBe(false);
    });

    it('lets only other sessions be revoked', async () => {
        const { wrapper } = await mountSessions();

        expect(buttonLabelled(cardFor(wrapper, 'session-1'), 'Revoke').attributes('disabled')).toBeDefined();
        expect(buttonLabelled(cardFor(wrapper, 'session-2'), 'Revoke').attributes('disabled')).toBeUndefined();
    });

    it('revokes a session, then reloads', async () => {
        const { wrapper, sessionsStore } = await mountSessions();

        await buttonLabelled(cardFor(wrapper, 'session-2'), 'Revoke').trigger('click');
        await flushPromises();

        expect(sessionsStore.deleteSessionById).toHaveBeenCalledWith('session-2');
        expect(sessionsStore.fetchUserSessions).toHaveBeenCalledTimes(2);
    });

    it('reloads when Refresh is pressed', async () => {
        const { wrapper, sessionsStore } = await mountSessions();

        await buttonLabelled(wrapper, 'Refresh').trigger('click');

        expect(sessionsStore.fetchUserSessions).toHaveBeenCalledTimes(2);
    });

    it('shows the sessions store alert', async () => {
        const { wrapper } = await mountSessions({
            state: { alertVisible: true, alertType: 'success', alertMessage: 'Session session-2 revoked' },
        });

        expect(wrapper.find('.v-alert').text()).toContain('Session session-2 revoked');
    });

    it('is named UserProfile', () => {
        // current behavior: a copy-paste leftover; Vue devtools and warnings call it UserProfile
        expect(ActiveSessions.name).toBe('UserProfile');
    });
});
