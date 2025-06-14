import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface BlogPost {
	_path: string;
	title?: string;
	description?: string;
	date?: string | Date;
	pubDate?: string | Date;
	published?: boolean;
	draft?: boolean;
	[key: string]: any;
}

async function getAllPosts(): Promise<BlogPost[]> {
	try {
		// Use Vite's import.meta.glob to load MDX files at build time
		const modules = import.meta.glob('/src/content/blog/*.mdx', { 
			eager: true,
			query: '?raw',
			import: 'default'
		});
		
		const posts: BlogPost[] = [];
		
		for (const [path, content] of Object.entries(modules)) {
			// Extract filename from path
			const filename = path.split('/').pop() || '';
			
			// Parse frontmatter manually (simple implementation)
			const fileContent = content as string;
			const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
			
			if (frontmatterMatch) {
				const frontmatterText = frontmatterMatch[1];
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
				
				// Only include published posts (not drafts)
				if (frontmatter.draft !== true) {
					const slug = filename.replace('.mdx', '').replace(/^\d+-/, ''); // Remove number prefix for slug
					const _path = `/blog/${slug}`;
					
					posts.push({
						_path,
						title: frontmatter.title,
						description: frontmatter.description,
						date: frontmatter.pubDate || frontmatter.date, // Support both pubDate and date
						pubDate: frontmatter.pubDate,
						published: frontmatter.draft !== true,
						draft: frontmatter.draft,
						...frontmatter
					} as BlogPost);
				}
			}
		}
		
		// Sort posts by date (newest first)
		return posts.sort((a, b) => {
			const dateA = new Date(a.date || a.pubDate || 0);
			const dateB = new Date(b.date || b.pubDate || 0);
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