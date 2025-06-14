import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mdx from '@mdx-js/rollup';

export default defineConfig({
	plugins: [
		mdx({
			// Configure MDX to work with our current setup
		}),
		tailwindcss(), 
		sveltekit()
	]
});
