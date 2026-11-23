import { createPinia, setActivePinia } from 'pinia';
import { useNavigationStore } from '@/store/navigation';

// A store created after whatever is in storage, as on a reload
function freshStore() {
    setActivePinia(createPinia());
    return useNavigationStore();
}

describe('useNavigationStore', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('starts expanded, and closed on a phone', () => {
        const store = freshStore();

        expect(store.isRail).toBe(false);
        expect(store.isOpenOnPhone).toBe(false);
    });

    describe('on a desktop', () => {
        it('switches to the rail and back, leaving the phone drawer alone', () => {
            const store = freshStore();

            store.toggle(false);
            expect(store.isRail).toBe(true);

            store.toggle(false);
            expect(store.isRail).toBe(false);
            expect(store.isOpenOnPhone).toBe(false);
        });

        it('remembers the rail across a reload', () => {
            freshStore().toggle(false);

            expect(localStorage.getItem('navigation-rail')).toBe('true');
            expect(freshStore().isRail).toBe(true);
        });

        it('remembers switching back from the rail', () => {
            localStorage.setItem('navigation-rail', 'true');
            freshStore().toggle(false);

            expect(freshStore().isRail).toBe(false);
        });
    });

    describe('on a phone', () => {
        it('opens and closes, leaving the rail alone', () => {
            const store = freshStore();

            store.toggle(true);
            expect(store.isOpenOnPhone).toBe(true);

            store.toggle(true);
            expect(store.isOpenOnPhone).toBe(false);
            expect(store.isRail).toBe(false);
        });

        it('never remembers being open', () => {
            freshStore().toggle(true);

            expect(freshStore().isOpenOnPhone).toBe(false);
        });
    });

    describe('with storage blocked', () => {
        beforeEach(() => {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('blocked');
            });
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('blocked');
            });
        });

        it('starts expanded, and still switches to the rail', () => {
            const store = freshStore();
            expect(store.isRail).toBe(false);

            store.toggle(false);

            expect(store.isRail).toBe(true);
        });
    });
});
