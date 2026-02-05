import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPostSlugs, formatDate, getAllPosts } from '@/lib/blog';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
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

// Brutal markdown to HTML conversion
function renderMarkdown(content: string): string {
  let html = content;
  
  // Headers - brutal style
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold uppercase text-black dark:text-white mb-3 mt-5">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold uppercase text-black dark:text-white mb-4 mt-6">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black uppercase text-black dark:text-white mb-6 mt-8 underline decoration-4 decoration-brutal-yellow">$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="text-black dark:text-white font-bold">$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Code blocks - brutal style
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-black dark:bg-shell-900 p-4 overflow-x-auto mb-4 border-3 border-black dark:border-white" style="box-shadow: 4px 4px 0px 0px #FFDE59"><code class="text-brutal-lime text-sm font-mono">$2</code></pre>');
  
  // Inline code - brutal style
  html = html.replace(/`([^`]+)`/gim, '<code class="bg-brutal-yellow text-black px-2 py-0.5 font-mono font-bold border border-black">$1</code>');
  
  // Links - brutal style
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-lobster-500 font-bold underline decoration-2 hover:bg-brutal-yellow hover:text-black transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 font-medium">→ $1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 font-bold">$1</li>');
  
  // Blockquotes - brutal style
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-black dark:border-white pl-4 font-bold bg-brutal-yellow text-black py-2 my-4">$1</blockquote>');
  
  // Paragraphs
  html = html.split('\n\n').map(para => {
    if (para.startsWith('<')) return para;
    return `<p class="mb-4 text-black dark:text-shell-200 font-medium">${para}</p>`;
  }).join('\n');
  
  // Clean up
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/<br><br>/g, '');
  
  return html;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <div className="min-h-screen py-12 px-4 bg-white dark:bg-black">
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
          className="inline-flex items-center gap-2 text-black dark:text-white font-bold uppercase text-sm hover:text-lobster-500 transition-colors mb-8 border-2 border-black dark:border-white px-3 py-2 hover:bg-brutal-yellow"
          style={{ boxShadow: '2px 2px 0px 0px #000000' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          ← BACK TO BLOG
        </Link>

        {/* Header */}
        <header 
          className="mb-8 p-6 bg-brutal-yellow border-3 border-black"
          style={{ boxShadow: '6px 6px 0px 0px #000000' }}
        >
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-black/70 mb-4">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.author && (
              <>
                <span>•</span>
                <span>{post.author}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black uppercase text-black mb-4">
            {post.title}
          </h1>
          
          <p className="text-lg text-black/80 font-medium">{post.description}</p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-black text-white px-3 py-1 text-sm font-bold uppercase"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div 
          className="prose-custom leading-relaxed bg-white dark:bg-black p-6 border-3 border-black dark:border-white"
          style={{ boxShadow: '4px 4px 0px 0px #000000' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Navigation */}
        <nav className="mt-12 pt-8 border-t-4 border-black dark:border-white">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="flex-1 p-4 bg-white dark:bg-black border-3 border-black dark:border-white hover:-translate-y-1 transition-transform"
                style={{ boxShadow: '4px 4px 0px 0px #000000' }}
              >
                <span className="text-sm font-bold uppercase text-shell-500 block mb-1">← PREVIOUS</span>
                <span className="text-black dark:text-white font-bold uppercase">{prevPost.title}</span>
              </Link>
            ) : <div className="flex-1" />}
            
            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="flex-1 p-4 bg-white dark:bg-black border-3 border-black dark:border-white hover:-translate-y-1 transition-transform text-right"
                style={{ boxShadow: '4px 4px 0px 0px #000000' }}
              >
                <span className="text-sm font-bold uppercase text-shell-500 block mb-1">NEXT →</span>
                <span className="text-black dark:text-white font-bold uppercase">{nextPost.title}</span>
              </Link>
            ) : <div className="flex-1" />}
          </div>
        </nav>
      </article>
    </div>
  );
}
