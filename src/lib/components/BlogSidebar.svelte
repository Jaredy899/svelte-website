<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	interface BlogPost {
		_path: string;
		title?: string;
		description?: string;
		date?: string | Date;
		published?: boolean;
		[key: string]: any;
	}

	export let isOpen: boolean;

	const dispatch = createEventDispatcher<{ close: void }>();

	// Reactive state variables
	let posts: BlogPost[] = [];
	let isLoading = true;
	let loadError = false;

	// Load posts from the server
	async function loadBlogPosts(): Promise<BlogPost[]> {
		const response = await fetch('/api/blog-posts');
		if (!response.ok) {
			throw new Error('Failed to load blog posts');
		}
		return response.json();
	}

	onMount(async () => {
		try {
			isLoading = true;
			loadError = false;

			const blogPosts = await loadBlogPosts();
			posts = blogPosts;
		} catch (error) {
			console.error('Error loading blog posts:', error);
			loadError = true;
		} finally {
			isLoading = false;
		}
	});

	const closeSidebar = () => {
		dispatch('close');
	};



	const formatDate = (dateInput?: string | Date) => {
		if (!dateInput) return '';

		let date: Date;
		if (dateInput instanceof Date) {
			date = dateInput;
		} else {
			if (
				typeof dateInput === 'string' &&
				/^\d{4}-\d{2}-\d{2}$/.test(dateInput)
			) {
				const [year, month, day] = dateInput.split('-').map(Number);
				date = new Date(year, month - 1, day);
			} else {
				date = new Date(dateInput);
			}
		}

		if (isNaN(date.getTime())) {
			console.error('Invalid date:', dateInput);
			return '';
		}

		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};
</script>

<div
	class="sidebar-overlay"
	class:active={isOpen}
	on:click={closeSidebar}
	role="presentation"
>
	<aside class="blog-sidebar" class:open={isOpen}>
		<div class="sidebar-header">
			<h2>Blog Posts</h2>
			<button
				class="close-btn"
				on:click={closeSidebar}
				aria-label="Close sidebar"
			>
				<svg
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
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<div class="sidebar-content">
			{#if isLoading}
				<div class="loading">Loading posts...</div>
			{:else if loadError}
				<div class="error">Failed to load posts</div>
			{:else if !posts || posts.length === 0}
				<div class="no-posts">No blog posts yet</div>
			{:else}
				<ul class="posts-list">
					{#each posts as post (post._path)}
						<li>
							<a 
								href={post._path}
								class="post-link" 
								on:click={closeSidebar}
							>
								<div class="post-title">{post.title}</div>
								<div class="post-date">{formatDate(post.date)}</div>
								<div class="post-description">{post.description}</div>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</aside>
</div>

<style>
	.sidebar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.3s ease, visibility 0.3s ease;
	}

	.sidebar-overlay.active {
		opacity: 1;
		visibility: visible;
	}

	.blog-sidebar {
		position: fixed;
		top: 0;
		left: 0;
		width: 400px;
		height: 100vh;
		background-color: var(--background);
		border-right: 1px solid var(--text);
		transform: translateX(-100%);
		transition: transform 0.3s ease;
		overflow-y: auto;
		z-index: 1001;
	}

	.blog-sidebar.open {
		transform: translateX(0);
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--text);
	}

	.sidebar-header h2 {
		margin: 0;
		color: var(--text);
		font-size: 1.5rem;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--text);
		cursor: pointer;
		padding: 0.5rem;
		transition: opacity 0.2s ease;
	}

	.close-btn:hover {
		opacity: 0.7;
	}

	.sidebar-content {
		padding: 1.5rem;
	}

	.loading,
	.error,
	.no-posts {
		text-align: center;
		color: var(--text);
		padding: 2rem;
	}

	.posts-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.posts-list li {
		margin-bottom: 1.5rem;
	}

	.post-link {
		display: block;
		text-decoration: none;
		color: var(--text);
		padding: 1rem;
		border: 1px solid transparent;
		border-radius: 8px;
		transition: all 0.2s ease;
		background: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
		font-family: inherit;
		font-size: inherit;
		box-sizing: border-box;
	}

	.post-link:hover {
		border-color: var(--text);
		background-color: rgba(128, 128, 128, 0.1);
	}

	.post-title {
		font-weight: bold;
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
	}

	.post-date {
		font-size: 0.9rem;
		opacity: 0.7;
		margin-bottom: 0.5rem;
	}

	.post-description {
		font-size: 0.95rem;
		opacity: 0.8;
		line-height: 1.4;
	}

	.error {
		color: #ef4444;
	}

	@media (max-width: 768px) {
		.blog-sidebar {
			width: 100%;
		}
	}
</style>