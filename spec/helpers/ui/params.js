import { optional, required } from '@feral-auth/ts-simple-dsl';

/**
 * Parameter declarations shared across the page and component objects, so
 * every one asks the same question with the same word.
 */

/** Who a step acts as: the reserved `admin` (from .env.ui), or a user the test created. */
export const user = () => required();

/** Which password to log in with: the user's own, or a wrong one. Defaults to correct. */
export const password = () => optional().allowedValues('correct', 'wrong').withDefault('correct');
