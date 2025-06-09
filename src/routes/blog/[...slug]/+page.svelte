<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import SidebarToggle from '$lib/components/SidebarToggle.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import JCLogo from '$lib/components/JCLogo.svelte';
	import BlogSidebar from '$lib/components/BlogSidebar.svelte';
	import CopyButtonScript from '$lib/components/CopyButtonScript.svelte';

	export let data: PageData;
	$: post = data.post;

	let sidebarOpen = false;
	let headerVisible = true;
	let lastScrollY = 0;

	$: pageTitle = post.title ? `${post.title} - Jared Cervantes` : 'Blog Post - Jared Cervantes';
	$: pageDescription = post.description || 'Blog post by Jared Cervantes';

	const toggleSidebar = () => {
		sidebarOpen = !sidebarOpen;
	};

	const closeSidebar = () => {
		sidebarOpen = false;
	};

	const handleScroll = () => {
		const currentScrollY = window.scrollY;
		
		if (currentScrollY < 100) {
			// Always show header when near the top
			headerVisible = true;
		} else if (currentScrollY > lastScrollY) {
			// Scrolling down - hide header
			headerVisible = false;
		} else {
			// Scrolling up - show header
			headerVisible = true;
		}
		
		lastScrollY = currentScrollY;
	};

	const getDateTimeString = (dateInput?: string | Date): string => {
		if (!dateInput) return '';
		
		// If it's already a date-only string in YYYY-MM-DD format, return it as-is
		if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
			return dateInput;
		}
		
		let date: Date;
		if (dateInput instanceof Date) {
			date = dateInput;
		} else {
			date = new Date(dateInput);
		}
		
		// Check if date is valid
		if (isNaN(date.getTime())) {
			return '';
		}
		
		return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
	};

	const formatDate = (dateInput?: string | Date) => {
		if (!dateInput) return '';
		
		let date: Date;
		if (dateInput instanceof Date) {
			date = dateInput;
		} else {
			// Handle date-only strings (YYYY-MM-DD) to avoid timezone issues
			if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
				// For date-only strings, create date in local timezone to avoid UTC conversion
				const [year, month, day] = dateInput.split('-').map(Number);
				date = new Date(year, month - 1, day); // month is 0-indexed
			} else {
				date = new Date(dateInput);
			}
		}
		
		// Check if date is valid
		if (isNaN(date.getTime())) {
			console.error('Invalid date:', dateInput);
			return '';
		}
		
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	// Reset scroll position and close sidebar when navigating to a new post
	$: if (post) {
		if (typeof window !== 'undefined') {
			window.scrollTo(0, 0);
		}
		sidebarOpen = false;
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('scroll', handleScroll);
		}
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<div class="blog-post-page">
	<header class="page-header" class:header-hidden={!headerVisible}>
		<SidebarToggle on:toggle={toggleSidebar} />
		<div class="logo-container" style="view-transition-name: jc-logo;">
			<a href="/" class="logo-link" aria-label="Return to home page">
				<JCLogo />
			</a>
		</div>
		<ThemeToggle />
	</header>

	<main class="blog-content">
		{#key post.title}
			<article class="post">
				<header class="post-header">
					<h1>{post.title}</h1>
					<div class="post-meta">
						<time datetime={getDateTimeString(post.date)}>{formatDate(post.date)}</time>
						{#if post.tags && Array.isArray(post.tags) && post.tags.length > 0}
							<div class="tags">
								{#each post.tags as tag}
									<span class="tag">{tag}</span>
								{/each}
							</div>
						{/if}
					</div>
				</header>
				<div class="prose">
					{@html post.content}
				</div>
				<footer class="post-footer">
					<a href="/" class="back-link">← Back to Home</a>
				</footer>
			</article>
		{/key}
	</main>

	<BlogSidebar isOpen={sidebarOpen} onclose={closeSidebar} />
	
	<!-- Copy Button Script Component -->
	<CopyButtonScript />
</div>

<style>
	.blog-post-page {
		min-height: 100vh;
		background-color: var(--background);
		color: var(--text);
	}

	.page-header {
		position: fixed;
		top: 1rem;
		left: 1rem;
		right: 1rem;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: transform 0.3s ease;
		view-transition-name: header;
	}

	.page-header.header-hidden {
		transform: translateY(-100%);
	}

	.page-header .logo-container {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		width: 60px;
		height: 60px;
		color: var(--text);
	}

	.page-header .logo-link {
		display: block;
		width: 100%;
		height: 100%;
		color: inherit;
		text-decoration: none;
		transition: opacity 0.2s ease, transform 0.2s ease;
	}

	.page-header .logo-link:hover {
		opacity: 0.8;
		transform: scale(1.05);
	}

	.blog-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 6rem 1rem 4rem;
		width: 100%;
		box-sizing: border-box;
	}

	/* Tablet and desktop adjustments */
	@media screen and (min-width: 768px) and (max-width: 1280px) {
		.blog-content {
			padding-left: 5rem;
			padding-right: 2rem;
		}

		.post-meta {
			margin-left: 0.5rem;
		}
	}

	/* Large desktop */
	@media screen and (min-width: 1281px) {
		.blog-content {
			padding: 6rem 2rem 4rem;
		}
	}

	.post-header {
		margin-bottom: 3rem;
	}

	.post-header h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		line-height: 1.2;
		color: var(--text);
	}

	.post-meta {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		opacity: 0.8;
		color: var(--text);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		background-color: rgba(128, 128, 128, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.9rem;
		color: var(--text);
	}

	.prose {
		line-height: 1.8;
		font-size: 1.1rem;
		color: var(--text);
	}

	.prose :global(h1),
	.prose :global(h2),
	.prose :global(h3),
	.prose :global(h4),
	.prose :global(h5),
	.prose :global(h6) {
		color: var(--text);
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.prose :global(h2) {
		font-size: 1.8rem;
		margin-top: 3rem;
	}

	.prose :global(h3) {
		font-size: 1.4rem;
		margin-top: 2rem;
	}

	.prose :global(p) {
		margin-bottom: 1.5rem;
		color: var(--text);
	}

	.prose :global(ul), 
	.prose :global(ol) {
		margin-bottom: 1.5rem;
		padding-left: 1.5rem;
	}

	.prose :global(li) {
		margin-bottom: 0.5rem;
		color: var(--text);
	}

	.prose :global(strong) {
		color: var(--text);
		font-weight: 600;
	}

	/* Inline code styling (not in pre blocks) - Override Tailwind Typography */
	.blog-post-page .prose :global(code):not(:global(pre code)) {
		background-color: #1a1a1a !important;
		padding: 0.2rem 0.4rem !important;
		border-radius: 0.25rem !important;
		font-size: 0.9em !important;
		color: #ffffff !important;
		border: none !important;
		font-weight: 500 !important;
		text-decoration: none !important;
		box-shadow: none !important;
		outline: none !important;
	}

	/* Ultra-specific selectors to override any Tailwind defaults */
	.blog-post-page .prose :global(*) :global(code):not(:global(pre code)),
	.blog-post-page .prose :global(p) :global(code),
	.blog-post-page .prose :global(li) :global(code),
	.blog-post-page .prose :global(span) :global(code),
	.blog-post-page .prose :global(div) :global(code) {
		background-color: #1a1a1a !important;
		padding: 0.2rem 0.4rem !important;
		border-radius: 0.25rem !important;
		font-size: 0.9em !important;
		color: #ffffff !important;
		border: none !important;
		font-weight: 500 !important;
		text-decoration: none !important;
		box-shadow: none !important;
		outline: none !important;
	}

	.prose :global(img) {
		max-width: 100%;
		height: auto;
		display: block;
		margin: 1.5rem auto;
		border-radius: 8px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.prose :global(blockquote) {
		border-left: 4px solid var(--text);
		padding-left: 1rem;
		margin: 2rem 0;
		opacity: 0.8;
		font-style: italic;
	}

	.prose :global(a) {
		color: var(--text);
		text-decoration: underline;
		transition: opacity 0.2s ease;
	}

	.prose :global(a:hover) {
		opacity: 0.7;
	}

	.post-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid rgba(128, 128, 128, 0.3);
	}

	.back-link {
		color: var(--text);
		text-decoration: none;
		transition: opacity 0.2s ease;
		font-weight: 500;
	}

	.back-link:hover {
		opacity: 0.7;
	}

	/* Mobile adjustments */
	@media (max-width: 767px) {
		.post-header h1 {
			font-size: 2rem;
		}
		
		.post-meta {
			flex-direction: column;
		}
	}

	/* Dark mode */
	:global(.dark) .blog-post-page .prose :global(code):not(:global(pre code)) {
		background-color: #1a1a1a !important;
	}

	:global(.dark) .prose :global(img) {
		box-shadow: 0 4px 8px rgba(255, 255, 255, 0.05);
	}
</style> 