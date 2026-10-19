import { expectUrl, expectVisible } from './assertions';
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

    return {
        /** Goes to the page's URL. Where that lands is the destination's to check. */
        async open() {
            await openPath(page, path);
        },

        /** Reloads whatever page the browser is on. */
        async reload() {
            await page.reload();
        },

        async isShown() {
            const what = `showing ${name}`;

            await expectUrl(page, urlOf(path), what);
            await expectVisible(shown, what);
        },
    };
}
