import axios from 'axios';
import rolesApi from '@/api/roles-api';

vi.mock('axios');

const baseUrl = 'https://api.test/feral-authentication-service/v0';
const auth = { headers: { 'x-feral-auth-token': 'a-token' } };

describe('rolesApi', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it('fetches every role', async () => {
        axios.get.mockResolvedValue({ data: [{ roleId: 'role-1' }] });

        const roles = await rolesApi.fetchRoles('a-token');

        expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/roles`, auth);
        expect(roles).toEqual([{ roleId: 'role-1' }]);
    });

    it('adds a role', async () => {
        const role = { scope: 'feral', title: 'admin', description: 'Administers feral' };
        axios.post.mockResolvedValue({ data: { roleId: 'role-1', ...role } });

        const added = await rolesApi.addRole('a-token', role);

        expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/roles`, role, auth);
        expect(added).toEqual({ roleId: 'role-1', ...role });
    });

    it('deletes a role', async () => {
        axios.delete.mockResolvedValue({ data: {} });

        await rolesApi.deleteRole('a-token', 'role-1');

        expect(axios.delete).toHaveBeenCalledWith(`${baseUrl}/roles/role-1`, auth);
    });
});
