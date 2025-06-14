import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { marked } from 'marked';
import { createHighlighter } from 'shiki';

// Define the shape of a blog post
interface BlogPost {
	title?: string;
	date?: string | Date;
	description?: string;
	tags?: string[];
	published?: boolean;
	content?: string; // We'll add the rendered HTML here
	[key: string]: any;
}

// Create a singleton highlighter instance
let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null;

async function getHighlighter() {
	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: ['github-dark', 'github-light'],
			langs: [
				'javascript',
				'typescript',
				'html',
				'css',
				'svelte',
				'json',
				'markdown',
				'bash',
				'shell',
				'powershell',
				'python',
				'java',
				'go',
				'rust',
				'sql',
				'yaml',
				'xml'
			]
		});
	}
	return highlighter;
}

// Configure marked with syntax highlighting
async function configureMarked() {
	const shiki = await getHighlighter();
	
	// Create a custom renderer for code blocks
	const renderer = new marked.Renderer();
	
	renderer.code = function({ text, lang }: { text: string; lang?: string }) {
		try {
			// If no language is specified, try to detect or default to plaintext
			const language = lang || 'text';
			
			// Check if the language is supported
			const supportedLangs = shiki.getLoadedLanguages();
			const actualLang = supportedLangs.includes(language) ? language : 'text';
			
			// Generate highlighted code for both themes
			const darkCode = shiki.codeToHtml(text, {
				lang: actualLang,
				theme: 'github-dark'
			});
			
			const lightCode = shiki.codeToHtml(text, {
				lang: actualLang,
				theme: 'github-light'
			});
			
			// Return HTML with theme-specific classes
			return `
				<div class="shiki-container">
					<div class="shiki-light">${lightCode}</div>
					<div class="shiki-dark">${darkCode}</div>
				</div>
			`;
		} catch (err) {
			console.error('Syntax highlighting error:', err);
			// Fallback to plain code block
			return `<pre><code>${text}</code></pre>`;
		}
	};
	
	marked.setOptions({
		renderer: renderer
	});
}

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
	try {
		// Use Vite's import.meta.glob to load MDX files at build time
		const modules = import.meta.glob('/src/content/blog/*.mdx', { 
			eager: true,
			query: '?raw',
			import: 'default'
		});
		
		// Find the file that matches the slug
		for (const [path, content] of Object.entries(modules)) {
			const filename = path.split('/').pop() || '';
			const fileSlug = filename.replace('.mdx', '').replace(/^\d+-/, ''); // Remove number prefix for slug
			
			if (fileSlug === slug) {
				const fileContent = content as string;
				
				// Parse frontmatter manually
				const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
				
				if (frontmatterMatch) {
					const frontmatterText = frontmatterMatch[1];
					const markdownContent = frontmatterMatch[2];
					const frontmatter: any = {};
					
					// Parse YAML-like frontmatter
					const lines = frontmatterText.split('\n');
					for (const line of lines) {
						const match = line.match(/^(\w+):\s*(.+)$/);
						if (match) {
							const [, key, value] = match;
							// Handle different value types
							if (value === 'true') {
								frontmatter[key] = true;
							} else if (value === 'false') {
								frontmatter[key] = false;
							} else if (value.startsWith('"') && value.endsWith('"')) {
								frontmatter[key] = value.slice(1, -1);
							} else {
								frontmatter[key] = value;
							}
						}
					}
					
					// Only return published posts
					if (frontmatter.published === false) {
						return null;
					}
					
					return {
						...frontmatter,
						content: markdownContent
					} as BlogPost;
				}
			}
		}
		
		return null;
	} catch (err) {
		console.error('Error reading blog post:', err);
		return null;
	}
}

export const load: PageServerLoad = async ({ params }) => {
	// Handle the case where slug might be an array (from [...slug] route)
	const rawSlug = params.slug;
	const slug = Array.isArray(rawSlug) ? rawSlug.join('/') : rawSlug;
	
	try {
		const post = await getPostBySlug(slug);

		// If no post is found, throw a 404 error. SvelteKit will show the error page.
		if (!post) {
			throw error(404, 'Post not found');
		}

		// Configure marked with syntax highlighting
		await configureMarked();

		// Parse the Markdown content to HTML
		if (post.content) {
			try {
				post.content = await marked.parse(post.content);
			} catch (err) {
				console.error('Error parsing markdown:', err);
				// Fallback to raw content if markdown parsing fails
				post.content = post.content;
			}
		}

		return {
			post,
			slug // Pass the slug for display purposes if needed
		};
	} catch (err) {
		console.error('Error in load function:', err);
		throw error(500, 'Internal server error');
	}
}; 