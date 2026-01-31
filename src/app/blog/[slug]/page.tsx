import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPostSlugs, formatDate, getAllPosts } from '@/lib/blog';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      ...(post.image && { images: [post.image] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      ...(post.image && { images: [post.image] }),
    },
  };
}

function generateArticleSchema(post: NonNullable<ReturnType<typeof getPostBySlug>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author || 'langoustine69',
    },
    keywords: post.tags.join(', '),
  };
}

// Simple markdown to HTML conversion (basic)
function renderMarkdown(content: string): string {
  let html = content;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-slate-100 mb-3 mt-5">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-slate-100 mb-4 mt-6">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-slate-100 mb-6 mt-8">$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-slate-100">$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-slate-900 p-4 rounded-lg overflow-x-auto mb-4 border border-slate-700"><code class="text-sky-400 text-sm">$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-sky-400 text-sm">$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-sky-400 hover:text-sky-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-sky-500 pl-4 italic text-slate-400 my-4">$1</blockquote>');
  
  // Paragraphs (wrap remaining text)
  html = html.split('\n\n').map(para => {
    if (para.startsWith('<')) return para;
    return `<p class="mb-4">${para}</p>`;
  }).join('\n');
  
  // Clean up line breaks
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/<br><br>/g, '');
  
  return html;
}

export default function BlogPost({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === params.slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <div className="min-h-screen py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArticleSchema(post)),
        }}
      />

      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author && (
              <>
                <span>•</span>
                <span>{post.author}</span>
              </>
            )}
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
          
          <p className="text-xl text-slate-400">{post.description}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div 
          className="prose-custom text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Navigation */}
        <nav className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex justify-between gap-4">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="flex-1 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-sky-500/50 transition-colors"
              >
                <span className="text-sm text-slate-400 block mb-1">← Previous</span>
                <span className="text-white font-medium">{prevPost.title}</span>
              </Link>
            ) : <div className="flex-1" />}
            
            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="flex-1 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-sky-500/50 transition-colors text-right"
              >
                <span className="text-sm text-slate-400 block mb-1">Next →</span>
                <span className="text-white font-medium">{nextPost.title}</span>
              </Link>
            ) : <div className="flex-1" />}
          </div>
        </nav>
      </article>
    </div>
  );
}
