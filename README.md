# CommunityPortal

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.20.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Provision administrator accounts

First create the two users manually in Firebase Authentication. Then authenticate the
Firebase Admin SDK (for example, set `GOOGLE_APPLICATION_CREDENTIALS` to a service
account key) and run:

```bash
npm run provision:admins -- \
  --super-admin-email super-admin@example.com \
  --admin-email admin@example.com
```

Optional `--super-admin-name` and `--admin-name` values set the display names in the
Firestore profiles. The script is idempotent: it creates an active profile and trusted
Firebase Authentication claims only when that role does not already exist, and
synchronizes claims for an existing active account. It never creates Authentication
users and refuses to replace an existing user's different role. Both accounts can use
the normal webapp login after the script finishes; a user who was already signed in
must sign out and back in to receive the new claims.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
