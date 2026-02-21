---
description: Checklist for adding new Vercel routes/aliases to WallPlan
---

# Vercel Routing Checklist

When adding a new URL alias or route to the WallPlan project, follow these steps:

## Pre-flight checks

1. **Basepath awareness**: The project is deployed at `osovsky.com/wallplan/`. All redirect destinations must include `/wallplan/` prefix. Rewrites are project-relative and do NOT need the prefix.

2. **Trailing slash**: HTML pages with relative paths (`../style.css`, `calendar-ru.js`) require a trailing slash in the URL so the browser resolves paths correctly. Always add:
   - A **redirect** from `/path` → `/wallplan/path/` (with basepath + trailing slash)
   - A **rewrite** from `/path/` → `/path/index.html`

3. **Standalone folders**: When creating an alias folder (e.g. `@yka_yka`), always copy ALL files from the source folder. After copying, run `list_dir` to verify all files are present.

4. **Catch-all exclusion**: Update the catch-all rewrite regex to exclude the new path:
   ```
   /((?!for-kirill-specially-ru|@yka_yka|NEW_PATH).*)
   ```

## Post-deploy verification

5. **Test the URL** with and without trailing slash
6. **Check DevTools Network tab** for 404s on CSS, JS, fonts
7. **Check Telegram OG preview** via @WebPageBot

## PowerShell rules

8. Never use `&&` in PowerShell — use separate commands or `;`
