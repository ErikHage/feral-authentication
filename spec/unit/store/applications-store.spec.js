import { createPinia, setActivePinia } from 'pinia';
import { useApplicationsStore } from '@/store';
import applicationsApi from '@/api/applications-api';

vi.mock('@/api/applications-api', () => ({
    default: {
        fetchApplications: vi.fn(),
        createApplication: vi.fn(),
        rotateAuthenticationKey: vi.fn(),
        fetchApplicationsForUser: vi.fn(),
    },
}));

const feral = { applicationId: 'app-1', applicationName: 'Feral', scope: 'feral', keyPairId: 'key-1' };
const harvest = { applicationId: 'app-2', applicationName: 'Harvest', scope: 'harvest', keyPairId: 'key-2' };

describe('useApplicationsStore', () => {
    let store;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('feral-token', 'a-token');
        setActivePinia(createPinia());
        store = useApplicationsStore();
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('starts with no applications, none selected and no alert', () => {
        expect(store.$state).toEqual({
            applications: [],
            userAllowedApplications: [],
            selectedApplication: null,
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

    describe.each([
        ['fetchApplications', 'applications'],
        ['fetchApplicationsForCurrentUser', 'userAllowedApplications', 'fetchApplicationsForUser'],
    ])('%s', (action, stateKey, apiFunction = action) => {
        it(`loads ${stateKey} with the stored token`, async () => {
            applicationsApi[apiFunction].mockResolvedValue([feral, harvest]);

            await store[action]();

            expect(applicationsApi[apiFunction]).toHaveBeenCalledWith('a-token');
            expect(store[stateKey]).toEqual([feral, harvest]);
            expect(store.loading).toBe(false);
        });

        it('is loading while they are fetched', async () => {
            let finish;
            applicationsApi[apiFunction].mockReturnValue(new Promise(resolve => { finish = resolve; }));

            const fetching = store[action]();

            expect(store.loading).toBe(true);
            finish([]);
            await fetching;
            expect(store.loading).toBe(false);
        });

        it('shows the error when it fails', async () => {
            applicationsApi[apiFunction].mockRejectedValue(new Error('Request failed with status code 403'));

            await store[action]();

            expect(store[stateKey]).toEqual([]);
            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 403');
        });
    });

    describe('selectApplication', () => {
        it('selects a listed application', async () => {
            store.$patch({ applications: [feral, harvest] });

            await store.selectApplication('app-2');

            expect(store.selectedApplication).toEqual({ applicationDetails: harvest });
            expect(store.loading).toBe(false);
        });

        it('selects nothing for an unlisted application', async () => {
            store.$patch({ applications: [feral] });

            await store.selectApplication('app-9');

            expect(store.selectedApplication).toEqual({ applicationDetails: undefined });
        });
    });

    describe('createApplication', () => {
        const newApplication = { applicationName: 'New', applicationUrl: 'https://new.test', scope: 'new', keyPairId: 'key-1' };

        it('creates the application with the stored token, without an alert', async () => {
            applicationsApi.createApplication.mockResolvedValue({ applicationId: 'app-3' });

            await store.createApplication(newApplication);

            expect(applicationsApi.createApplication).toHaveBeenCalledWith('a-token', newApplication);
            expect(store.loading).toBe(false);
            expect(store.alertVisible).toBe(false);
        });

        it('is loading while the application is created', async () => {
            let finish;
            applicationsApi.createApplication.mockReturnValue(new Promise(resolve => { finish = resolve; }));

            const creating = store.createApplication(newApplication);

            expect(store.loading).toBe(true);
            finish({});
            await creating;
            expect(store.loading).toBe(false);
        });

        it('shows the error when it fails', async () => {
            applicationsApi.createApplication.mockRejectedValue(new Error('Request failed with status code 500'));

            await store.createApplication(newApplication);

            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 500');
        });
    });

    describe('rotateAuthenticationKey', () => {
        it('rotates the key with the stored token', async () => {
            applicationsApi.rotateAuthenticationKey.mockResolvedValue();

            await store.rotateAuthenticationKey('app-1', 'key-2');

            expect(applicationsApi.rotateAuthenticationKey).toHaveBeenCalledWith('a-token', 'app-1', 'key-2');
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe('Key Rotated!');
        });

        it('shows the error when it fails', async () => {
            applicationsApi.rotateAuthenticationKey.mockRejectedValue(new Error('Request failed with status code 400'));

            await store.rotateAuthenticationKey('app-1', 'key-2');

            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 400');
        });
    });
});
