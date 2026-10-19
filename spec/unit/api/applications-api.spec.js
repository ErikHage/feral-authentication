import axios from 'axios';
import applicationsApi from '@/api/applications-api';

vi.mock('axios');

const baseUrl = 'https://api.test/feral-authentication-service/v0';
const auth = { headers: { 'x-feral-auth-token': 'a-token' } };

describe('applicationsApi', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it('fetches every application', async () => {
        axios.get.mockResolvedValue({ data: [{ applicationId: 'app-1' }] });

        const applications = await applicationsApi.fetchApplications('a-token');

        expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/applications`, auth);
        expect(applications).toEqual([{ applicationId: 'app-1' }]);
    });

    it('creates an application', async () => {
        const application = { applicationName: 'app', applicationUrl: 'https://app.test', scope: 'app', keyPairId: 'key-1' };
        axios.post.mockResolvedValue({ data: { applicationId: 'app-1' } });

        const created = await applicationsApi.createApplication('a-token', application);

        expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/applications`, application, auth);
        expect(created).toEqual({ applicationId: 'app-1' });
    });

    it('rotates an application to a new key', async () => {
        axios.post.mockResolvedValue({ data: {} });

        const result = await applicationsApi.rotateAuthenticationKey('a-token', 'app-1', 'key-2');

        expect(axios.post).toHaveBeenCalledWith(
            `${baseUrl}/applications/app-1/rotate-key`, { newKeyId: 'key-2' }, auth);
        expect(result).toBeUndefined();
    });

    it("fetches the current user's applications", async () => {
        axios.get.mockResolvedValue({ data: [{ applicationId: 'app-1' }] });

        const applications = await applicationsApi.fetchApplicationsForUser('a-token');

        expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/users/current/applications`, auth);
        expect(applications).toEqual([{ applicationId: 'app-1' }]);
    });

    it('passes a failed request through', async () => {
        axios.get.mockRejectedValue(new Error('Request failed with status code 403'));

        await expect(applicationsApi.fetchApplications('a-token'))
            .rejects.toThrow('Request failed with status code 403');
    });
});
