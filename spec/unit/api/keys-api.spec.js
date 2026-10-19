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

    it('shifts the expiration by the UTC offset twice', async () => {
        // current behavior: convertToUTC reads the UTC fields of the local time,
        // then builds a local date from them, so toISOString shifts it again.
        // 10:00 in New York (UTC-5 in December) is 15:00Z, but 20:00Z is sent
        axios.post.mockResolvedValue({ data: {} });

        await keysApi.generateKey('a-token', 'my-key', '2026-12-01T10:00');

        expect(axios.post.mock.calls[0][1].expiration).toBe('2026-12-01T20:00:00.000Z');
    });

    it('shifts a summer expiration by the daylight offset twice', async () => {
        // current behavior, as above: 10:00 EDT (UTC-4) is 14:00Z, but 18:00Z is sent
        axios.post.mockResolvedValue({ data: {} });

        await keysApi.generateKey('a-token', 'my-key', '2026-07-01T10:00');

        expect(axios.post.mock.calls[0][1].expiration).toBe('2026-07-01T18:00:00.000Z');
    });
});
