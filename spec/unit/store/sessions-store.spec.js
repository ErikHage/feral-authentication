import { createPinia, setActivePinia } from 'pinia';
import { useSessionsStore } from '@/store';
import sessionsApi from '@/api/sessions-api';

vi.mock('@/api/sessions-api', () => ({
    default: {
        fetchSessionsForCurrentUser: vi.fn(),
        deleteSessionById: vi.fn(),
    },
}));

describe('useSessionsStore', () => {
    let store;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('feral-token', 'a-token');
        setActivePinia(createPinia());
        store = useSessionsStore();
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('starts with no sessions and no alert', () => {
        expect(store.$state).toEqual({
            sessions: [],
            loading: false,
            alertVisible: false,
            alertType: 'success',
            alertMessage: null,
        });
    });

    it('hides an alert after 3 seconds', () => {
        store.setAlertMessage('success', 'saved');

        vi.advanceTimersByTime(2999);
        expect(store.alertVisible).toBe(true);

        vi.advanceTimersByTime(1);
        expect(store.alertVisible).toBe(false);
    });

    describe('fetchUserSessions', () => {
        it("loads the current user's sessions with the stored token", async () => {
            sessionsApi.fetchSessionsForCurrentUser.mockResolvedValue([{ sessionId: 'session-1' }]);

            await store.fetchUserSessions();

            expect(sessionsApi.fetchSessionsForCurrentUser).toHaveBeenCalledWith('a-token');
            expect(store.sessions).toEqual([{ sessionId: 'session-1' }]);
            expect(store.loading).toBe(false);
        });

        it('is loading while the sessions are fetched', async () => {
            let finish;
            sessionsApi.fetchSessionsForCurrentUser.mockReturnValue(new Promise(resolve => { finish = resolve; }));

            const fetching = store.fetchUserSessions();

            expect(store.loading).toBe(true);
            finish([]);
            await fetching;
            expect(store.loading).toBe(false);
        });

        it('shows the error when it fails', async () => {
            sessionsApi.fetchSessionsForCurrentUser.mockRejectedValue(new Error('Request failed with status code 403'));

            await store.fetchUserSessions();

            expect(store.sessions).toEqual([]);
            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 403');
        });
    });

    describe('deleteSessionById', () => {
        it('revokes the session and names it in the alert', async () => {
            sessionsApi.deleteSessionById.mockResolvedValue();

            await store.deleteSessionById('session-1');

            expect(sessionsApi.deleteSessionById).toHaveBeenCalledWith('a-token', 'session-1');
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe('Session session-1 revoked');
        });

        it('shows the error when it fails', async () => {
            sessionsApi.deleteSessionById.mockRejectedValue(new Error('Request failed with status code 404'));

            await store.deleteSessionById('session-1');

            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 404');
        });
    });
});
