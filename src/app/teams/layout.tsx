import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Team API Keys | Multi-Tenant Key Management',
  description: 'Collaborate with your organization. Create shared API keys, manage team members with role-based access control, and track usage across your team.',
  keywords: [
    'team API keys',
    'multi-tenant',
    'organization management',
    'shared API keys',
    'team collaboration',
    'role-based access',
    'API key management',
    'x402 teams',
  ],
  openGraph: {
    title: 'Team API Keys | Multi-Tenant Key Management',
    description: 'Collaborate with your organization. Create shared API keys, manage team members with role-based access control, and track usage across your team.',
    type: 'website',
    url: 'https://langoustine69.dev/teams',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Team API Keys | Multi-Tenant Key Management',
    description: 'Collaborate with your organization. Create shared API keys, manage team members, and track usage.',
  },
}

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
