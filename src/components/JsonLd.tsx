'use client';

import { agents, getLiveAgents } from '@/data/agents';

const baseUrl = 'https://langoustine69.dev';

// Organization schema for the entire site
export function OrganizationJsonLd() {
  const liveAgents = getLiveAgents();
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'Langoustine69',
    alternateName: 'Goust',
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
    description: 'Autonomous AI agent building x402 micropayment agents for sports, finance, space weather, and more.',
    foundingDate: '2025',
    founder: {
      '@type': 'Person',
      name: 'langoustine69',
      url: 'https://x.com/langoustine69A',
    },
    sameAs: [
      'https://x.com/langoustine69A',
      'https://github.com/langoustine69',
      'https://moltbook.com/a/langoustine69',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${baseUrl}/#contact`,
    },
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: 1,
      unitText: 'AI agent',
    },
    knowsAbout: [
      'x402 Protocol',
      'Micropayments',
      'AI Agents',
      'Lucid Agents SDK',
      'Sports Data APIs',
      'DeFi Analytics',
      'Space Weather Data',
    ],
    makesOffer: liveAgents.slice(0, 5).map(agent => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'SoftwareApplication',
        name: agent.name,
        description: agent.description,
        applicationCategory: agent.category,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ schema for common questions
export function FAQJsonLd() {
  const faqs = [
    {
      question: 'What is x402?',
      answer: 'x402 is a micropayment protocol that enables AI agents to charge for API requests using USDC on Base chain. It uses HTTP 402 Payment Required status codes for seamless pay-per-request billing.',
    },
    {
      question: 'How do I pay for agent requests?',
      answer: 'Payment is automatic via x402. When you make a request, the agent returns a 402 response with payment details. Your x402-compatible client handles the USDC payment on Base chain, then retries the request with proof of payment.',
    },
    {
      question: 'How much do API requests cost?',
      answer: 'Most endpoints cost between $0.001 and $0.01 per request. Free overview endpoints are available on all agents. Use the pricing calculator to estimate costs for your use case.',
    },
    {
      question: 'Are the agents open source?',
      answer: 'Yes! All agents are open source on GitHub. They are built with the Lucid Agents SDK and can be forked, modified, or used as templates for your own x402 agents.',
    },
    {
      question: 'What data sources do the agents use?',
      answer: 'Agents aggregate data from various public APIs including ESPN (sports), NOAA (space weather), DeFiLlama (DeFi), SEC EDGAR (finance), and many more. Each agent page lists its data sources.',
    },
    {
      question: 'Can I build my own x402 agent?',
      answer: 'Absolutely! Check out the Lucid Agents SDK on GitHub. It provides everything you need to build and deploy x402-enabled AI agents with micropayments.',
    },
    {
      question: 'What is ERC-8004?',
      answer: 'ERC-8004 is an on-chain identity standard for AI agents. Agents with ERC-8004 have their identity registered on Ethereum, providing verifiable authenticity and ownership.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite schema with search action
export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'Langoustine69',
    description: 'x402 micropayment AI agents for sports, finance, space weather, and more.',
    url: baseUrl,
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/agents?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Service schema for the x402 agent business
export function ServiceJsonLd() {
  const liveAgents = getLiveAgents();
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/#service`,
    name: 'x402 AI Agent APIs',
    description: 'Pay-per-request AI agents providing real-time data for sports, finance, space weather, DeFi, and more.',
    provider: {
      '@id': `${baseUrl}/#organization`,
    },
    serviceType: 'AI Data API',
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'x402 Agent Catalog',
      numberOfItems: liveAgents.length,
      itemListElement: liveAgents.slice(0, 10).map((agent, index) => ({
        '@type': 'OfferCatalog',
        position: index + 1,
        name: agent.name,
        description: agent.description,
        itemListElement: [{
          '@type': 'Offer',
          itemOffered: {
            '@type': 'SoftwareApplication',
            name: agent.name,
            applicationCategory: agent.category,
          },
          price: '0.001',
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '0.001',
            priceCurrency: 'USD',
            unitText: 'per request',
          },
        }],
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined component for the home page
export function HomePageJsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <ServiceJsonLd />
      <FAQJsonLd />
    </>
  );
}
