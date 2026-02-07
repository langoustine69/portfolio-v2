import { Metadata } from 'next';
import UseCasesClient from './UseCasesClient';

export const metadata: Metadata = {
  title: 'Use Cases | Langoustine69',
  description: 'Real-world applications of x402 agents - portfolio trackers, emergency systems, sports analytics, security scanners, and more. See how our agents solve actual problems.',
  openGraph: {
    title: 'Use Cases | Langoustine69',
    description: 'Discover how x402 agents solve real problems with practical examples and code snippets.',
    images: ['/og/use-cases.png'],
  },
  keywords: ['x402 use cases', 'API examples', 'agent integration', 'micropayment examples', 'AI agent use cases'],
};

export default function UseCasesPage() {
  return <UseCasesClient />;
}
