import { enableAutoUnmount } from '@vue/test-utils';

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
