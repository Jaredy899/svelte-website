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
			'pre code, pre, .highlight code, .code-block code',
		);

		codeBlocks.forEach(codeBlock => {
			let preElement =
				codeBlock.tagName === 'PRE'
					? (codeBlock as HTMLElement)
					: codeBlock.closest('pre');
			if (!preElement) {
				return;
			}

			// Ensure the pre element is wrapped.
			let wrapper = preElement.parentElement;
			if (!wrapper || !wrapper.classList.contains('code-block-wrapper')) {
				const newWrapper = document.createElement('div');
				newWrapper.className = 'code-block-wrapper';
				preElement.parentElement?.insertBefore(newWrapper, preElement);
				newWrapper.appendChild(preElement);
				wrapper = newWrapper;
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
						const textElement =
							preElement.querySelector('code') || preElement;
						const text = textElement.textContent || '';
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
	:global(.code-block-wrapper) {
		position: relative;
		margin: 1rem 0;
		border-radius: 0.5rem;
		background: transparent;
		border: none;
		overflow: visible;
		box-shadow: none;
		padding: 0;
	}

	:global(.copy-code-button) {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.25rem;
		cursor: pointer;
		color: #e2e8f0;
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
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.3);
		color: #ffffff;
		transform: translateY(-1px);
	}

	:global(.copy-code-button.copied) {
		background: rgba(34, 197, 94, 0.2);
		border-color: rgba(34, 197, 94, 0.4);
		color: #22c55e;
	}

	:global(.copy-code-button:focus) {
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
	}

	:global(.code-block-wrapper pre) {
		margin: 0 !important;
		padding: 1rem !important;
		padding-right: 6rem !important;
		background: #1a1a1a !important;
		border-radius: 8px !important;
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

	:global(.code-block-wrapper pre code) {
		font-family: 'Fira Code', monospace !important;
		font-size: 0.875rem !important;
		line-height: 1.5 !important;
		color: #fff !important;
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

	:global(.dark .code-block-wrapper pre) {
		background: #1a1a1a !important;
	}

	:global(.dark .code-block-wrapper pre code) {
		color: #fff !important;
	}

	:global(html:not(.dark) .code-block-wrapper pre) {
		background: #1a1a1a !important;
	}

	:global(html:not(.dark) .code-block-wrapper pre code) {
		color: #fff !important;
	}

	:global(.dark .copy-code-button),
	:global(html:not(.dark) .copy-code-button) {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
		color: #e2e8f0;
	}

	:global(.dark .copy-code-button:hover),
	:global(html:not(.dark) .copy-code-button:hover) {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.3);
		color: #ffffff;
	}

	:global(.dark .copy-code-button.copied),
	:global(html:not(.dark) .copy-code-button.copied) {
		background: rgba(34, 197, 94, 0.2);
		border-color: rgba(34, 197, 94, 0.4);
		color: #22c55e;
	}
</style>