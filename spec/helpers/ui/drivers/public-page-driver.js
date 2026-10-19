import { createRoutedPageDriver } from './routed-page-driver';

/** The public landing page, at the app's root, as Playwright sees it. */
export function createPublicPageDriver(page) {
    const loginLink = page.getByRole('main').getByRole('link', { name: 'Login' });

    return {
        ...createRoutedPageDriver(page, {
            name: 'the public page',
            path: '',
            marker: main => main.getByRole('link', { name: 'Login' }),
        }),

        async goToLogin() {
            await loginLink.click();
        },
    };
}
