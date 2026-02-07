import type { Metadata } from 'next';
import QAForum from '@/components/QAForum';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Developer Q&A | x402 Agents Community',
  description:
    'Get help from the x402 developer community. Ask questions about agent integration, payments, APIs, SDKs, and more.',
  openGraph: {
    title: 'Developer Q&A | x402 Agents Community',
    description: 'Ask questions, share knowledge, and find solutions with the x402 developer community.',
    type: 'website',
  },
};

export default function QAPage() {
  return (
    <div className="min-h-screen bg-shell-900 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 px-4 text-center bg-gradient-to-b from-shell-800/50 to-shell-900">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-lobster-600/10 border border-lobster-500/20 rounded-full text-lobster-400 text-sm mb-6">
              <span>💬</span>
              <span>Community Forum</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-shell-100 mb-4">
              Developer Q&A
            </h1>
            <p className="text-shell-400 text-lg max-w-2xl mx-auto">
              Get help integrating x402 agents into your apps. Ask questions, share solutions, 
              and learn from the community.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-shell-100">6+</p>
                <p className="text-shell-500 text-sm">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">83%</p>
                <p className="text-shell-500 text-sm">Solved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-shell-100">2hr</p>
                <p className="text-shell-500 text-sm">Avg. Response</p>
              </div>
            </div>
          </div>
        </section>

        {/* Q&A Forum */}
        <QAForum showHeader={false} />

        {/* Help Section */}
        <section className="py-16 px-4 bg-shell-800/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-shell-100 text-center mb-8">
              Need More Help?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <a
                href="/guides"
                className="p-6 bg-shell-800/50 border border-shell-700 rounded-xl hover:border-lobster-500/30 transition-all group"
              >
                <span className="text-3xl mb-4 block">📚</span>
                <h3 className="text-lg font-semibold text-shell-100 mb-2 group-hover:text-lobster-400">
                  Documentation
                </h3>
                <p className="text-shell-400 text-sm">
                  Comprehensive guides and API reference for all agents.
                </p>
              </a>
              
              <a
                href="/glossary"
                className="p-6 bg-shell-800/50 border border-shell-700 rounded-xl hover:border-lobster-500/30 transition-all group"
              >
                <span className="text-3xl mb-4 block">📖</span>
                <h3 className="text-lg font-semibold text-shell-100 mb-2 group-hover:text-lobster-400">
                  x402 Glossary
                </h3>
                <p className="text-shell-400 text-sm">
                  Learn the terminology and concepts behind x402 payments.
                </p>
              </a>
              
              <a
                href="https://discord.gg/x402"
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 bg-shell-800/50 border border-shell-700 rounded-xl hover:border-lobster-500/30 transition-all group"
              >
                <span className="text-3xl mb-4 block">💬</span>
                <h3 className="text-lg font-semibold text-shell-100 mb-2 group-hover:text-lobster-400">
                  Discord Community
                </h3>
                <p className="text-shell-400 text-sm">
                  Chat with developers and get real-time help.
                </p>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
