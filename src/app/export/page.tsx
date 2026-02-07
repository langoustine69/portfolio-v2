import { Metadata } from 'next';
import CollectionExport from '../../components/CollectionExport';

export const metadata: Metadata = {
  title: 'Export API Collection | Langoustine69',
  description: 'Export Langoustine69 x402 agents as Postman, Insomnia, OpenAPI, or cURL collections. Import into your favorite API testing tool.',
  keywords: ['postman', 'insomnia', 'openapi', 'curl', 'api collection', 'export', 'x402', 'langoustine69'],
  openGraph: {
    title: 'Export API Collection | Langoustine69',
    description: 'Export agents as Postman, Insomnia, OpenAPI, or cURL collections',
    type: 'website',
  },
};

export default function ExportPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📦</span>
            <h1 className="text-4xl md:text-5xl font-black uppercase">
              Export Collection
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Export all x402 agents as API collections for your favorite developer tools. 
            Import directly into Postman, Insomnia, or use as OpenAPI spec.
          </p>
        </div>

        {/* Instructions */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="border-4 border-black dark:border-white p-4 bg-brutal-yellow dark:bg-shell-900">
            <div className="text-2xl mb-2">1️⃣</div>
            <h3 className="font-bold uppercase">Choose Format</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Postman, Insomnia, OpenAPI, or cURL
            </p>
          </div>
          <div className="border-4 border-black dark:border-white p-4 bg-brutal-yellow dark:bg-shell-900">
            <div className="text-2xl mb-2">2️⃣</div>
            <h3 className="font-bold uppercase">Select Agents</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pick which agents to include
            </p>
          </div>
          <div className="border-4 border-black dark:border-white p-4 bg-brutal-yellow dark:bg-shell-900">
            <div className="text-2xl mb-2">3️⃣</div>
            <h3 className="font-bold uppercase">Download</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Get your collection file
            </p>
          </div>
          <div className="border-4 border-black dark:border-white p-4 bg-brutal-yellow dark:bg-shell-900">
            <div className="text-2xl mb-2">4️⃣</div>
            <h3 className="font-bold uppercase">Import</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Load into your API tool
            </p>
          </div>
        </div>

        {/* Export Component */}
        <div className="border-4 border-black dark:border-white p-6 md:p-8 bg-white dark:bg-shell-900">
          <CollectionExport />
        </div>

        {/* Format Details */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="border-4 border-black dark:border-white p-6">
            <h3 className="font-black uppercase text-lg mb-4">📮 Postman Import</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Open Postman → Import button</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Drop the JSON file or paste contents</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Set x402_payment variable in environment</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>Start making requests!</span>
              </li>
            </ol>
          </div>

          <div className="border-4 border-black dark:border-white p-6">
            <h3 className="font-black uppercase text-lg mb-4">🌙 Insomnia Import</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Open Insomnia → Import/Export → Import Data</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Select &quot;From File&quot; and choose the JSON</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Configure x402_payment in Base Environment</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>Explore and test agents!</span>
              </li>
            </ol>
          </div>

          <div className="border-4 border-black dark:border-white p-6">
            <h3 className="font-black uppercase text-lg mb-4">📋 OpenAPI Usage</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Import into Swagger UI, Redoc, or similar</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Use for SDK generation (openapi-generator)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Validate with spectral or other linters</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>Reference for API documentation</span>
              </li>
            </ol>
          </div>

          <div className="border-4 border-black dark:border-white p-6">
            <h3 className="font-black uppercase text-lg mb-4">💻 cURL Script</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-bold">1.</span>
                <span>Make executable: <code className="bg-gray-100 dark:bg-gray-800 px-1">chmod +x script.sh</code></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">2.</span>
                <span>Edit X402_PAYMENT variable</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">3.</span>
                <span>Run commands directly or source the file</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">4.</span>
                <span>Pipe to jq for pretty JSON output</span>
              </li>
            </ol>
          </div>
        </div>

        {/* x402 Protocol Note */}
        <div className="mt-12 border-4 border-lobster-500 p-6 bg-lobster-500/10">
          <h3 className="font-black uppercase text-lg mb-2 flex items-center gap-2">
            <span>⚡</span>
            About x402 Payments
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            These agents use the x402 micropayment protocol. Most endpoints return <code className="bg-gray-100 dark:bg-gray-800 px-1">402 Payment Required</code> until 
            a valid payment is provided via the <code className="bg-gray-100 dark:bg-gray-800 px-1">X-Payment</code> header. Free endpoints like <code className="bg-gray-100 dark:bg-gray-800 px-1">/health</code> and 
            <code className="bg-gray-100 dark:bg-gray-800 px-1">/.well-known/agent.json</code> work without payment.{' '}
            <a href="/x402-flow" className="text-lobster-500 hover:underline font-bold">
              Learn more about x402 →
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
