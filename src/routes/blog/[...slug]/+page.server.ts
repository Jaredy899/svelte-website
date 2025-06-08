import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { marked } from 'marked';
import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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
	const slug = params.slug;
	
	try {
		const post = await getPostBySlug(slug);

		// If no post is found, throw a 404 error. SvelteKit will show the error page.
		if (!post) {
			throw error(404, 'Post not found');
		}

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