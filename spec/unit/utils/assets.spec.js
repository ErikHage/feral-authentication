import { getAssetPath } from '@/utils/assets';

describe('getAssetPath', () => {
    it('joins a relative path to the asset base path', () => {
        expect(getAssetPath('ai-cardinal.jpg')).toBe('/assets-test/ai-cardinal.jpg');
    });

    it('does not double the slash for a path starting with /', () => {
        expect(getAssetPath('/img/logo.png')).toBe('/assets-test/img/logo.png');
    });
});
