// Vuetify reads the window's width when it's created, which mountWithPlugins
// does for each mount. jsdom's window is 1024px wide: Vuetify's md, so the
// desktop layout
const desktopWidth = window.innerWidth;

// Mounts made after this get the phone layout ($vuetify.display.smAndDown)
export function onAPhone() {
    window.innerWidth = 500;
}

export function onADesktop() {
    window.innerWidth = desktopWidth;
}
