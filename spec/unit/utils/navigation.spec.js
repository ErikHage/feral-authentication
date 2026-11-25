import { activeViewFor, sections } from '@/utils/navigation';

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
});
