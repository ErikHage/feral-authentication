import { randomUUID } from 'node:crypto';

import { admin } from './setup/config';
import { createDrivers } from './drivers/drivers';
import { deleteUser, listUsers, login, logout } from './support/service-client';

const suffix = () => randomUUID().slice(0, 8);
const capitalized = word => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Deletes the users with these usernames, over the API, as the admin. Best
 * effort: a user the test already deleted is skipped, and a failure is
 * reported but never thrown, so it can't hide the test's own result.
 */
async function deleteUsersNamed(usernames) {
    const session = await login(admin.username, admin.password);
    const token = session.body?.token;
    if (!token) {
        console.warn(`cleanup: couldn't log in as the admin, so these users remain: ${usernames.join(', ')}`);
        return;
    }

    const listed = await listUsers(token);
    const users = Array.isArray(listed.body) ? listed.body : [];
    for (const username of usernames) {
        const found = users.find(user => user.username === username);
        if (found) {
            const deleted = await deleteUser(token, found.userId);
            if (deleted.status !== 204) {
                console.warn(`cleanup: couldn't delete the user ${username}: ${deleted.status ?? deleted.error}`);
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

    function userNamed(alias) {
        const user = usersByAlias.get(alias);
        if (user === undefined) {
            throw new Error(`no user called "${alias}" in this test -- add one first with usersAdminPage.addUser('user: ${alias}')`);
        }
        return { ...user };
    }

    return {
        /** So a page object can be handed the driver it drives. */
        drivers: createDrivers(page),

        /**
         * Makes up the details of a new user called `alias`, unique to this
         * run, and remembers them. From here on cleanup deletes any user with
         * that username, so name the user before the step that creates it.
         */
        newUser(alias) {
            if (alias === 'admin' || usersByAlias.has(alias)) {
                throw new Error(`there is already a user called "${alias}" in this test`);
            }
            const username = `ui-${alias}-${suffix()}`;
            usersByAlias.set(alias, {
                username,
                password: `pw-${suffix()}`,
                firstName: capitalized(alias),
                lastName: 'Tester',
                email: `${username}@example.test`,
            });
            return userNamed(alias);
        },

        userNamed,

        /** The username and password behind `user: <name>`. */
        credentialsFor(name) {
            if (name === 'admin') {
                return { ...admin };
            }
            const { username, password } = userNamed(name);
            return { username, password };
        },

        /** Deletes the users this test named, newest first, and forgets them. */
        async cleanup() {
            const usernames = [...usersByAlias.values()].map(user => user.username).reverse();
            usersByAlias.clear();

            if (usernames.length > 0) {
                await deleteUsersNamed(usernames);
            }
        },
    };
}
