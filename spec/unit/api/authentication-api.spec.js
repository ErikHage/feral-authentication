import axios from 'axios';
import authenticationApi from '@/api/authentication-api';

vi.mock('axios');

const baseUrl = 'https://api.test/feral-authentication-service/v0';
const auth = { headers: { 'x-feral-auth-token': 'a-token' } };

describe('authenticationApi', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.resetAllMocks();
        vi.restoreAllMocks();
    });

    describe('login', () => {
        it('logs in to this application and returns the token', async () => {
            axios.post.mockResolvedValue({ data: { token: 'a-token' } });

            const token = await authenticationApi.login('alice', 'secret');

            expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/login`, {
                username: 'alice',
                password: 'secret',
                applicationId: 'test-application-id',
            });
            expect(token).toBe('a-token');
        });

        it('replaces any failure with "Error logging in"', async () => {
            axios.post.mockRejectedValue(new Error('Request failed with status code 401'));

            await expect(authenticationApi.login('alice', 'wrong')).rejects.toThrow(/^Error logging in$/);
        });
    });

    describe('loginToApplication', () => {
        it("returns the application's redirect url", async () => {
            axios.get.mockResolvedValue({ data: { redirectUrl: 'https://app.test/sso?token=x' } });

            const redirectUrl = await authenticationApi.loginToApplication('a-token', 'app-1');

            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/login/app-1`, auth);
            expect(redirectUrl).toBe('https://app.test/sso?token=x');
        });

        it('replaces any failure with "Error logging in"', async () => {
            axios.get.mockRejectedValue(new Error('Request failed with status code 403'));

            await expect(authenticationApi.loginToApplication('a-token', 'app-1'))
                .rejects.toThrow(/^Error logging in$/);
        });
    });

    describe('logout', () => {
        it('logs out the token', async () => {
            axios.post.mockResolvedValue({ data: {} });

            await authenticationApi.logout('a-token');

            expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/logout`, {}, auth);
        });

        it('passes a failed request through', async () => {
            const error = Object.assign(new Error('Request failed with status code 401'), { status: 401 });
            axios.post.mockRejectedValue(error);

            await expect(authenticationApi.logout('a-token')).rejects.toBe(error);
        });
    });

    describe('verifyToken', () => {
        it('is true when the service accepts the token', async () => {
            axios.post.mockResolvedValue({ data: {} });

            await expect(authenticationApi.verifyToken('a-token')).resolves.toBe(true);
            expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/tokens/verify`, {}, auth);
        });

        it('is false when the service rejects the token', async () => {
            axios.post.mockRejectedValue(new Error('Request failed with status code 401'));

            await expect(authenticationApi.verifyToken('a-token')).resolves.toBe(false);
        });
    });
});
