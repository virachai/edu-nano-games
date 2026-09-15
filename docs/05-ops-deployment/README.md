# Deployment Workflow: GitHub Pages

This document outlines the standard deployment workflow for `nano-games` to GitHub Pages.

---

## 1. Current Deployment (Static Workflow)

Since this project is currently built with **Pure HTML5/CSS/Vanilla JS** with no build step:

- **Source Location:** Files are served directly from the repository root (e.g., `index.html`, `games/`, `shared/`).
- **Deployment:** GitHub Actions are configured to serve the files directly from the repository root. No complex bundling is required.

---

## 2. Future Deployment (Build-Step/Bundler Workflow)

If the project introduces a Bundler (e.g., Vite) or Minification:

- **Build Output:** Files must be generated into a dedicated directory: `dist/` or `build/`.
- **Version Control:** The build directory must be added to `.gitignore`.
- **CI/CD Workflow:**
  1. Push to `main`.
  2. GitHub Actions run installation and build (`npm run build`).
  3. Artifacts are placed in `dist/`.
  4. Workflow uses `actions/upload-pages-artifact` to deploy the `dist/` folder to GitHub Pages.

---

## 3. Mandatory Requirements & Precautions

### A. Relative Links (Mandatory)

Since the site is hosted on a subpath (`https://<username>.github.io/<repository-name>/`):

- **Do not use absolute paths** (e.g., `/games/...`).
- **Always use relative paths** (e.g., `./games/...` or `../shared/...`).

### B. `.nojekyll` File

To prevent GitHub Pages from pre-processing the site with Jekyll (which breaks files starting with `_`):

- Ensure an empty file named `.nojekyll` exists at the root of the deployed artifact (root of `dist/` or repository root depending on workflow).
