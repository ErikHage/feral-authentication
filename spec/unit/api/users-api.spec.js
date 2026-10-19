import axios from 'axios';
import usersApi from '@/api/users-api';

vi.mock('axios');

const baseUrl = 'https://api.test/feral-authentication-service/v0';
const auth = { headers: { 'x-feral-auth-token': 'a-token' } };

const serviceUser = {
    userId: 'user-1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.test',
    username: 'alice',
    lastLogin: '2026-10-01T12:00:00Z',
    isSuspended: false,
    passwordHash: 'not-for-the-ui',
};

describe('usersApi', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetAllMocks();
        vi.restoreAllMocks();
    });

    describe('fetchUsers', () => {
        it('fetches every user, keeping only the displayed fields', async () => {
            axios.get.mockResolvedValue({ data: [serviceUser] });

            const users = await usersApi.fetchUsers('a-token');

            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/users`, auth);
            expect(users).toEqual([{
                userId: 'user-1',
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice@example.test',
                username: 'alice',
                lastLogin: '2026-10-01T12:00:00Z',
                isSuspended: 'N',
            }]);
        });

        it('shows a user who never logged in as "-"', async () => {
            axios.get.mockResolvedValue({ data: [{ ...serviceUser, lastLogin: null }] });

            const [user] = await usersApi.fetchUsers('a-token');

            expect(user.lastLogin).toBe('-');
        });

        it('shows a suspended user as "Y"', async () => {
            axios.get.mockResolvedValue({ data: [{ ...serviceUser, isSuspended: true }] });

            const [user] = await usersApi.fetchUsers('a-token');

            expect(user.isSuspended).toBe('Y');
        });
    });

    describe('addUser', () => {
        const newUser = {
            userId: 'user-1',
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice@example.test',
            username: 'alice',
            password: 'secret',
        };

        it('adds a user with the given id', async () => {
            axios.post.mockResolvedValue({ data: { userId: 'user-1' } });

            const added = await usersApi.addUser('a-token', newUser);

            expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/users`, newUser, auth);
            expect(added).toEqual({ userId: 'user-1' });
        });

        it('leaves out an empty id, so the service assigns one', async () => {
            axios.post.mockResolvedValue({ data: {} });

            await usersApi.addUser('a-token', { ...newUser, userId: '' });

            expect(axios.post.mock.calls[0][1].userId).toBeUndefined();
        });
    });

    it('updates only the first and last name', async () => {
        axios.put.mockResolvedValue({ data: { userId: 'user-1' } });

        const updated = await usersApi.updateUser('a-token', {
            userId: 'user-1', firstName: 'Alicia', lastName: 'Smyth', email: 'changed@example.test',
        });

        expect(axios.put).toHaveBeenCalledWith(
            `${baseUrl}/users/user-1`, { firstName: 'Alicia', lastName: 'Smyth' }, auth);
        expect(updated).toEqual({ userId: 'user-1' });
    });

    it('deletes a user', async () => {
        axios.delete.mockResolvedValue({ data: {} });

        await usersApi.deleteUser('a-token', 'user-1');

        expect(axios.delete).toHaveBeenCalledWith(`${baseUrl}/users/user-1`, auth);
    });

    describe('roles', () => {
        it("fetches a user's roles", async () => {
            axios.get.mockResolvedValue({ data: { roles: [{ roleId: 'role-1' }] } });

            const roles = await usersApi.fetchUserRoles('a-token', 'user-1');

            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/users/user-1/roles`, auth);
            expect(roles).toEqual({ roles: [{ roleId: 'role-1' }] });
        });

        it("sets a user's roles", async () => {
            axios.post.mockResolvedValue({ data: {} });

            await usersApi.setUserRoles('a-token', 'user-1', ['role-1', 'role-2']);

            expect(axios.post).toHaveBeenCalledWith(
                `${baseUrl}/users/user-1/roles`, { roleIds: ['role-1', 'role-2'] }, auth);
        });

        it("clears a user's roles", async () => {
            axios.delete.mockResolvedValue({ data: {} });

            await usersApi.clearUserRoles('a-token', 'user-1');

            expect(axios.delete).toHaveBeenCalledWith(`${baseUrl}/users/user-1/roles`, auth);
        });
    });

    describe('applications', () => {
        it("fetches a user's applications", async () => {
            axios.get.mockResolvedValue({ data: [{ applicationId: 'app-1' }] });

            const applications = await usersApi.fetchUserApplications('a-token', 'user-1');

            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/users/user-1/applications`, auth);
            expect(applications).toEqual([{ applicationId: 'app-1' }]);
        });

        it("sets a user's applications", async () => {
            axios.post.mockResolvedValue({ data: {} });

            await usersApi.setUserApplications('a-token', 'user-1', ['app-1']);

            expect(axios.post).toHaveBeenCalledWith(
                `${baseUrl}/users/user-1/applications`, { applicationIds: ['app-1'] }, auth);
        });

        it("clears a user's applications", async () => {
            axios.delete.mockResolvedValue({ data: {} });

            await usersApi.clearUserApplications('a-token', 'user-1');

            expect(axios.delete).toHaveBeenCalledWith(`${baseUrl}/users/user-1/applications`, auth);
        });
    });
});
