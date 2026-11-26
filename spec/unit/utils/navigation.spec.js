import { activeViewFor, crumbsFor, sections } from '@/utils/navigation';

describe('navigation', () => {
    it('links every page, under User and Admin, each to its route by name', () => {
        expect(sections.map(section => section.label)).toEqual(['User', 'Admin']);
        expect(sections.flatMap(section => section.items.map(item => [item.title, item.to]))).toEqual([
            ['My Applications', '/dashboard/applications'],
            ['Profile', '/dashboard/profile'],
            ['Sessions', '/dashboard/sessions'],
            ['Roles', '/admin/roles'],
            ['Users', '/admin/users'],
            ['Authorization', '/admin/authorization'],
            ['Keys', '/admin/keys'],
            ['Applications', '/admin/applications'],
        ]);
    });

    it.each([
        ['/dashboard/applications', 'ApplicationPicker'],
        ['/admin/applications', 'ApplicationsAdmin'],
        ['/admin/applications/app-1', 'ApplicationsAdmin'],
        ['/admin/roles', 'RolesAdmin'],
        ['/admin/rolesx', ''],
        ['/login', ''],
    ])('makes %s the link %j', (path, value) => {
        expect(activeViewFor(path)).toBe(value);
    });

    describe('crumbsFor', () => {
        const game = { applicationId: 'app-1', applicationName: 'Game' };
        const user = { title: 'User', to: '/dashboard/applications' };
        const admin = { title: 'Admin', to: '/admin/roles' };
        const applications = { title: 'Applications', to: '/admin/applications' };

        it.each([
            ['/dashboard/applications', [user, { title: 'My Applications' }]],
            ['/dashboard/sessions', [user, { title: 'Sessions' }]],
            ['/admin/roles', [admin, { title: 'Roles' }]],
            ['/admin/applications', [admin, { title: 'Applications' }]],
        ])("leads from the section, linked to its first page, to %s's page", (path, crumbs) => {
            expect(crumbsFor(path, game, false)).toEqual(crumbs);
        });

        it('leads from Applications, as a link, to the application on its details', () => {
            expect(crumbsFor('/admin/applications/app-1', game, false))
                .toEqual([admin, applications, { title: 'Game' }]);
        });

        it("stops at Applications until the page's application has loaded, or for an unknown id", () => {
            expect(crumbsFor('/admin/applications/app-1', undefined, false)).toEqual([admin, applications]);
        });

        it("stops at Applications when the last application selected is another page's", () => {
            expect(crumbsFor('/admin/applications/app-2', game, false)).toEqual([admin, applications]);
        });

        it.each([
            ['/dashboard/profile', [{ title: 'Profile' }]],
            ['/admin/applications/app-1', [{ title: 'Game' }]],
        ])('shows only the last crumb for %s on a small screen', (path, crumbs) => {
            expect(crumbsFor(path, game, true)).toEqual(crumbs);
        });

        it.each(['/login', '/unknown'])('has none for %s, under no link', path => {
            expect(crumbsFor(path, game, false)).toEqual([]);
        });
    });
});
