<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	const { posts } = data;
</script>

<svelte:head>
	<title>Blog</title>
	<meta name="description" content="My personal blog posts" />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8">
	<header class="mb-12">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Blog</h1>
		<p class="text-xl text-gray-600">My thoughts on web development, technology, and more.</p>
	</header>

	<div class="space-y-8">
		{#each posts as post}
			<article class="border-b border-gray-200 pb-8">
				<h2 class="mb-2 text-2xl font-semibold">
					<a href="/blog/{post.slug}" class="text-blue-600 hover:text-blue-800">
						{post.title}
					</a>
				</h2>
				{#if post.description}
					<p class="mb-4 text-gray-600">{post.description}</p>
				{/if}
				<div class="flex items-center gap-4 text-sm text-gray-500">
					{#if post.date}
						<time datetime={typeof post.date === 'string' ? post.date : post.date.toISOString()}>
							{new Date(post.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</time>
					{/if}
					{#if post.tags && post.tags.length > 0}
						<div class="flex gap-2">
							{#each post.tags as tag}
								<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</div> 