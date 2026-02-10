import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Reputation Scores | Langoustine69 x402 Agents',
  description: 'Trust scores for x402 API agents based on uptime, response time, age, and maintenance activity. Find the most reliable agents for your integration.',
  keywords: ['x402', 'agent reputation', 'trust score', 'API reliability', 'uptime', 'agent health'],
  openGraph: {
    title: 'Agent Reputation Scores | Langoustine69',
    description: 'Trust scores based on uptime, response time, and maintenance. Find reliable x402 agents.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Reputation Scores',
    description: 'Trust scores for x402 API agents',
  },
};

export default function ReputationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
