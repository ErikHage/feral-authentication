// Vuetify components observe their size, which jsdom doesn't implement
class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverStub;
