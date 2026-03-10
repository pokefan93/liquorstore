# Bella Vista Wine & Spirits Homepage

This is a fully static homepage build for GitHub Pages.

## Structure

- `index.html` contains the homepage markup
- `css/styles.css` contains all site styling
- `js/main.js` contains the mobile menu, scroll state, reveal effects, and the "Open today" utility text
- `assets/` contains the local image set used on the page

## GitHub Pages deployment

Because this site is plain static HTML, CSS, and JS, there is no build step.

1. Push this repository to GitHub.
2. In GitHub, open `Settings` > `Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Choose your main branch and the `/ (root)` folder.
5. Save, then wait for GitHub Pages to publish the site.

## Custom domain note

- This repo already includes a `CNAME` file.
- If you are publishing Bella Vista Wine & Spirits on a different domain, update `CNAME` before going live.
- All internal section links and asset paths are relative, so the homepage will work on GitHub Pages root hosting or repository-path hosting.
