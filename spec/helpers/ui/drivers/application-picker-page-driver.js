import { expectUrl, expectVisible } from './assertions';
import { urlOf } from './urls';

/** The dashboard's applications page, as Playwright sees it. */
export function createApplicationPickerPageDriver(page) {
    // Rendered once the user's applications have loaded
    const heading = page.getByRole('heading', { name: 'Available Applications' });

    return {
        async isShown() {
            const what = 'showing the applications page';

            await expectUrl(page, urlOf('dashboard/applications'), what);
            await expectVisible(heading, what);
        },
    };
}
