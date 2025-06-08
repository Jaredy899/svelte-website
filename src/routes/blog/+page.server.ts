import type { PageServerLoad } from './$types';
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
	slug: string;
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
				posts.push({
					...frontmatter,
					slug
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

export const load: PageServerLoad = async () => {
	const posts = await getAllPosts();
	
	return {
		posts
	};
}; 