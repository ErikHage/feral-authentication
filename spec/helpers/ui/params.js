import { optional, required } from '@feral-auth/ts-simple-dsl';

/**
 * Parameter declarations shared across the page and component objects, so
 * every one asks the same question with the same word.
 */

/** Who a step acts as: the reserved `admin` (from .env.ui), or a user the test created. */
export const user = () => required();

/**
 * A role the test added, by its alias, which is also its title. Where a step
 * only uses a role, it can also name an existing one as `scope/title`, e.g.
 * `feral/admin`.
 */
export const role = () => required();

/**
 * An application the test added, by its alias; or, where a step only uses
 * it, an existing one by the name it's listed under, e.g. `Feral
 * Authentication`.
 */
export const application = () => required();

/** A key pair the test generated, by its alias. */
export const key = () => required();

/** Which password to log in with: the user's own, or a wrong one. Defaults to correct. */
export const password = () => optional().allowedValues('correct', 'wrong').withDefault('correct');
