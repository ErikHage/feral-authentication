import { createPinia, setActivePinia } from 'pinia';
import { useRolesStore } from '@/store';
import rolesApi from '@/api/roles-api';
import { httpError } from '../../helpers/http-errors';
import { lastMessage } from '../../helpers/notifications';

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

    it('starts with no roles and no load error', () => {
        expect(store.$state).toEqual({
            roles: [],
            loading: false,
            rolesLoadError: null,
        });
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
            rolesApi.fetchRoles.mockRejectedValue(httpError(403));

            await store.fetchRoles();

            expect(store.roles).toEqual([{ roleId: 'role-1' }]);
            expect(store.loading).toBe(false);
            expect(store.rolesLoadError).toBe("Couldn't load the roles: you don't have permission");
        });

        it('forgets an earlier failure once a load succeeds', async () => {
            rolesApi.fetchRoles.mockRejectedValueOnce(httpError(403)).mockResolvedValueOnce([]);

            await store.fetchRoles();
            await store.fetchRoles();

            expect(store.rolesLoadError).toBeNull();
        });
    });

    describe('addRole', () => {
        it('adds the role and names it in the message', async () => {
            rolesApi.addRole.mockResolvedValue({});

            await store.addRole(role);

            expect(rolesApi.addRole).toHaveBeenCalledWith('a-token', role);
            expect(lastMessage()).toEqual({ color: 'success', text: 'Role feral/admin Added' });
        });

        it('shows the error when it fails', async () => {
            rolesApi.addRole.mockRejectedValue(httpError(500));

            await store.addRole(role);

            expect(lastMessage()).toEqual({ color: 'error', text: "Couldn't add the role feral/admin: the service failed (500)" });
        });
    });

    describe('deleteRole', () => {
        it('deletes the role', async () => {
            rolesApi.deleteRole.mockResolvedValue();

            await store.deleteRole('role-1');

            expect(rolesApi.deleteRole).toHaveBeenCalledWith('a-token', 'role-1');
            expect(lastMessage()).toEqual({ color: 'success', text: 'Role Deleted.' });
        });

        it('shows the error when it fails', async () => {
            rolesApi.deleteRole.mockRejectedValue(httpError(404));

            await store.deleteRole('role-1');

            expect(lastMessage()).toEqual({ color: 'error', text: "Couldn't delete the role: it wasn't found" });
        });
    });
});
