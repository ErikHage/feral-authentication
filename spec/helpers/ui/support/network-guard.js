import { appUrl, authServiceUrl } from '../setup/config';

// The only places the browser may reach: the app, and the service the world
// cleans up through. Anything else could be a live service the app was built
// against (.env.production names one), and the suite must never write there
const allowedOrigins = new Set([new URL(appUrl).origin, new URL(authServiceUrl).origin]);

// The app loads Roboto from Google Fonts. Answered empty, so the browser falls
// back to another font rather than reaching out
const fontHosts = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);

/**
 * Keeps a browser context to the local app and service. Every other request
 * is aborted before it leaves the machine, and remembered. Routes set on a
 * page (the single sign-on stub) take precedence over these.
 *
 * Call `check()` when the context is done with: it throws, naming each
 * blocked request, so a test that strayed fails with the reason rather than
 * only the timeout that followed.
 */
export async function guardNetwork(context) {
    const blocked = [];

    await context.route('**/*', route => {
        const url = new URL(route.request().url());

        if (allowedOrigins.has(url.origin)) {
            return route.continue();
        }
        if (fontHosts.has(url.hostname)) {
            return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
        }
        blocked.push(`${route.request().method()} ${url.href}`);
        return route.abort('blockedbyclient');
    });

    return {
        blocked,

        check() {
            if (blocked.length > 0) {
                throw new Error(`${describeBlocked(blocked)} ${wiringHint}`);
            }
        },
    };
}

export const describeBlocked = blocked => 'The browser tried to reach a service other than '
    + `${authServiceUrl}, and was stopped:\n  ${blocked.join('\n  ')}\n`;

export const wiringHint = 'The app under test must call the service at UI_AUTH_SERVICE_URL. '
    + 'A production build (vite build, vite preview, npm run serve) reads .env.production, '
    + 'which names the live service: run the suite against the dev server '
    + '(./start-feral-authentication.sh) instead.';
