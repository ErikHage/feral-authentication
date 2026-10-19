import { createPinia, setActivePinia } from 'pinia';
import { useRolesStore } from '@/store';
import rolesApi from '@/api/roles-api';

vi.mock('@/api/roles-api', () => ({
    default: {
        fetchRoles: vi.fn(),
        addRole: vi.fn(),
        deleteRole: vi.fn(),
    },
}));

const role = { scope: 'feral', title: 'admin', description: 'Administers feral' };

describe('useRolesStore', () => {
    let store;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('feral-token', 'a-token');
        setActivePinia(createPinia());
        store = useRolesStore();
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('starts with no roles and no alert', () => {
        expect(store.$state).toEqual({
            roles: [],
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

    describe('fetchRoles', () => {
        it('loads the roles with the stored token', async () => {
            rolesApi.fetchRoles.mockResolvedValue([{ roleId: 'role-1', ...role }]);

            await store.fetchRoles();

            expect(rolesApi.fetchRoles).toHaveBeenCalledWith('a-token');
            expect(store.roles).toEqual([{ roleId: 'role-1', ...role }]);
            expect(store.loading).toBe(false);
        });

        it('is loading while the roles are fetched', async () => {
            let finish;
            rolesApi.fetchRoles.mockReturnValue(new Promise(resolve => { finish = resolve; }));

            const fetching = store.fetchRoles();

            expect(store.loading).toBe(true);
            finish([]);
            await fetching;
            expect(store.loading).toBe(false);
        });

        it('keeps the previous roles and shows the error when it fails', async () => {
            store.$patch({ roles: [{ roleId: 'role-1' }] });
            rolesApi.fetchRoles.mockRejectedValue(new Error('Request failed with status code 403'));

            await store.fetchRoles();

            expect(store.roles).toEqual([{ roleId: 'role-1' }]);
            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 403');
        });
    });

    describe('addRole', () => {
        it('adds the role and names it in the alert', async () => {
            rolesApi.addRole.mockResolvedValue({});

            await store.addRole(role);

            expect(rolesApi.addRole).toHaveBeenCalledWith('a-token', role);
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe('Role feral/admin Added');
        });

        it('shows the error when it fails', async () => {
            rolesApi.addRole.mockRejectedValue(new Error('Request failed with status code 500'));

            await store.addRole(role);

            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 500');
        });
    });

    describe('deleteRole', () => {
        it('deletes the role', async () => {
            rolesApi.deleteRole.mockResolvedValue();

            await store.deleteRole('role-1');

            expect(rolesApi.deleteRole).toHaveBeenCalledWith('a-token', 'role-1');
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe('Role Deleted.');
        });

        it('shows the error when it fails', async () => {
            rolesApi.deleteRole.mockRejectedValue(new Error('Request failed with status code 404'));

            await store.deleteRole('role-1');

            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('Request failed with status code 404');
        });
    });
});
