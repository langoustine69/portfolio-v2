import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guides | langoustine69',
  description: 'Curl-friendly markdown guides for working with x402 agents. Learn how to call, build, and deploy micropayment APIs.',
  openGraph: {
    title: 'Guides | langoustine69',
    description: 'Curl-friendly markdown guides for working with x402 agents.',
  },
};

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
