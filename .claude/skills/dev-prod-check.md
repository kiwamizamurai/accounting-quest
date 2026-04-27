---
name: dev-prod-check
description: Audit the codebase for discrepancies between dev and production environments. Use this skill when the user asks to check for dev/prod differences, deployment issues, broken assets in production, or environment-specific bugs. Also trigger when the user mentions that something works locally but fails after deployment.
---

# Dev/Prod Environment Discrepancy Check

Detect issues that cause the app to behave differently between the Vite dev server and the production build deployed to GitHub Pages.

## Why this matters

This project uses Vite with a conditional base path: `/` in dev, `/accounting-quest/` in production (see `vite.config.ts`). Any asset path that ignores `import.meta.env.BASE_URL` will resolve correctly in dev but 404 in production. This class of bug is silent in development and only surfaces after deployment.

## Checks to perform

Run every check below. Report results at the end.

### 1. Hardcoded asset paths

Search `src/**/*.ts` for paths that reference public-directory assets with a leading slash — e.g. `/audio/`, `/images/`, `/fonts/`, `/assets/`.

Focus on Phaser loader calls (`load.audio()`, `load.image()`, `load.spritesheet()`, `load.atlas()`) and any `fetch()` or `new URL()` pointing at local resources.

Correct pattern:
```typescript
// Bad — works in dev, 404 in prod
scene.load.audio(key, `/audio/${key}.mp3`);

// Good — respects base path in every environment
scene.load.audio(key, `${import.meta.env.BASE_URL}audio/${key}.mp3`);
```

### 2. Vite client type definition

Verify that `src/vite-env.d.ts` exists and contains `/// <reference types="vite/client" />`. Without it, TypeScript does not recognize `import.meta.env` and developers resort to `@ts-expect-error` or `@ts-ignore`, which masks the real fix.

### 3. Production build success

Run `npm run build`. Confirm it exits with code 0 and produces output in `dist/`.

### 4. Built asset path verification

After a successful build:
- Confirm that public-folder assets (audio/, images/, etc.) are copied into `dist/`.
- Grep the built JS in `dist/assets/` for asset references and verify they include the production base path `/accounting-quest/`.

### 5. HTML base path consistency

Open `dist/index.html` and confirm that `<script>` and `<link>` tags reference paths starting with `/accounting-quest/`.

### 6. Environment-gated code

Search for `import.meta.env.DEV` and `import.meta.env.PROD` usage. For each occurrence, verify:
- Dev-only code (test bridges, debug tools) is tree-shaken out of the production bundle.
- No `@ts-expect-error` or `@ts-ignore` is used on `import.meta.env` references (a sign the type definition in check 2 is missing).

### 7. Hardcoded localhost URLs

Search `src/**/*.ts` for `localhost` or `127.0.0.1`. These should not appear outside of test files.

## Report format

For each check:
- **Pass** — one-line confirmation.
- **Fail** — file path, line number, what's wrong, and a concrete fix.

End with a summary: total issues found and severity (critical / warning / info).
