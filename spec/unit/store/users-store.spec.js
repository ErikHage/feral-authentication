import { createPinia, setActivePinia } from 'pinia';
import { useUsersStore } from '@/store';
import usersApi from '@/api/users-api';
import { httpError } from '../../helpers/http-errors';

vi.mock('@/api/users-api', () => ({
    default: {
        fetchUsers: vi.fn(),
        fetchUser: vi.fn(),
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

        it('says why when it fails', async () => {
            usersApi.fetchUsers.mockRejectedValue(httpError(403));

            await store.fetchUsers();

            expect(store.loading).toBe(false);
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe("Couldn't load the users: you don't have permission");
        });
    });

    describe.each([
        ['addUser', [alice], [alice], 'User added successfully!', "Couldn't add the user"],
        ['updateUser', [alice], [alice], 'User updated successfully!', "Couldn't update the user"],
        ['deleteUser', ['user-1'], ['user-1'], 'User deleted successfully.', "Couldn't delete the user"],
        ['setUserRoles', ['user-1', ['role-1']], ['user-1', ['role-1']], 'User Roles Updated!', "Couldn't update the user's roles"],
        ['clearUserRoles', ['user-1'], ['user-1'], 'User Roles Updated!', "Couldn't update the user's roles"],
        ['setUserApplications', ['user-1', ['app-1']], ['user-1', ['app-1']], 'User Applications Updated!', "Couldn't update the user's applications"],
        ['clearUserApplications', ['user-1'], ['user-1'], 'User Applications Updated!', "Couldn't update the user's applications"],
    ])('%s', (action, args, apiArgs, successMessage, whatFailed) => {
        it('calls the service with the stored token and says it succeeded', async () => {
            usersApi[action].mockResolvedValue({});

            await store[action](...args);

            expect(usersApi[action]).toHaveBeenCalledWith('a-token', ...apiArgs);
            expect(store.alertType).toBe('success');
            expect(store.alertMessage).toBe(successMessage);
        });

        it('says what failed, and why', async () => {
            usersApi[action].mockRejectedValue(httpError(500));

            await store[action](...args);

            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe(`${whatFailed}: the service failed (500)`);
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

        it('takes the details of a loaded user from the list', async () => {
            await store.selectUser('user-2');

            expect(usersApi.fetchUser).not.toHaveBeenCalled();
        });

        it('fetches the details of a user it has not loaded', async () => {
            const carol = { userId: 'user-9', username: 'carol', firstName: 'Carol', lastName: 'White' };
            usersApi.fetchUser.mockResolvedValue(carol);

            await store.selectUser('user-9');

            expect(usersApi.fetchUser).toHaveBeenCalledWith('a-token', 'user-9');
            expect(store.selectedUser.details).toEqual(carol);
        });

        it('selects nothing, and says why, when the roles cannot be fetched', async () => {
            store.$patch({ selectedUser: { details: bob } });
            usersApi.fetchUserRoles.mockRejectedValue(httpError(403));

            await store.selectUser('user-1');

            expect(store.selectedUser).toBeNull();
            expect(store.alertType).toBe('error');
            expect(store.alertMessage).toBe("Couldn't load the user: you don't have permission");
        });
    });

    it('clearSelectedUser deselects the user', () => {
        store.$patch({ selectedUser: { details: alice } });

        store.clearSelectedUser();

        expect(store.selectedUser).toBeNull();
    });
});
