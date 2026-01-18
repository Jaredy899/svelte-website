import type { PageServerLoad } from './$types';

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
		// Use Vite's import.meta.glob to load MD files at build time (supports subfolders)
		const modules = import.meta.glob('/src/content/blog/**/*.md', { 
			eager: true,
			query: '?raw',
			import: 'default'
		});
		
		const posts: BlogPost[] = [];
		
		for (const [path, content] of Object.entries(modules)) {
			// Extract slug from filename (supports any folder depth like 2025/05/post-name.md)
			const filename = path.split('/').pop() || '';
			const slug = filename.replace('.md', '');
			
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
				
				// Only include published posts (draft !== true)
				if (frontmatter.draft !== true) {
					posts.push({
						...frontmatter,
						slug
					} as BlogPost);
				}
			}
		}
		
		// Sort posts by date (newest first) - support both pubDate and date
		return posts.sort((a, b) => {
			const dateA = new Date(a.pubDate || a.date || 0);
			const dateB = new Date(b.pubDate || b.date || 0);
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