<!--
Project-specific instructions for AI coding agents.
Keep this file short and focused: explain architecture, critical workflows, key patterns, and exact places to change.
-->
# Copilot instructions for pgbpl-ionic (Ionic + Angular + Capacitor)

Quick summary
- Ionic + Angular (Angular 20, Ionic Angular 8) single-page app using Capacitor for native builds.
- Firebase (v12) Realtime Database + Auth are used for backend storage and authentication.
- Leaflet is used for maps and markers. Points are stored under the Realtime DB path `points`.

Where to look first (big picture)
- Routing and app entry: `src/app/app-routing.module.ts` (lazy-loads `tabs` as `/main`, `splashscreen` at root).
- Main UI shell: `src/app/tabs/` (tabs module and `tabs-routing.module.ts`) — child routes mount pages like `maps`, `tab1/2/3` under `/main/*`.
- Firebase wiring: `src/app/firebase.service.ts` (initializes app, exports `auth` and `database`), used by `AuthService` and `DataService`.
- Auth and data access: `src/app/auth.service.ts` (firebase auth), `src/app/data.service.ts` (Realtime DB CRUD for `points`).
- Map UI and UX: `src/app/maps/` (maps.page.ts) — Leaflet map, markers, and popups with inline DOM in popup HTML (important for event wiring).

Key data flows and contracts
- Points: stored under `points` in the Realtime DB. Each point is an object with at least `{ name: string, coordinates: string }` where `coordinates` is a comma-separated "lat, lng" string. See `DataService.savePoint()` and `getPoints()`.
- Auth: `AuthService` exposes `login(email, password)` and `register(email, password)` which return the Firebase promise results from `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`.
- Firebase objects are exported from `firebase.service.ts` as `auth` and `database` and consumed directly by other services.

Notable implementation patterns (important for edits)
- Lazy-loaded pages: Most routes use Angular lazy loading (e.g. `loadChildren: () => import('./maps/maps.module').then(m => m.MapsPageModule)`). When adding pages, follow the same pattern.
- Leaflet popups use raw HTML and then DOM querySelector to attach button listeners inside `maps.page.ts` (see `.getElement()?.querySelector(...)` in `ionViewDidEnter`). Keep popup markup's `data-point-id` attributes when changing popups so event handlers can find the id.
- Some pages are standalone (`standalone: true`) while most follow the classic NgModule pattern. Be careful when refactoring — match the target file's pattern (module vs standalone component).
- Components use Angular's `inject()` in places instead of constructor DI in several pages (e.g. `private dataService = inject(DataService)`). Either is acceptable but be consistent in a file.
- Styling: project-wide SCSS; schematics are configured to use SCSS (`angular.json` + schematics). Use `src/global.scss` and `src/theme/variables.scss` for global styles.

Developer workflows (commands, Windows PowerShell examples)
- Install dependencies
```powershell
npm install
```
- Local dev (Angular dev server)
```powershell
npm start   # runs `ng serve` (development config by default)
```
- Build production bundle (outputs to `www` per angular.json)
```powershell
npm run build
```
- Run unit tests (Karma)
```powershell
npm test
```
- Lint
```powershell
npm run lint
```
- Capacitor native flow (after `npm run build`)
```powershell
npx cap sync
npx cap open android   # or `ios` on macOS
```

Project-specific gotchas and tips
- Map marker identity: code matches markers by LatLng equality when deleting; editing how coordinates are stored/rounded may break deletion logic. See `maps.page.ts` (deletePoint and loadPoints).
- Popup event wiring is implemented at `popupopen`; if switching to Angular native components inside popups you must re-attach events or move actions to global map click handlers.
- DataService returns native Firebase snapshots or Promises — callers expect either a `.val()` (for `getPoint`) or plain JS object (for `getPoints` which wraps `onValue` and resolves the raw object). Search `getPoint(...).then(... .val())` patterns.
- Firebase config lives in `src/environments/environment.ts`. The file currently contains a non-production config. Treat these values as secrets for public repos.

Where to change for common tasks
- Add new page/tab: `ng generate component/page-name --style=scss` or use Ionic CLI; update `src/app/tabs/tabs-routing.module.ts` and `app-routing.module.ts` with lazy route.
- Modify points shape/storage: change `DataService` and update `maps.page.ts`, `createpoint.page.ts`, `editpoint.page.ts` accordingly.
- Change auth flow: modify `AuthService` and update pages `login`/`register`.

Tests and CI notes
- Karma is configured (see `karma.conf.js`) and `angular.json` has a `test.ci` configuration with watch disabled — CI should call `ng test --watch=false` or `npm test` using CI environment.

If uncertain, follow these first steps
1. Run `npm install` then `npm start` to reproduce the dev server and inspect runtime behavior at `http://localhost:4200`.
2. Open `src/app/maps/maps.page.ts` and `src/app/data.service.ts` to understand the map<>DB interactions before changing UI or DB shape.
3. When adding routes, mirror existing lazy-loading style and update `tabs-routing.module.ts` if the page is a tab.

If anything in this file is unclear or you'd like me to expand with code examples or a short checklist for PR reviewers, tell me which section to expand.
