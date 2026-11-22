# AtomIQ Privacy Policy (public page)

The public, web-page version of the AtomIQ Privacy Policy that Google Play Console asks for
(App content > Privacy policy) and that the app links to.

Live URL once Pages is on: `https://<github-user>.github.io/atomiq-privacy-policy/`

## Files

- `index.html`: the whole policy, one static HTML page (no login, no JavaScript, no PDF), generated.
- `icon.png`: the app icon shown at the top, copied from the app repo.
- `.nojekyll`: tells GitHub Pages to serve the files as they are.
- `scripts/build.mjs`: regenerates `index.html` from the app's own policy text.

## Updating

The text is NOT edited here. It comes from `content/legal/privacy.ts` and `constants/legal.ts` in the
AtomIQ app repo, so the page and the in-app policy stay identical.

```bash
node scripts/build.mjs ../AtomIQ     # path to the app repo (default: ../AtomIQ)
git add -A && git commit -m "privacy policy vX.Y" && git push
```

Do this whenever the app's policy changes (and bump `LEGAL_VERSION` there first).

## Hosting on GitHub Pages

1. Push this repo to GitHub (public).
2. Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Wait a minute, then open the URL above. It is served over HTTPS.
4. Paste that URL into Play Console > App content > Privacy policy, and into the app if it links out.
