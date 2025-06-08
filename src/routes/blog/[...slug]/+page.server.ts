import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { marked } from 'marked';
import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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
		// Get all markdown files from the content/blog directory
		const contentDir = join(process.cwd(), 'src/content/blog');
		const files = readdirSync(contentDir).filter((file: string) => file.endsWith('.md'));
		

		
		// Find the file that matches the slug
		// The slug is the filename without the .md extension and without number prefix
		const matchingFile = files.find((file: string) => {
			const fileSlug = file.replace('.md', '').replace(/^\d+-/, ''); // Remove number prefix for slug
			return fileSlug === slug;
		});
		
		if (!matchingFile) {
			return null;
		}
		
		// Read and parse the markdown file
		const filePath = join(contentDir, matchingFile);
		const fileContent = readFileSync(filePath, 'utf-8');
		const { data: frontmatter, content } = matter(fileContent);
		
		// Only return published posts
		if (frontmatter.published === false) {
			return null;
		}
		
		return {
			...frontmatter,
			content
		} as BlogPost;
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