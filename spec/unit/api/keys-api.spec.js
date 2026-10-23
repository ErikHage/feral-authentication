import axios from 'axios';
import keysApi from '@/api/keys-api';

vi.mock('axios');

const baseUrl = 'https://api.test/feral-authentication-service/v0';
const auth = { headers: { 'x-feral-auth-token': 'a-token' } };

// vitest.config.js runs every spec in America/New_York
describe('keysApi', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

    it('fetches every key pair', async () => {
        axios.get.mockResolvedValue({ data: [{ keyId: 'key-1' }] });

        const keys = await keysApi.fetchKeys('a-token');

        expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/keys`, auth);
        expect(keys).toEqual([{ keyId: 'key-1' }]);
    });

    it('generates a key pair with the given name', async () => {
        axios.post.mockResolvedValue({ data: { keyId: 'key-1' } });

        const key = await keysApi.generateKey('a-token', 'my-key', '2026-12-01T10:00');

        expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/keys/generate`, {
            keyName: 'my-key',
            expiration: expect.any(String),
        }, auth);
        expect(key).toEqual({ keyId: 'key-1' });
    });

    it('sends the expiration, entered in local time, as UTC', async () => {
        // 10:00 in New York (UTC-5 in December) is 15:00Z
        axios.post.mockResolvedValue({ data: {} });

        await keysApi.generateKey('a-token', 'my-key', '2026-12-01T10:00');

        expect(axios.post.mock.calls[0][1].expiration).toBe('2026-12-01T15:00:00.000Z');
    });

    it('sends a summer expiration as UTC, by the daylight offset', async () => {
        // 10:00 EDT (UTC-4) is 14:00Z
        axios.post.mockResolvedValue({ data: {} });

        await keysApi.generateKey('a-token', 'my-key', '2026-07-01T10:00');

        expect(axios.post.mock.calls[0][1].expiration).toBe('2026-07-01T14:00:00.000Z');
    });
});
