import { enableAutoUnmount } from '@vue/test-utils';
import { appToast } from '@/store/notifications';

// Vuetify components observe their size, which jsdom doesn't implement
class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverStub;

// Vuetify 4's overlays (dialogs, menus) follow the visual viewport, which
// jsdom doesn't implement. This one is the window, never zoomed or scrolled
class VisualViewportStub extends EventTarget {
    get width() { return window.innerWidth; }
    get height() { return window.innerHeight; }
    offsetLeft = 0;
    offsetTop = 0;
    pageLeft = 0;
    pageTop = 0;
    scale = 1;
}

globalThis.visualViewport = globalThis.visualViewport || new VisualViewportStub();

// Dialogs render into document.body, so a wrapper left mounted would leave
// its dialogs behind for the next test
enableAutoUnmount(afterEach);

// The app's messages are toasts on the library's one queue, which keeps them
// between tests. Spied on afresh for each test, so spec/helpers/notifications
// reads only what that test said. Some specs restore every mock themselves,
// so these keep their own handles
let spies = [];

beforeEach(() => {
    spies = [vi.spyOn(appToast, 'show'), vi.spyOn(appToast, 'clear')];
});

afterEach(() => {
    spies.forEach(spy => spy.mockRestore());
    appToast.clear();
});
