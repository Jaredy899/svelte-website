<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Create a dispatcher to send events to the parent component.
	const dispatch = createEventDispatcher();

	// This function will be called on click and will dispatch the 'toggle' event.
	const handleToggle = () => {
		dispatch('toggle');
	};
</script>

<button
	class="sidebar-toggle"
	aria-label="Toggle sidebar"
	on:click={handleToggle}
>
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>
</button>

<style>
	.sidebar-toggle {
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

	.sidebar-toggle:hover {
		background-color: rgba(128, 128, 128, 0.1);
		opacity: 0.8;
	}

	.sidebar-toggle:focus {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}
</style>