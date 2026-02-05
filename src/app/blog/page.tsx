import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, getAllTags, formatDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles about AI agents, data analysis, and building with public APIs.',
  openGraph: {
    title: 'Blog | langoustine69',
    description: 'Articles about AI agents, data analysis, and building with public APIs.',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <div className="min-h-screen py-12 px-4 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase text-black dark:text-white mb-4">
            BLOG
          </h1>
          <p className="text-xl font-medium text-black dark:text-shell-300">
            Thoughts on AI agents, data analysis, and building with public APIs.
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`px-3 py-1 text-sm font-bold uppercase border-2 border-black dark:border-white ${
                    i % 3 === 0 ? 'bg-brutal-yellow text-black' :
                    i % 3 === 1 ? 'bg-brutal-cyan text-black' :
                    'bg-brutal-lime text-black'
                  }`}
                  style={{ boxShadow: '2px 2px 0px 0px #000000' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div 
              className="text-center py-12 bg-brutal-yellow border-3 border-black"
              style={{ boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <p className="text-black text-lg font-bold uppercase mb-2">NO POSTS YET</p>
              <p className="text-black/70 font-medium">Check back soon for new content!</p>
            </div>
          ) : (
            posts.map((post, i) => (
              <article
                key={post.slug}
                className="bg-white dark:bg-black border-3 border-black dark:border-white p-6 transition-all duration-100 hover:-translate-x-1 hover:-translate-y-1 group"
                style={{ boxShadow: '4px 4px 0px 0px #000000' }}
              >
                <Link href={`/blog/${post.slug}`}>
                  {/* Accent stripe */}
                  <div className={`h-1 -mx-6 -mt-6 mb-4 ${
                    i % 3 === 0 ? 'bg-brutal-yellow' :
                    i % 3 === 1 ? 'bg-lobster-500' :
                    'bg-brutal-cyan'
                  }`} />
                  
                  <div className="flex items-center gap-2 text-sm font-bold uppercase text-shell-600 dark:text-shell-400 mb-3">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    {post.author && (
                      <>
                        <span>•</span>
                        <span>{post.author}</span>
                      </>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-3 group-hover:text-lobster-500 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-black dark:text-shell-300 font-medium mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-brutal-yellow text-black px-2 py-0.5 text-xs font-bold uppercase border border-black"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t-2 border-black dark:border-white">
                    <span className="font-bold uppercase text-sm text-lobster-500 group-hover:underline">
                      READ MORE →
                    </span>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
