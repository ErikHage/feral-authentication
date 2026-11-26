import { expectCount, expectText } from './assertions';

/**
 * The breadcrumbs in the toolbar, as Playwright sees them: the banner's
 * list, one item per crumb (the dividers between them are hidden from it).
 * A crumb that leads somewhere is a link; the page's own is plain text. The
 * first crumb is the page's section, User or Admin, which leads to that
 * section's first page. They're there only once someone is logged in.
 */
export function createBreadcrumbsDriver(page) {
    const crumbs = page.getByRole('banner').getByRole('list').getByRole('listitem');
    const links = crumbs.getByRole('link');
    const linkTo = name => crumbs.getByRole('link', { name, exact: true });

    return {
        async goToSection(section) {
            await linkTo(section).click();
        },

        async goToApplications() {
            await linkTo('Applications').click();
        },

        async leadsToPage(section, pageTitle) {
            const what = `the breadcrumbs leading from ${section} to ${pageTitle}`;

            await expectText(crumbs, [section, pageTitle], what);
            await expectText(links, [section], what);
        },

        async leadsToApplication({ applicationName }) {
            const what = `the breadcrumbs leading to the application ${applicationName}`;

            await expectText(crumbs, ['Admin', 'Applications', applicationName], what);
            await expectText(links, ['Admin', 'Applications'], what);
        },

        async showsOnlyPage(pageTitle) {
            const what = `the breadcrumbs showing ${pageTitle} alone`;

            await expectText(crumbs, [pageTitle], what);
            await expectCount(links, 0, what);
        },
    };
}
