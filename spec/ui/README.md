# UI tests

Playwright tests that drive the app in a real browser, against a running app and a running feral-authentication-service. Specs read as prose: they call page objects with `"name: value"` strings, and drivers underneath own every locator and assertion.

## Run

```bash
./start-feral-authentication.sh   # the suite never starts anything itself; the service needs MySQL
npm run test:ui
./stop-feral-authentication.sh
```

The suite logs in as a real admin. Copy `spec/helpers/ui/.env.ui.example` to `spec/helpers/ui/.env.ui` (gitignored), and fill in `UI_ADMIN_USERNAME` and `UI_ADMIN_PASSWORD`. The user needs the `feral/admin` role.

Any value can also be set from the shell, which wins over the file:
- `UI_APP_URL` (default `http://localhost:5173/auth/`)
- `UI_AUTH_SERVICE_URL` (default `http://localhost:8003/api/feral-authentication-service/v0`)
- `UI_APPLICATION_ID` (default: the app's own `VITE_APPLICATION_ID`, the application scoped `feral`)

A preflight runs before any test. It checks that the service answers, that the admin can log in and list users, and that the app answers. If any of that fails, it stops with a message naming the fix.

Failures save a screenshot and a trace under `test-results/`. Open a trace with `npx playwright show-trace <path>/trace.zip`, or open the HTML report with `npx playwright show-report`.

## Layers

```
spec/ui/**/*.spec.js             what the app should do, in "name: value" strings
   |
helpers/ui/ui-test.js            the one import: Playwright's test, with a fixture per page object
   |
helpers/ui/pages/*-page.js       a page and the actions on it; parses the strings and delegates
helpers/ui/components/*.js       reusable parts of a page, exposed as page properties
   |
helpers/ui/drivers/*-driver.js   locators and every assertion, as typed methods
   |
helpers/ui/drivers/assertions.js the only importer of expect
```

- `helpers/ui/world.js` holds what a spec has named, shared by every page object in a test, and the drivers.
- `helpers/ui/params.js` holds shared parameter declarations.
- `helpers/ui/setup/` holds the config and the preflight.
- `helpers/ui/support/service-client.js` is the only place that calls `fetch`. The preflight uses it, and so does cleanup, which deletes the users and roles a test added.
- Steps are parsed with [`@feral-auth/ts-simple-dsl`](https://github.com/ErikHage/ts-simple-dsl).

**Every page has `open`, `reload` and `checkIsShown`.** `pages/routed-page.js` supplies them, along with the components each part of the app shows:
- every page has `appBar`;
- dashboard pages add `dashboardNav`;
- admin pages add `adminNav`.

`drivers/routed-page-driver.js` checks a page by its URL and by something only that page shows. A page with nothing else to do yet lives in `pages/dashboard-pages.js` or `pages/admin-pages.js`, and its driver is a plain routed one in `drivers/drivers.js`. It moves to its own files once it gets steps of its own, as most pages now have.

**Logging in is a step.** `loginPage.logIn('user: admin')` logs in as the account in `.env.ui`. `admin` is a reserved name; any other is a user the test added. Add `'password: wrong'` to log in with a wrong password. Nothing is restored from a saved session: the app keeps "logged in" only in memory, so any page load goes through the login page. Each test logs in for itself.

**Users and roles a test adds are made up, and deleted afterwards.**
- `usersAdminPage.addUser('user: bob')` adds a user through the page, with details unique to the run (the username is `ui-bob-<random>`).
- `rolesAdminPage.addRole('role: tester')` adds a role titled `tester`, under the scope `ui-<random>`.

The world remembers each one under its alias, so later steps can name it. When the test ends, pass or fail, the world deletes everything it named, newest first, over the API, as the admin. It clears a user's roles and applications first, since the service's tables don't cascade. A spec never cleans up for itself.

Steps that only use a role or an application can name existing ones: `'role: feral/admin'` (scope/title), and `'application: Feral Authentication'` (its listed name).

**Switching users: load the app afresh, unless that's the point.** Logging out clears nothing from the app's stores, so the next user to log in sees what the last one loaded wherever their own request is refused. After `appBar.logOut()`, check `loginPage.checkIsShown()` (logging out has finished once the login page shows), then call `loginPage.open()` before logging in as someone else. Only a test that pins the leftovers skips the reload. Without the check, the reload can beat the logout: the fresh login page then finds the old token, and redirects to the applications page half a second later, wherever the test has got to.

**Another device.** A test that needs the same user logged in twice asks for `anotherDevice`: a second browser context with its own `loginPage` and `applicationPickerPage`. It shares the test's names, so `anotherDevice.loginPage.logIn('user: bob')` logs in as the same bob.

**Checking that something is absent.** A page that shows nothing looks the same before its data arrives as after. A driver checking for absence first waits for the service call that would have filled the page to be answered (`drivers/service-calls.js` records the app's calls from the start of each test), then reads the page once.

The admin tables show 10 rows a page, in no particular order, so their drivers switch to showing all rows first (`drivers/data-table.js`). Selects that list many options render only those in view, so a driver opens one and scrolls its menu until the option is there. Typing would bring it into view too, but it selects every option that matches on the way.

**Navigation is checked at the destination.** A step that clicks (`loginPage.logIn(...)`) asserts nothing about where it leads. The next step checks that, by URL and heading (`applicationPickerPage.checkIsShown()`).

**Known-wrong behaviour is pinned, not skipped.** A `// DocumentsCurrentBehavior:` comment above the test says what happens today and what should happen. The test title and the step name the intent. The driver method names today's behaviour, so it's the one thing a fix renames. Every pin also gets a row in the project's pinned-behaviour backlog.

## Rules

1. **Specs are prose.** A spec's only import is `ui-test`. Its steps take `"name: value"` strings and nothing else.
2. **Assertions and locators live in the drivers.** Page and component objects have neither.
3. **Only `drivers/assertions.js` imports `expect`. Only `support/service-client.js` calls `fetch`.** The browser makes the app's own calls.
4. **Nothing imports from `src/`.** A driver re-states any rule it checks. That way a change in the app breaks a test instead of silently agreeing with it.
5. **The database is shared and never reset.** A test names what it creates uniquely, and never relies on another test's data. Tests run one at a time by default, but must also pass with `--workers` above 1.

## Adding a test

1. Write the spec first, in the steps you wish existed: `await loginPage.logIn('user: admin')`.
2. Add the step to the page or component object. Declare its parameters with `parseDslArgs` (use `parseDslArgs(args, {})` for none), then delegate to the driver.
3. Add the driver method, with its locators and assertions. A new kind of check becomes a primitive in `assertions.js`.
4. For a new page, add a driver in `drivers/drivers.js` and a fixture in `ui-test.js`. For a new component, add a driver too, and expose the component as a property of each page that contains it.
5. Run it. A misspelled parameter fails only at runtime.
6. Check the layering:
   ```bash
   grep -rnE "\bexpect\(|import \{[^}]*\bexpect\b" spec/ui spec/helpers/ui   # assertions.js only
   grep -rn "getBy\|locator(" spec/ui spec/helpers/ui/pages spec/helpers/ui/components  # nothing
   grep -rn "^import" spec/ui                                                 # ui-test only
   grep -rn "fetch(" spec/ui spec/helpers/ui                                  # service-client only
   ```
