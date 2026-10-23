import { createRoutedPageDriver } from './routed-page-driver';

/** What any unknown URL shows, as Playwright sees it. `no-such-page` stands for one. */
export function createNotFoundPageDriver(page) {
    const homeLink = page.getByRole('main').getByRole('link', { name: 'Go to the home page' });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the not-found page',
            path: 'no-such-page',
            marker: main => main.getByRole('heading', { name: 'Page not found' }),
        }),

        async goHome() {
            await homeLink.click();
        },
    };
}
