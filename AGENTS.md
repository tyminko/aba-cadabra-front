AGENTS.md

This file gives coding agents a concise, action-oriented guide to work on this repository. It complements `README.md` and should be treated as living documentation.

## Setup commands

- Install deps: `npm install`
- Start dev server: `npm run serve`
- Build production bundle: `npm run build`
- Lint and fix: `npm run lint`
- Deploy (Firebase Hosting): `npm run deploy`

Notes:
- Scripts set `NODE_OPTIONS=--openssl-legacy-provider` to support the current toolchain.
- Vue CLI v4 is used; the app targets Vue 2.

## Project overview

- Framework: Vue 2 + Vue Router + Vuex
- Tooling: Vue CLI 4, ESLint (standard config), Tailwind CSS 1.x, Sass
- Hosting: Firebase (see `firebase.json`)
- Entry points:
  - App bootstrap: `src/main.js`
  - Root component: `src/App.vue`
  - Router: `src/router.js`
  - Store: `src/store.js`

## Working conventions

- Prefer small, focused Vue components in `src/views` and `src/views/components` subfolders.
- Keep business logic in `src/lib` and Vuex where appropriate.
- Avoid introducing Vue 3 APIs; this is a Vue 2 codebase.

## Code style

- JavaScript/Vue (Vue 2 single-file components)
- ESLint: `@vue/eslint-config-standard` (StandardJS rules)
- Formatting preferences:
  - Single quotes
  - No unnecessary semicolons
  - Two-space indentation
  - Prefer explicit, descriptive variable and function names

Run checks locally: `npm run lint`.

## Testing

- No test runner is configured in `package.json` currently. If you add tests, document the commands here and wire them into CI before merging.

## Dev environment tips

- Use the Vue CLI service commands (`serve`, `build`, `lint`) defined in `package.json`.
- TailwindCSS styles live under `src/styles`; global import is in `src/styles/main.scss` and wired through Vue CLI.
- Assets for production builds are emitted to `dist/`.

## Deployment

- Firebase Hosting is configured via `firebase.json`.
- Deploy with: `npm run deploy` (requires Firebase CLI auth and project setup).

## Security considerations

- Review any use of `localStorage` and `firebase` interactions under `src/lib`.
- Sanitize user-provided HTML with `dompurify` (already a dependency) when rendering dynamic content.

## PR instructions

- Keep changes focused and incremental.
- Before pushing:
  - `npm run lint`
  - `npm run build` to verify production build succeeds
- Mention any schema or data shape changes in the PR description.

## References

- This file follows the open format described at `https://agents.md/`. See their overview and examples for agent-focused guidance.


