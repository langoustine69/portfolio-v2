import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preflight Check | Langoustine69',
  description: 'Verify your environment is ready for x402 integration. Check browser, wallet, and network configuration before building.',
  keywords: ['x402 preflight', 'integration check', 'wallet setup', 'environment verification', 'developer tools'],
  openGraph: {
    title: 'Preflight Check | Langoustine69',
    description: 'Verify your x402 integration environment is properly configured.',
    images: ['/og/preflight.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preflight Check | Langoustine69',
    description: 'Verify your x402 integration environment is properly configured.',
  },
};

export default function PreflightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
