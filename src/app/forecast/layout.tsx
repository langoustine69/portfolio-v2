import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cost Forecast | Langoustine69',
  description: 'Predict future API spending based on usage trends. Interactive scenario modeling, budget analysis, and cost management recommendations for x402 agents.',
  keywords: ['API cost forecast', 'usage prediction', 'budget planning', 'x402 spending', 'API analytics'],
  openGraph: {
    title: 'Cost Forecast Tool',
    description: 'Predict future API spending with interactive scenario modeling and budget analysis.',
    type: 'website',
    url: 'https://langoustine69.dev/forecast',
  },
}

export default function ForecastLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
