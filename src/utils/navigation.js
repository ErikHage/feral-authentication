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
