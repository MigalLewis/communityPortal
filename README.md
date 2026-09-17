# CommunityPortal

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.20.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

Copy `.env.example` to `.env.local` and fill in your Firebase web app configuration.
The local file and generated `src/environments/firebase.config.generated.ts` are
ignored by Git.

Use `npm start`, `npm run build`, or `npm run watch`: these generate the Firebase
config before Angular runs. `npm test` also generates the config. Restart after
changing `.env.local`. Environment variables override the local file; CI uses the
`FIREBASE_*` GitHub repository variables for both preview and production builds.
Missing required values stop startup/build with an actionable error. Do not store
Admin SDK credentials or service account keys in these frontend environment values.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `npm test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Provision administrator accounts

First create the two users manually in Firebase Authentication. Then authenticate the
Firebase Admin SDK (for example, set `GOOGLE_APPLICATION_CREDENTIALS` to a service
account key) and run:

```bash
npm run provision:admins -- \
  --super-admin-email super-admin@example.com \
  --admin-email admin@example.com
```

Use actual emails of existing Authentication users. Install the backend dependencies
first with `npm --prefix functions ci` if they are not already installed.

The target project is selected from `--project`, then `FIREBASE_PROJECT_ID`, then
`.env.local`, then `.firebaserc`. To explicitly select a project, append
`--project your-project-id`. The script prints its target project and uses the
`(default)` Firestore database. Admin SDK credentials must have access to both
Authentication and Firestore in that project; frontend API keys are not sufficient.

Names are optional: `--super-admin-name` and `--admin-name` override the Authentication
display name or the default administrator labels. The script creates or repairs an
active `users/{Authentication UID}` profile, preserves its creation time, synchronizes
trusted claims, and reads the profile back to verify the write. It never creates
Authentication users, overwrites a different role, or silently substitutes another
existing administrator for the supplied email. If another active account already
holds that role, it stops with an error.

Successful runs print `Verified active profile: users/...` for each account. If the
script fails, inspect the error rather than assuming provisioning completed. Sign
out and back in after successful provisioning to receive the new claims.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
# Community content migration

Import the legacy committee, portfolio, event, and project constants with deterministic document IDs. Always select the Firebase project explicitly; preview and validate first:

```bash
npm --prefix functions run migrate:community-content -- --project your-project-id --dry-run
npm --prefix functions run migrate:community-content -- --project your-project-id
```

The importer uses merge upserts and stable slug IDs, so it is safe to run repeatedly without creating duplicate documents.
