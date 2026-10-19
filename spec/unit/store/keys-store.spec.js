import { createPinia, setActivePinia } from 'pinia';
import { useKeysStore } from '@/store';
import keysApi from '@/api/keys-api';

vi.mock('@/api/keys-api', () => ({
    default: {
        fetchKeys: vi.fn(),
        generateKey: vi.fn(),
    },
}));

const key1 = { keyId: 'key-1', keyName: 'first', expiration: '2027-01-01T00:00:00.000Z' };
const key2 = { keyId: 'key-2', keyName: 'second', expiration: '2027-06-01T00:00:00.000Z' };

describe('useKeysStore', () => {
    let store;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('feral-token', 'a-token');
        setActivePinia(createPinia());
        store = useKeysStore();
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('starts with no keys and no alert', () => {
        expect(store.$state).toEqual({
            availableKeys: [],
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

    describe('fetchKeys', () => {
        it('loads the keys with the stored token', async () => {
            keysApi.fetchKeys.mockResolvedValue([key1, key2]);

            await store.fetchKeys();

            expect(keysApi.fetchKeys).toHaveBeenCalledWith('a-token');
            expect(store.availableKeys).toEqual([key1, key2]);
            expect(store.loading).toBe(false);
        });

        it('is loading while the keys are fetched', async () => {
            let finish;
            keysApi.fetchKeys.mockReturnValue(new Promise(resolve => { finish = resolve; }));

            const fetching = store.fetchKeys();

            expect(store.loading).toBe(true);
            finish([]);
            await fetching;
            expect(store.loading).toBe(false);
        });

        it('shows the error when it fails', async () => {
            keysApi.fetchKeys.mockRejectedValue(new Error('Request failed with status code 403'));

            await store.fetchKeys();

            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 403');
        });
    });

    describe('generateKey', () => {
        it('generates the key with the stored token, without an alert', async () => {
            keysApi.generateKey.mockResolvedValue(key1);

            await store.generateKey('first', '2027-01-01T00:00');

            expect(keysApi.generateKey).toHaveBeenCalledWith('a-token', 'first', '2027-01-01T00:00');
            expect(store.loading).toBe(false);
            expect(store.alertVisible).toBe(false);
        });

        it('keeps the new key apart from the listed keys', async () => {
            // current behavior: the result goes to store.keys, which nothing reads;
            // the page refetches the list instead
            store.$patch({ availableKeys: [key2] });
            keysApi.generateKey.mockResolvedValue(key1);

            await store.generateKey('first', '2027-01-01T00:00');

            expect(store.keys).toEqual(key1);
            expect(store.availableKeys).toEqual([key2]);
        });

        it('is loading while the key is generated', async () => {
            let finish;
            keysApi.generateKey.mockReturnValue(new Promise(resolve => { finish = resolve; }));

            const generating = store.generateKey('first', '2027-01-01T00:00');

            expect(store.loading).toBe(true);
            finish(key1);
            await generating;
            expect(store.loading).toBe(false);
        });

        it('shows the error when it fails', async () => {
            keysApi.generateKey.mockRejectedValue(new Error('Request failed with status code 400'));

            await store.generateKey('first', '2027-01-01T00:00');

            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 400');
        });
    });

    describe('selectKey', () => {
        it('selects a listed key', async () => {
            store.$patch({ availableKeys: [key1, key2] });

            await store.selectKey('key-2');

            expect(store.selectedKey).toEqual({ keyDetails: key2 });
            expect(store.loading).toBe(false);
        });

        it('selects nothing for an unlisted key', async () => {
            store.$patch({ availableKeys: [key1] });

            await store.selectKey('key-9');

            expect(store.selectedKey).toEqual({ keyDetails: undefined });
        });
    });
});
