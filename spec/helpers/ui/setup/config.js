import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Where the suite finds the app and the service, and who it logs in as. The
 * URL defaults match ./start-feral-authentication.sh. Everything can be set
 * from the shell; values in spec/helpers/ui/.env.ui fill in the rest.
 */

// Playwright compiles the suite to CommonJS (the package isn't "type":
// "module"), so __dirname is defined and import.meta is not
const envFile = path.join(__dirname, '..', '.env.ui');

// Values already set in the shell win over the file
if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
}

const withTrailingSlash = url => (url.endsWith('/') ? url : `${url}/`);

// baseURL must end in a slash, or page.goto('login') drops the app's base path
export const appUrl = withTrailingSlash(
    process.env.UI_APP_URL || 'http://localhost:5173/auth/');

export const authServiceUrl = process.env.UI_AUTH_SERVICE_URL
    || 'http://localhost:8003/api/feral-authentication-service/v0';

// The application the app logs in to (its VITE_APPLICATION_ID). It must be
// the one scoped `feral`, or the admin's token carries no admin role
export const applicationId = process.env.UI_APPLICATION_ID
    || 'e3304693-9a9f-48a0-ad03-f45bb3b73884';

/** The reserved `user: admin`. Empty when .env.ui is missing; the preflight says so. */
export const admin = {
    username: process.env.UI_ADMIN_USERNAME || '',
    password: process.env.UI_ADMIN_PASSWORD || '',
};

export const envFileHint = 'Copy spec/helpers/ui/.env.ui.example to spec/helpers/ui/.env.ui and fill it in.';
