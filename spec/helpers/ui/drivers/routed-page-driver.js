import { expectThat, expectUrl, expectVisible } from './assertions';
import { openPath, urlOf } from './urls';

/**
 * What every page the app routes to has, as Playwright sees it: its URL, and
 * `marker`, something on it that only that page shows, found inside the
 * page's main area. A page driver spreads this and adds its own methods.
 *
 * `name` reads as part of a sentence, e.g. "the users admin page".
 */
export function createRoutedPageDriver(page, { name, path, marker }) {
    const shown = marker(page.getByRole('main'));

    // Every URL the browser has been at since the last reload. The router's own
    // changes count: Playwright reports those as navigations too
    let urlsSinceReload = [];
    const recordUrl = frame => {
        if (frame === page.mainFrame()) {
            urlsSinceReload.push(frame.url());
        }
    };

    return {
        /** Goes to the page's URL. Where that lands is the destination's to check. */
        async open() {
            await openPath(page, path);
        },

        /** Reloads whatever page the browser is on, noting each URL it passes through. */
        async reload() {
            urlsSinceReload = [];
            page.off('framenavigated', recordUrl);
            page.on('framenavigated', recordUrl);
            await page.reload();
        },

        async isShown() {
            const what = `showing ${name}`;

            await expectUrl(page, urlOf(path), what);
            await expectVisible(shown, what);
        },

        /** After `reload`: shown, without the browser having been anywhere else, such as Login. */
        async isShownAfterReload() {
            const what = `reloading ${name}`;

            await expectUrl(page, urlOf(path), what);
            await expectVisible(shown, what);
            page.off('framenavigated', recordUrl);
            const elsewhere = urlsSinceReload.filter(url => url !== urlOf(path));
            expectThat(elsewhere.length === 0, `to stay at ${urlOf(path)}`, `went to ${elsewhere.join(', ')}`, what);
        },
    };
}
