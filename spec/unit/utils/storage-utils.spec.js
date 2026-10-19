import storageUtils from '@/utils/storage-utils';

describe('storageUtils', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('stores the token under feral-token', () => {
        storageUtils.setTokenInLocalStorage('a-token');

        expect(localStorage.getItem('feral-token')).toBe('a-token');
    });

    it('loads the stored token', () => {
        localStorage.setItem('feral-token', 'a-token');

        expect(storageUtils.tryToLoadTokenFromStorage()).toBe('a-token');
    });

    it('loads null when no token is stored', () => {
        expect(storageUtils.tryToLoadTokenFromStorage()).toBeNull();
    });

    it('loads null for an empty token', () => {
        localStorage.setItem('feral-token', '');

        expect(storageUtils.tryToLoadTokenFromStorage()).toBeNull();
    });

    it('clears the stored token', () => {
        localStorage.setItem('feral-token', 'a-token');

        storageUtils.clearTokenFromStorage();

        expect(localStorage.getItem('feral-token')).toBeNull();
    });
});
