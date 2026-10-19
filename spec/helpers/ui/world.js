import { admin } from './setup/config';
import { createDrivers } from './drivers/drivers';

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
    return {
        /** So a page object can be handed the driver it drives. */
        drivers: createDrivers(page),

        /** The username and password behind `user: <name>`. */
        credentialsFor(name) {
            if (name === 'admin') {
                return { ...admin };
            }
            throw new Error(`no user called "${name}" in this test -- only the reserved "admin" exists so far`);
        },

        /** Nothing to forget or tear down yet: no test creates anything. */
        async cleanup() {},
    };
}
