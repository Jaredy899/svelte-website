<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	/**
	 * This function finds all code blocks on the page, wraps them if necessary,
	 * and adds a "Copy" button. It's designed to be idempotent, meaning it
	 * won't add duplicate wrappers or buttons if run multiple times.
	 */
	const setupCopyButtons = () => {
		const codeBlocks = document.querySelectorAll(
			'pre code, pre, .highlight code, .code-block code, .shiki-container pre',
		);

		codeBlocks.forEach(codeBlock => {
			let preElement =
				codeBlock.tagName === 'PRE'
					? (codeBlock as HTMLElement)
					: codeBlock.closest('pre');
			if (!preElement) {
				return;
			}

			// Check if this is inside a Shiki container
			const shikiContainer = preElement.closest('.shiki-container');
			let wrapper: HTMLElement | null = null;
			
			if (shikiContainer) {
				// For Shiki containers, use the container as the wrapper
				wrapper = shikiContainer as HTMLElement;
			} else {
				// Ensure the pre element is wrapped for non-Shiki code blocks
				wrapper = preElement.parentElement;
				if (!wrapper || !wrapper.classList.contains('code-block-wrapper')) {
					const newWrapper = document.createElement('div');
					newWrapper.className = 'code-block-wrapper';
					preElement.parentElement?.insertBefore(newWrapper, preElement);
					newWrapper.appendChild(preElement);
					wrapper = newWrapper;
				}
			}
			
			if (!wrapper) {
				return;
			}

			// Add the copy button if it doesn't exist.
			if (!wrapper.querySelector('.copy-code-button')) {
				const copySVG = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>`.trim();

				const checkSVG = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>`.trim();

				const btn = document.createElement('button');
				btn.className = 'copy-code-button';
				btn.setAttribute('aria-label', 'Copy code');
				btn.innerHTML = copySVG;

				btn.addEventListener('click', async () => {
					try {
						let text = '';
						
						// Handle Shiki containers differently
						if (shikiContainer) {
							// Get text from the currently visible theme
							const visiblePre = shikiContainer.querySelector('.shiki-light:not([style*="display: none"]) pre, .shiki-dark:not([style*="display: none"]) pre') as HTMLElement;
							if (visiblePre) {
								text = visiblePre.textContent || '';
							} else {
								// Fallback to any pre element in the container
								const anyPre = shikiContainer.querySelector('pre') as HTMLElement;
								text = anyPre?.textContent || '';
							}
						} else {
							// Original logic for non-Shiki code blocks
							const textElement = preElement.querySelector('code') || preElement;
							text = textElement.textContent || '';
						}
						
						await navigator.clipboard.writeText(text);

						btn.innerHTML =
							checkSVG + '<span class="btn-text">Copied!</span>';
						btn.classList.add('copied');

						setTimeout(() => {
							btn.innerHTML = copySVG;
							btn.classList.remove('copied');
						}, 2000);
					} catch (err) {
						console.error('Failed to copy code:', err);
					}
				});

				wrapper.appendChild(btn);
			}
		});
	};

	let observer: MutationObserver;

	onMount(() => {
		// Initial setup with delays to catch content that might render late.
		setupCopyButtons();
		setTimeout(setupCopyButtons, 100);
		setTimeout(setupCopyButtons, 1000);

		// Re-run the setup after each SvelteKit navigation.
		afterNavigate(() => {
			setTimeout(setupCopyButtons, 100);
		});

		// Use a MutationObserver to detect dynamically added content.
		observer = new MutationObserver(() => {
			setupCopyButtons();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});

	// Clean up the observer when the component is destroyed to prevent memory leaks.
	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});
</script>

<!-- This component provides only script and global styles. No HTML is rendered here. -->

<style>
	/*
    In Svelte, styles are scoped by default. To apply these styles globally
    (which is necessary for this component), we wrap them in :global().
  */
	:global(.code-block-wrapper),
	:global(.shiki-container) {
		position: relative;
		margin: 1rem 0;
		border-radius: 8px;
		background: var(--snippet-bg);
		border: 1px solid var(--snippet-border);
		overflow: hidden;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		padding: 0;
	}

	:global(.copy-code-button) {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.5rem;
		background: var(--copy-btn-bg);
		border: 1px solid var(--copy-btn-border);
		border-radius: 0.25rem;
		cursor: pointer;
		color: var(--copy-btn-text);
		transition: all 0.2s ease;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 20;
		backdrop-filter: blur(4px);
		pointer-events: auto;
		flex-shrink: 0;
		min-width: 1.75rem;
		min-height: 1.75rem;
		font-size: 0.875rem;
	}

	:global(.copy-code-button svg) {
		width: 1rem;
		height: 1rem;
		stroke: currentColor;
		fill: none;
	}

	:global(.copy-code-button .btn-text) {
		margin-left: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	:global(.copy-code-button:hover) {
		background: var(--copy-btn-hover-bg);
		border-color: var(--copy-btn-hover-border);
		color: var(--copy-btn-hover-text);
		transform: translateY(-1px);
	}

	:global(.copy-code-button.copied) {
		background: var(--copy-btn-success-bg);
		border-color: var(--copy-btn-success-border);
		color: var(--copy-btn-success-text);
	}

	:global(.copy-code-button:focus) {
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}

	:global(.code-block-wrapper pre),
	:global(.shiki-container pre) {
		margin: 0 !important;
		padding: 1rem !important;
		padding-right: 6rem !important;
		background: transparent !important;
		border-radius: 0 !important;
		overflow-x: auto !important;
		border: none !important;
		box-shadow: none !important;
		display: block !important;
		width: 100% !important;
		box-sizing: border-box !important;
		white-space: pre !important;
		word-wrap: normal !important;
		font-family: 'Fira Code', monospace !important;
		position: relative !important;
		scrollbar-width: thin !important;
	}

	:global(.code-block-wrapper pre code),
	:global(.shiki-container pre code) {
		font-family: 'Fira Code', monospace !important;
		font-size: 0.875rem !important;
		line-height: 1.5 !important;
		color: var(--snippet-text) !important;
		background: none !important;
		padding: 0 !important;
		border-radius: 0 !important;
		border: none !important;
		display: block !important;
		white-space: pre !important;
		word-break: normal !important;
		overflow-wrap: normal !important;
		padding-right: 0 !important;
	}


</style>