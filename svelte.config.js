import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');
const basePath = process.env.BASE_PATH;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		paths: {
			base: dev ? '' : basePath,
			relative: false
		},
		prerender: {
			// When using BASE_PATH, configure the origin properly
			origin: basePath ? 'https://terrence-giggy.github.io' : undefined,
			// Handle HTTP errors during prerendering
			handleHttpError: 'warn'
		}
	}
};

export default config;
