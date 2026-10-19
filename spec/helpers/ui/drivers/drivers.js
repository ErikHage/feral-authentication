import { createApplicationPickerPageDriver } from './application-picker-page-driver';
import { createLoginPageDriver } from './login-page-driver';

/** Builds each driver once per test, over Playwright's `page`. */
export function createDrivers(page) {
    return {
        applicationPickerPage: createApplicationPickerPageDriver(page),
        loginPage: createLoginPageDriver(page),
    };
}
