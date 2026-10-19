import { randomUUID } from 'node:crypto';

import { admin } from './setup/config';
import { createDrivers } from './drivers/drivers';
import {
    clearUserApplications, clearUserRoles, deleteRole, deleteUser, listRoles, listUsers, login, logout,
} from './support/service-client';

const suffix = () => randomUUID().slice(0, 8);
const failed = reply => reply.error !== undefined || reply.status >= 300;
const capitalized = word => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * How cleanup finds and deletes each kind of thing a test adds: none of them
 * has an id the test can see, so each is looked up in its list first.
 *
 * The service's tables have no foreign keys, so nothing blocks a delete, and
 * nothing cascades from it either: a user's grants are cleared first, or
 * they'd stay behind.
 */
const kinds = {
    user: {
        list: listUsers,
        matches: (user, listed) => listed.username === user.username,
        async remove(token, listed) {
            const replies = [
                await clearUserRoles(token, listed.userId),
                await clearUserApplications(token, listed.userId),
                await deleteUser(token, listed.userId),
            ];
            return replies.find(failed) ?? replies[2];
        },
        describe: user => `the user ${user.username}`,
    },
    role: {
        list: listRoles,
        matches: (role, listed) => listed.scope === role.scope && listed.title === role.title,
        remove: (token, listed) => deleteRole(token, listed.roleId),
        describe: role => `the role ${role.scope}/${role.title}`,
    },
};

/**
 * Deletes what a test added, in the order given, over the API, as the
 * admin. Best effort: something the test already deleted is skipped, and a
 * failure is reported but never thrown, so it can't hide the test's own
 * result.
 */
async function deleteAll(added) {
    const remaining = () => added.map(({ kind, details }) => kinds[kind].describe(details)).join(', ');

    const session = await login(admin.username, admin.password);
    const token = session.body?.token;
    if (!token) {
        console.warn(`cleanup: couldn't log in as the admin, so these remain: ${remaining()}`);
        return;
    }

    const listed = {};
    for (const { kind, details } of added) {
        if (listed[kind] === undefined) {
            const reply = await kinds[kind].list(token);
            listed[kind] = Array.isArray(reply.body) ? reply.body : [];
        }
        const found = listed[kind].find(each => kinds[kind].matches(details, each));
        if (found) {
            const deleted = await kinds[kind].remove(token, found);
            if (failed(deleted)) {
                console.warn(`cleanup: couldn't delete ${kinds[kind].describe(details)}: ${deleted.status ?? deleted.error}`);
            }
        }
    }

    await logout(token);
}

/**
 * What a spec has named so far, plus the drivers for this test.
 *
 * Page and component objects are stateless; a user named on one page logs
 * in on another, so the names live here. `admin` is reserved: it resolves
 * to the account in .env.ui.
 *
 * One world per test, built over Playwright's `page`.
 */
export function createWorld(page) {
    const usersByAlias = new Map();
    const rolesByAlias = new Map();
    // Newest first, the order cleanup deletes in
    const added = [];

    function named(known, alias, what, step) {
        const value = known.get(alias);
        if (value === undefined) {
            throw new Error(`no ${what} called "${alias}" in this test -- add one first with ${step}('${what}: ${alias}')`);
        }
        return { ...value };
    }

    function remember(kind, known, alias, details) {
        if (known.has(alias) || (kind === 'user' && alias === 'admin')) {
            throw new Error(`there is already a ${kind} called "${alias}" in this test`);
        }
        known.set(alias, details);
        added.unshift({ kind, details });
        return { ...details };
    }

    const userNamed = alias => named(usersByAlias, alias, 'user', 'usersAdminPage.addUser');
    const roleNamed = alias => named(rolesByAlias, alias, 'role', 'rolesAdminPage.addRole');

    return {
        /** So a page object can be handed the driver it drives. */
        drivers: createDrivers(page),

        /**
         * Makes up the details of a new user called `alias`, unique to this
         * run, and remembers them. From here on cleanup deletes any user with
         * that username, so name the user before the step that adds it.
         */
        newUser(alias) {
            const username = `ui-${alias}-${suffix()}`;
            return remember('user', usersByAlias, alias, {
                username,
                password: `pw-${suffix()}`,
                firstName: capitalized(alias),
                lastName: 'Tester',
                email: `${username}@example.test`,
            });
        },

        userNamed,

        /** As `newUser`, for a role: the title is `alias`, under a scope unique to this run. */
        newRole(alias) {
            if (alias.includes('/')) {
                throw new Error(`"${alias}" names an existing role; a new role's alias is just its title`);
            }
            return remember('role', rolesByAlias, alias, {
                scope: `ui-${suffix()}`,
                title: alias,
                description: `Added by the UI tests as ${alias}`,
            });
        },

        roleNamed,

        /** The username and password behind `user: <name>`. */
        credentialsFor(name) {
            if (name === 'admin') {
                return { ...admin };
            }
            const { username, password } = userNamed(name);
            return { username, password };
        },

        /** Deletes what this test named, newest first, and forgets it. */
        async cleanup() {
            const toDelete = added.splice(0, added.length);
            usersByAlias.clear();
            rolesByAlias.clear();

            if (toDelete.length > 0) {
                await deleteAll(toDelete);
            }
        },
    };
}
