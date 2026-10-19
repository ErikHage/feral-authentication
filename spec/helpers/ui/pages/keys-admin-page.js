import { parseDslArgs } from '@feral-auth/ts-simple-dsl';

import { key } from '../params';
import { adminComponents, routedPageSteps } from './routed-page';

/**
 * The keys admin page, in words. A key generated here gets a made-up name,
 * unique to the run, and stays in the database: keys can't be deleted.
 */
export function createKeysAdminPage(world, driver) {
    return {
        ...adminComponents(world),
        ...routedPageSteps(driver),

        /** Generates a new `key` through the Generate dialog. */
        async generateKey(...args) {
            const params = parseDslArgs(args, { key: key() });

            await driver.generateKey(world.newKey(params.key));
        },

        /** The `key` is listed. */
        async checkKeyIsListed(...args) {
            const params = parseDslArgs(args, { key: key() });

            await driver.listsKey(world.keyNamed(params.key));
        },

        /** The `key`'s expiration is listed as the moment that was entered, in UTC. */
        async checkExpirationIsAsEntered(...args) {
            const params = parseDslArgs(args, { key: key() });

            await driver.listsTheExpirationShiftedTwice(world.keyNamed(params.key));
        },

        /** Opens the Generate dialog, and leaves it empty. No parameters. */
        async startGeneratingKey(...args) {
            parseDslArgs(args, {});

            await driver.openGenerateDialog();
        },

        /** Generate stays disabled until the dialog is filled in. No parameters. */
        async checkCannotGenerateYet(...args) {
            parseDslArgs(args, {});

            await driver.canGenerateFromAnEmptyForm();
        },
    };
}
