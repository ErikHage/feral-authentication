import { defineStore } from 'pinia';

const railKey = 'navigation-rail';

// The rail is a convenience, so storage that's blocked or full (a private
// window, cleared site data) only means the drawer starts expanded
function storedRail() {
    try {
        return localStorage.getItem(railKey) === 'true';
    } catch {
        return false;
    }
}

function storeRail(isRail) {
    try {
        localStorage.setItem(railKey, String(isRail));
    } catch {
        // the choice lasts until a reload
    }
}

/**
 * The side drawer: on a desktop, expanded or a rail of icons (remembered
 * across reloads); on a phone, open over the page or hidden (never
 * remembered). A layout store that never shows alerts, so it isn't exported
 * from `@/store` with the others.
 */
export const useNavigationStore = defineStore('navigation', {
    state: () => ({
        isRail: storedRail(),
        isOpenOnPhone: false,
    }),

    actions: {
        /** The hamburger: opens or closes the drawer on a phone, switches to or from the rail elsewhere. */
        toggle(isPhone) {
            if (isPhone) {
                this.isOpenOnPhone = !this.isOpenOnPhone;
                return;
            }
            this.setRail(!this.isRail);
        },

        setRail(isRail) {
            this.isRail = isRail;
            storeRail(isRail);
        },

        setOpenOnPhone(isOpen) {
            this.isOpenOnPhone = isOpen;
        },
    },
});
