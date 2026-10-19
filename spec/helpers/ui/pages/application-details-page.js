import { optional, parseDslArgs, required } from '@feral-auth/ts-simple-dsl';

import { application, key } from '../params';
import { adminComponents } from './routed-page';

/**
 * An application's details page, in words. It's reached from the
 * applications page, through `applicationsAdminPage.openDetails`.
 */
export function createApplicationDetailsPage(world, driver) {
    return {
        ...adminComponents(world),

        /**
         * The page shows the `application`, signed with the `key`, and
         * after a rotation, the optional `previousKey`.
         */
        async checkShowsApplication(...args) {
            const params = parseDslArgs(args, { application: application(), key: key(), previousKey: optional() });

            await driver.showsApplication(
                world.applicationNamed(params.application),
                world.keyNamed(params.key).keyName,
                params.previousKey === undefined ? undefined : world.keyNamed(params.previousKey).keyName);
        },

        /** Rotates the application to the `key`, through the Rotate Key dialog. */
        async rotateKey(...args) {
            const params = parseDslArgs(args, { key: key() });

            await driver.rotateKey(world.keyNamed(params.key).keyName);
        },

        /** Types a new `name`, without saving. */
        async changeName(...args) {
            const params = parseDslArgs(args, { name: required() });

            await driver.changeName(params.name);
        },

        /** Empties the name, without saving. No parameters. */
        async clearName(...args) {
            parseDslArgs(args, {});

            await driver.changeName('');
        },

        /** Presses Save. No parameters. */
        async save(...args) {
            parseDslArgs(args, {});

            await driver.save();
        },

        /** The name is required, and Save is disabled. No parameters. */
        async checkCannotSave(...args) {
            parseDslArgs(args, {});

            await driver.cannotSaveAnEmptyName();
        },

        /** After `save`: the `application` now has the new `name`. */
        async checkNameIsSaved(...args) {
            const params = parseDslArgs(args, { application: application(), name: required() });

            await driver.discardsTheChange(world.applicationNamed(params.application), params.name);
        },
    };
}
