import { createPinia, setActivePinia } from 'pinia';
import { useApplicationsStore } from '@/store';
import applicationsApi from '@/api/applications-api';
import { httpError } from '../../helpers/http-errors';
import { lastMessage } from '../../helpers/notifications';

vi.mock('@/api/applications-api', () => ({
    default: {
        fetchApplications: vi.fn(),
        createApplication: vi.fn(),
        updateApplication: vi.fn(),
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

    it('starts with no applications, none selected and no load error', () => {
        expect(store.$state).toEqual({
            applications: [],
            userAllowedApplications: [],
            selectedApplication: null,
            loading: false,
            applicationsLoadError: null,
            userApplicationsLoadError: null,
        });
    });

    describe.each([
        ['fetchApplications', 'applications', 'applicationsLoadError', "Couldn't load the applications"],
        ['fetchApplicationsForCurrentUser', 'userAllowedApplications', 'userApplicationsLoadError', "Couldn't load your applications", 'fetchApplicationsForUser'],
    ])('%s', (action, stateKey, loadErrorKey, whatFailed, apiFunction = action) => {
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
            applicationsApi[apiFunction].mockRejectedValue(httpError(403));

            await store[action]();

            expect(store[stateKey]).toEqual([]);
            expect(store.loading).toBe(false);
            expect(store[loadErrorKey]).toBe(`${whatFailed}: you don't have permission`);
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

        it('creates the application with the stored token, and names it in the message', async () => {
            applicationsApi.createApplication.mockResolvedValue({ applicationId: 'app-3' });

            await store.createApplication(newApplication);

            expect(applicationsApi.createApplication).toHaveBeenCalledWith('a-token', newApplication);
            expect(store.loading).toBe(false);
            expect(lastMessage()).toEqual({ color: 'success', text: 'Application New created' });
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
            applicationsApi.createApplication.mockRejectedValue(httpError(500));

            await store.createApplication(newApplication);

            expect(store.loading).toBe(false);
            expect(lastMessage()).toEqual({ color: 'error', text: "Couldn't create the application New: the service failed (500)" });
        });
    });

    describe('updateApplication', () => {
        const changed = { ...feral, applicationName: 'Feral 2' };

        it('saves the application with the stored token, names it in the message, and says it saved', async () => {
            applicationsApi.updateApplication.mockResolvedValue(changed);

            const saved = await store.updateApplication(changed);

            expect(applicationsApi.updateApplication).toHaveBeenCalledWith('a-token', changed);
            expect(saved).toBe(true);
            expect(lastMessage()).toEqual({ color: 'success', text: 'Application Feral 2 saved' });
        });

        it('says another application has the name or scope, when the service finds one (409)', async () => {
            applicationsApi.updateApplication.mockRejectedValue(httpError(409));

            const saved = await store.updateApplication(changed);

            expect(saved).toBe(false);
            expect(lastMessage()).toEqual({
                color: 'error',
                text: "Couldn't save the application Feral 2: another application has that name or scope",
            });
        });

        it('shows the error when it fails', async () => {
            applicationsApi.updateApplication.mockRejectedValue(httpError(500));

            const saved = await store.updateApplication(changed);

            expect(saved).toBe(false);
            expect(lastMessage().text).toBe("Couldn't save the application Feral 2: the service failed (500)");
        });
    });

    describe('rotateAuthenticationKey', () => {
        it('rotates the key with the stored token', async () => {
            applicationsApi.rotateAuthenticationKey.mockResolvedValue();

            await store.rotateAuthenticationKey('app-1', 'key-2');

            expect(applicationsApi.rotateAuthenticationKey).toHaveBeenCalledWith('a-token', 'app-1', 'key-2');
            expect(lastMessage()).toEqual({ color: 'success', text: 'Key Rotated!' });
        });

        it('shows the error when it fails', async () => {
            applicationsApi.rotateAuthenticationKey.mockRejectedValue(httpError(400));

            await store.rotateAuthenticationKey('app-1', 'key-2');

            expect(lastMessage()).toEqual({ color: 'error', text: "Couldn't rotate the key: the service refused it (400)" });
        });
    });
});
