'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Generate structured data for SEO
function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://langoustine69.dev${item.href}`,
    })),
  };
}

// Default path-to-label mapping
const pathLabels: Record<string, string> = {
  agents: 'Agents',
  blog: 'Blog',
  compare: 'Compare Agents',
  guides: 'Guides',
  docs: 'Documentation',
  rss: 'RSS Feed',
};

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || generateBreadcrumbsFromPath(pathname);
  
  // Don't show breadcrumbs on homepage
  if (pathname === '/') return null;
  
  // Only show if we have more than just Home
  if (breadcrumbItems.length <= 1) return null;

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />
      
      {/* Visual breadcrumbs */}
      <nav 
        aria-label="Breadcrumb" 
        className={`py-3 px-4 ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1 text-sm max-w-7xl mx-auto">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isFirst = index === 0;
            
            return (
              <li key={item.href} className="flex items-center">
                {!isFirst && (
                  <ChevronRightIcon 
                    className="w-4 h-4 text-shell-500 mx-1 flex-shrink-0" 
                    aria-hidden="true" 
                  />
                )}
                
                {isLast ? (
                  <span 
                    className="text-shell-300 font-medium truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {isFirst ? (
                      <span className="flex items-center gap-1.5">
                        <HomeIcon className="w-4 h-4" />
                        {item.label}
                      </span>
                    ) : (
                      item.label
                    )}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-shell-400 hover:text-lobster-400 transition-colors truncate max-w-[200px] flex items-center gap-1.5"
                  >
                    {isFirst && <HomeIcon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  
  let currentPath = '';
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Get label from mapping or format the segment
    let label = pathLabels[segment] || formatSegmentLabel(segment);
    
    // For dynamic routes like [id], try to get a better label
    // This will be overridden by explicit items prop when needed
    
    items.push({ label, href: currentPath });
  }
  
  return items;
}

function formatSegmentLabel(segment: string): string {
  // Replace hyphens/underscores with spaces and capitalize
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

// Export a variant for agent pages with custom agent name
export function AgentBreadcrumbs({ agentName, agentId }: { agentName: string; agentId: string }) {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/' },
        { label: 'Agents', href: '/agents' },
        { label: agentName, href: `/agents/${agentId}` },
      ]}
    />
  );
}

// Export a variant for agent docs
export function AgentDocsBreadcrumbs({ agentName, agentId }: { agentName: string; agentId: string }) {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/' },
        { label: 'Agents', href: '/agents' },
        { label: agentName, href: `/agents/${agentId}` },
        { label: 'Documentation', href: `/agents/${agentId}/docs` },
      ]}
    />
  );
}
