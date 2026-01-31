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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
          <p className="text-xl text-slate-400">
            Thoughts on AI agents, data analysis, and building with public APIs.
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-lg mb-2">No posts yet</p>
              <p className="text-slate-500">Check back soon for new content!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.slug}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-sky-500/50 transition-colors"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    {post.author && (
                      <>
                        <span>•</span>
                        <span>{post.author}</span>
                      </>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-3 hover:text-sky-400 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-400 mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
