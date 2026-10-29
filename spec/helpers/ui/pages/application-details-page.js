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

        /** Opens the Rotate Key dialog, choosing nothing. No parameters. */
        async startRotatingKey(...args) {
            parseDslArgs(args, {});

            await driver.openRotateDialog();
        },

        /** Chooses the `key` in the open Rotate Key dialog, without saving. */
        async chooseNewKey(...args) {
            const params = parseDslArgs(args, { key: key() });

            await driver.chooseNewKey(world.keyNamed(params.key).keyName);
        },

        /** The Rotate Key dialog's Save stays disabled until a key is chosen. No parameters. */
        async checkCannotRotateYet(...args) {
            parseDslArgs(args, {});

            await driver.cannotRotateWithoutAKey();
        },

        /** Once the `key` is chosen, the Rotate Key dialog's Save is enabled. */
        async checkCanRotateTo(...args) {
            const params = parseDslArgs(args, { key: key() });

            await driver.canRotate(world.keyNamed(params.key).keyName);
        },

        /** Types a new name, called `name`, without saving. */
        async changeName(...args) {
            const params = parseDslArgs(args, { name: required() });

            await driver.changeName(world.newApplicationName(params.name));
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

        /** After `save`: the `application` now has the new name called `name`. */
        async checkNameIsSaved(...args) {
            const params = parseDslArgs(args, { application: application(), name: required() });

            await driver.savesTheName(world.applicationNamed(params.application), world.applicationNameCalled(params.name));
        },
    };
}
