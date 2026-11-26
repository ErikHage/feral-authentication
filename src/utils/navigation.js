import { views } from './constants';

const dashboard = page => `${views.dashboard.path}/${page}`;
const admin = page => `${views.admin.path}/${page}`;

/**
 * The side drawer's sections, and each one's links, in order, as FrAppShell
 * takes them. Each link's value is its route's name. The user's Applications
 * is "My Applications", so that no two links share a name
 */
export const sections = [
    {
        label: 'User',
        items: [
            { value: 'ApplicationPicker', title: 'My Applications', icon: 'mdi-apps', to: dashboard('applications') },
            { value: 'UserProfile', title: 'Profile', icon: 'mdi-account', to: dashboard('profile') },
            { value: 'ActiveSessions', title: 'Sessions', icon: 'mdi-devices', to: dashboard('sessions') },
        ],
    },
    {
        label: 'Admin',
        items: [
            { value: 'RolesAdmin', title: 'Roles', icon: 'mdi-shield-account', to: admin('roles') },
            { value: 'UsersAdmin', title: 'Users', icon: 'mdi-account-multiple', to: admin('users') },
            { value: 'AuthorizationAdmin', title: 'Authorization', icon: 'mdi-account-key', to: admin('authorization') },
            { value: 'KeysAdmin', title: 'Keys', icon: 'mdi-key', to: admin('keys') },
            { value: 'ApplicationsAdmin', title: 'Applications', icon: 'mdi-application-cog', to: admin('applications') },
        ],
    },
];

const links = sections.flatMap(section => section.items);

/**
 * The value of the link the path is at, or under: an application's details
 * are under Applications. Empty for a path under none of them
 */
export function activeViewFor(path) {
    const link = links
        .filter(item => path === item.to || path.startsWith(`${item.to}/`))
        .sort((a, b) => b.to.length - a.to.length)[0];
    return link?.value ?? '';
}

/**
 * The breadcrumbs for the path, as FrBreadcrumbs takes them, as the
 * component playground draws them: the page's section, a link to its first
 * page, then the page itself. On an application's details, Applications is
 * a link back to the list, and the application follows it. `application` is
 * the one the store last selected; it names the crumb only once it's this
 * page's, so until the page has loaded it, or for an unknown id, the trail
 * stops at Applications. On a `small` screen, the last crumb alone. Empty
 * for a path under no link
 */
export function crumbsFor(path, application, small) {
    const value = activeViewFor(path);
    const section = sections.find(each => each.items.some(item => item.value === value));
    if (!section) {
        return [];
    }

    const link = section.items.find(item => item.value === value);
    const crumbs = [
        { title: section.label, to: section.items[0].to },
        path === link.to ? { title: link.title } : { title: link.title, to: link.to },
    ];
    if (application && path === `${link.to}/${application.applicationId}`) {
        crumbs.push({ title: application.applicationName });
    }

    return small ? crumbs.slice(-1) : crumbs;
}
