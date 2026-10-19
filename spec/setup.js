import { enableAutoUnmount } from '@vue/test-utils';

// Vuetify components observe their size, which jsdom doesn't implement
class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverStub;

// Dialogs render into document.body, so a wrapper left mounted would leave
// its dialogs behind for the next test
enableAutoUnmount(afterEach);
