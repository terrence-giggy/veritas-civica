# Deployment Workflow

This workflow provides specialized instructions for build and deployment issues in the Veritas Civica project.

## When to Use This Workflow

Use this workflow when the user requests:
- Build configuration changes
- Deployment troubleshooting
- GitHub Pages setup or issues
- Static site generation optimization
- Build performance improvements
- Environment-specific configurations

## Deployment Process

### Phase 1: Build Preparation
1. Ensure all dependencies are properly installed
2. Verify build configuration is correct
3. Check environment variables and settings
4. Validate static adapter configuration

### Phase 2: Build Execution
1. Run production build with proper BASE_PATH
2. Verify build output in `build/` directory
3. Test build with preview server
4. Check for any build warnings or errors

### Phase 3: Deployment
1. Deploy to GitHub Pages automatically via GitHub Actions
2. Verify deployment success
3. Test live site functionality
4. Monitor for any deployment-specific issues

## Key Configuration

### GitHub Pages Build
```bash
BASE_PATH=/veritas-civica npm run build
```

### SvelteKit Configuration
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter(),
    paths: {
      base: process.env.BASE_PATH || ''
    }
  }
};
```

## Validation Requirements
- Build completes without errors
- Static files generated correctly
- Site loads properly on GitHub Pages
- All routes work with BASE_PATH
- No broken links or missing assets