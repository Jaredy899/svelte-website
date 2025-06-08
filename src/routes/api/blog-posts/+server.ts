import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

interface BlogPost {
	_path: string;
	title?: string;
	description?: string;
	date?: string | Date;
	published?: boolean;
	[key: string]: any;
}

async function getAllPosts(): Promise<BlogPost[]> {
	try {
		// Get all markdown files from the content/blog directory
		const contentDir = join(process.cwd(), 'src/content/blog');
		const files = readdirSync(contentDir).filter((file: string) => file.endsWith('.md'));
		
		const posts: BlogPost[] = [];
		
		for (const file of files) {
			const filePath = join(contentDir, file);
			const fileContent = readFileSync(filePath, 'utf-8');
			const { data: frontmatter } = matter(fileContent);
			
			// Only include published posts
			if (frontmatter.published !== false) {
				const slug = file.replace('.md', '').replace(/^\d+-/, ''); // Remove number prefix for slug
				const _path = `/blog/${slug}`;
				
				posts.push({
					_path,
					title: frontmatter.title,
					description: frontmatter.description,
					date: frontmatter.date,
					published: frontmatter.published !== false,
					...frontmatter
				} as BlogPost);
			}
		}
		
		// Sort posts by date (newest first)
		return posts.sort((a, b) => {
			const dateA = new Date(a.date || 0);
			const dateB = new Date(b.date || 0);
			return dateB.getTime() - dateA.getTime();
		});
	} catch (err) {
		console.error('Error reading blog posts:', err);
		return [];
	}
}

export const GET: RequestHandler = async () => {
	try {
		const posts = await getAllPosts();
		return json(posts);
	} catch (error) {
		console.error('Error in blog-posts API:', error);
		return json([], { status: 500 });
	}
}; 