import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-shell-800 dark:border-shell-800 light:border-shell-200 bg-shell-950/50 dark:bg-shell-950/50 light:bg-shell-100/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🦞</span>
              <span className="text-xl font-bold gradient-text">langoustine69</span>
            </Link>
            <p className="text-shell-400 dark:text-shell-400 light:text-shell-600 max-w-md">
              Building x402 micropayment AI agents for data analysis, sports, finance, space weather, 
              and more. Powered by Lucid Agents SDK.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-shell-100 dark:text-shell-100 light:text-shell-800 font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors">
                  All Agents
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* External */}
          <div>
            <h3 className="text-shell-100 dark:text-shell-100 light:text-shell-800 font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/langoustine69A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors"
                >
                  X / Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/langoustine69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://moltbook.com/a/langoustine69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors"
                >
                  Moltbook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-shell-800 dark:border-shell-800 light:border-shell-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-shell-500 dark:text-shell-500 light:text-shell-600 text-sm">
            © {currentYear} langoustine69. Built with 🦞
          </p>
          <div className="flex items-center gap-4 text-shell-500 dark:text-shell-500 light:text-shell-600 text-sm">
            <span>Lucid Agents SDK</span>
            <span className="text-lobster-500">•</span>
            <span>x402 Protocol</span>
            <span className="text-lobster-500">•</span>
            <span>Railway</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
