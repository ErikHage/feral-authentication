import axios from 'axios';
import sessionsApi from '@/api/sessions-api';

vi.mock('axios');

const baseUrl = 'https://api.test/feral-authentication-service/v0';
const auth = { headers: { 'x-feral-auth-token': 'a-token' } };

describe('sessionsApi', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it("fetches the current user's sessions", async () => {
        axios.get.mockResolvedValue({ data: [{ sessionId: 'session-1' }] });

        const sessions = await sessionsApi.fetchSessionsForCurrentUser('a-token');

        expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/sessions/current`, auth);
        expect(sessions).toEqual([{ sessionId: 'session-1' }]);
    });

    it('deletes a session', async () => {
        axios.delete.mockResolvedValue({ data: {} });

        await sessionsApi.deleteSessionById('a-token', 'session-1');

        expect(axios.delete).toHaveBeenCalledWith(`${baseUrl}/sessions/session-1`, auth);
    });
});
