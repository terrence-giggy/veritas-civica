# GitHub Pages Setup Instructions

This repository now has a GitHub Actions workflow configured to automatically deploy to GitHub Pages. To complete the setup, you need to enable GitHub Pages in your repository settings.

## Steps to Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/terrence-giggy/veritas-civica`
2. Click on the **Settings** tab
3. Scroll down to the **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically trigger on the next push to the `main` or `master` branch

## What Happens Next

- The workflow will build your SvelteKit application
- It will deploy the static files to GitHub Pages
- Your site will be available at: `https://terrence-giggy.github.io/veritas-civica/`

## Workflow Details

The deployment workflow (`.github/workflows/deploy.yml`) will:
- Install Node.js and dependencies
- Build the SvelteKit app with the correct base path
- Deploy to GitHub Pages using the official GitHub Actions

## Local Development

For local development, the app continues to work normally:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

The base path configuration automatically adjusts between development (no base path) and production (with `/veritas-civica` base path).