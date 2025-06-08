<script lang="ts">
	import { onMount } from 'svelte';

	// In Svelte, a `let` variable is reactive.
	// Assignments to `isDark` will update the component's view.
	let isDark = false;

	const toggleTheme = () => {
		// Direct assignment triggers reactivity.
		isDark = !isDark;
		// The rest of the logic is standard JavaScript and remains the same.
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	};

	// `onMount` runs after the component is added to the DOM.
	onMount(() => {
		// Check for saved theme preference or default to light mode
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		
		isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
		
		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});
</script>

<button
	class="theme-toggle"
	aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
	on:click={toggleTheme}
>
	<!-- Use an #if block for conditional rendering -->
	{#if isDark}
		<svg
			class="sun"
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="12" cy="12" r="5" />
			<line x1="12" y1="1" x2="12" y2="3" />
			<line x1="12" y1="21" x2="12" y2="23" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="1" y1="12" x2="3" y2="12" />
			<line x1="21" y1="12" x2="23" y2="12" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		</svg>
	{:else}
		<svg
			class="moon"
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		background: none;
		border: none;
		color: var(--text);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: background-color 0.2s ease, opacity 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.theme-toggle:hover {
		background-color: rgba(128, 128, 128, 0.1);
		opacity: 0.8;
	}

	.theme-toggle:focus {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	.sun,
	.moon {
		width: 24px;
		height: 24px;
	}
</style>