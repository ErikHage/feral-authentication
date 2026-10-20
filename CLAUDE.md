# feral-authentication

## Never touch the live service

`.env.production` points the app at the live feral-authentication-service
(`https://theferalrooster.com/...`). Any production build (`vite build`, `vite preview`,
`npm run serve`, the Dockerfile) talks to it.

- Run the UI suite (`npm run test:ui`) only against the dev server that
  `./start-feral-authentication.sh` starts. Never against `vite preview` or any other build.
- Never send requests to `theferalrooster.com`: no `curl`, no scripts, no tests.
- To check a production bundle, build it with `VITE_AUTH_SERVICE_V0_BASE_URL` overridden to a local
  or `https://example.invalid` URL, and grep the output for `theferalrooster` before serving it.

On 2026-10-20 a UI run against `vite preview` wrote test data to the live service. The suite now
guards against it (see "Safety" in `spec/ui/README.md`). Don't weaken those guards.

## Tests

- `npm run test:unit`: Vitest, in `spec/unit/`.
- `npm run test:ui`: Playwright, in `spec/ui/`. It needs `./start-feral-authentication.sh`
  (the service needs MySQL), and credentials in the gitignored `spec/helpers/ui/.env.ui`.
- `npm run lint` and `npm run build`.
