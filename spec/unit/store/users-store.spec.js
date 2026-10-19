import { createPinia, setActivePinia } from 'pinia';
import { useUsersStore } from '@/store';
import usersApi from '@/api/users-api';

vi.mock('@/api/users-api', () => ({
    default: {
        fetchUsers: vi.fn(),
        addUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        fetchUserRoles: vi.fn(),
        setUserRoles: vi.fn(),
        clearUserRoles: vi.fn(),
        fetchUserApplications: vi.fn(),
        setUserApplications: vi.fn(),
        clearUserApplications: vi.fn(),
    },
}));

const alice = { userId: 'user-1', username: 'alice', firstName: 'Alice', lastName: 'Smith' };
const bob = { userId: 'user-2', username: 'bob', firstName: 'Bob', lastName: 'Jones' };

const feralAdmin = { roleId: 'role-1', scope: 'feral', title: 'admin' };
const feralUser = { roleId: 'role-2', scope: 'feral', title: 'user' };
const harvestUser = { roleId: 'role-3', scope: 'harvest', title: 'user' };

describe('useUsersStore', () => {
    let store;

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('feral-token', 'a-token');
        setActivePinia(createPinia());
        store = useUsersStore();
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('starts with no users, none selected and no alert', () => {
        expect(store.$state).toEqual({
            users: [],
            selectedUser: null,
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

    describe('fetchUsers', () => {
        it('loads the users with the stored token', async () => {
            usersApi.fetchUsers.mockResolvedValue([alice, bob]);

            await store.fetchUsers();

            expect(usersApi.fetchUsers).toHaveBeenCalledWith('a-token');
            expect(store.users).toEqual([alice, bob]);
            expect(store.loading).toBe(false);
        });

        it('is loading while the users are fetched', async () => {
            let finish;
            usersApi.fetchUsers.mockReturnValue(new Promise(resolve => { finish = resolve; }));

            const fetching = store.fetchUsers();

            expect(store.loading).toBe(true);
            finish([]);
            await fetching;
            expect(store.loading).toBe(false);
        });

        it('shows a fixed message when it fails', async () => {
            usersApi.fetchUsers.mockRejectedValue(new Error('Request failed with status code 403'));

            await store.fetchUsers();

            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe('error loading users');
        });
    });

    // Each of these shows a fixed message, not the error's
    describe.each([
        ['addUser', [alice], [alice], 'User added successfully!', 'error adding user'],
        ['updateUser', [alice], [alice], 'User updated successfully!', 'error updating user'],
        ['deleteUser', ['user-1'], ['user-1'], 'User deleted successfully.', 'error deleting user'],
        ['setUserRoles', ['user-1', ['role-1']], ['user-1', ['role-1']], 'User Roles Updated!', 'error setting user roles'],
        ['clearUserRoles', ['user-1'], ['user-1'], 'User Roles Updated!', 'error clearing user roles'],
        ['setUserApplications', ['user-1', ['app-1']], ['user-1', ['app-1']], 'User Applications Updated!', 'error setting user applications'],
        ['clearUserApplications', ['user-1'], ['user-1'], 'User Applications Updated!', 'error clearing user applications'],
    ])('%s', (action, args, apiArgs, successMessage, errorMessage) => {
        it('calls the service with the stored token and says it succeeded', async () => {
            usersApi[action].mockResolvedValue({});

            await store[action](...args);

            expect(usersApi[action]).toHaveBeenCalledWith('a-token', ...apiArgs);
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe(successMessage);
        });

        it('says it failed', async () => {
            usersApi[action].mockRejectedValue(new Error('Request failed with status code 500'));

            await store[action](...args);

            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe(errorMessage);
        });
    });

    describe('selectUser', () => {
        beforeEach(() => {
            store.$patch({ users: [alice, bob] });
            usersApi.fetchUserRoles.mockResolvedValue({ roles: [feralAdmin, harvestUser, feralUser] });
            usersApi.fetchUserApplications.mockResolvedValue([{ applicationId: 'app-1' }]);
        });

        it("selects the user with their roles, grouped by scope, and their applications", async () => {
            await store.selectUser('user-2');

            expect(usersApi.fetchUserRoles).toHaveBeenCalledWith('a-token', 'user-2');
            expect(usersApi.fetchUserApplications).toHaveBeenCalledWith('a-token', 'user-2');
            expect(store.selectedUser).toEqual({
                details: bob,
                roles: [feralAdmin, harvestUser, feralUser],
                rolesByScope: {
                    feral: [feralAdmin, feralUser],
                    harvest: [harvestUser],
                },
                applications: [{ applicationId: 'app-1' }],
            });
        });

        it('selects a user with no roles', async () => {
            usersApi.fetchUserRoles.mockResolvedValue({ roles: [] });

            await store.selectUser('user-1');

            expect(store.selectedUser.rolesByScope).toEqual({});
        });

        it('selects a user it has not loaded, without details', async () => {
            // current behavior: the details come from the loaded list only
            await store.selectUser('user-9');

            expect(store.selectedUser.details).toBeUndefined();
        });

        it('fails outright when the roles cannot be fetched', async () => {
            // current behavior: unlike the other actions, there's no catch and no alert
            usersApi.fetchUserRoles.mockRejectedValue(new Error('Request failed with status code 403'));

            await expect(store.selectUser('user-1')).rejects.toThrow('Request failed with status code 403');
            expect(store.selectedUser).toBeNull();
            expect(store.alertVisible).toBe(false);
        });
    });

    it('clearSelectedUser deselects the user', () => {
        store.$patch({ selectedUser: { details: alice } });

        store.clearSelectedUser();

        expect(store.selectedUser).toBeNull();
    });

    describe.each([
        ['fetchUserRoles', 'error loading user roles'],
        ['fetchUserApplications', 'error loading user applications'],
    ])('%s', (action, errorMessage) => {
        it('fetches with the stored token, but keeps nothing', async () => {
            // current behavior: the result is discarded; selectUser fetches its own
            usersApi[action].mockResolvedValue({ roles: [feralAdmin] });

            const result = await store[action]('user-1');

            expect(usersApi[action]).toHaveBeenCalledWith('a-token', 'user-1');
            expect(result).toBeUndefined();
            expect(store.selectedUser).toBeNull();
        });

        it('says it failed', async () => {
            usersApi[action].mockRejectedValue(new Error('Request failed with status code 500'));

            await store[action]('user-1');

            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe(errorMessage);
        });
    });
});
