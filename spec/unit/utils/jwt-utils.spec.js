import { tokenFor } from '../../helpers/tokens';
import jwtUtils from '@/utils/jwt-utils';

describe('jwtUtils.parseActorToken', () => {
    it('returns the token payload', () => {
        const payload = { userId: 'user-1', sessionId: 'session-1', roles: ['feral/admin'] };

        expect(jwtUtils.parseActorToken(tokenFor(payload))).toEqual(payload);
    });

    it('returns null for a null token', () => {
        expect(jwtUtils.parseActorToken(null)).toBeNull();
    });

    it('throws for a token that is not a JWT', () => {
        expect(() => jwtUtils.parseActorToken('not-a-jwt')).toThrow();
    });
});
