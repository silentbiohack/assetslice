'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout/Layout'
import { 
  Scale, 
  Shield, 
  FileText, 
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { clsx } from 'clsx'

const sections = [
  {
    id: 'terms',
    title: 'Terms of Use',
    icon: FileText,
    content: `
      <h3>1. General Provisions</h3>
      <p>These Terms of Use govern access to and use of the tokenized assets platform (the "Platform"). By using the Platform, you agree to these terms.</p>
      
      <h3>2. Service Description</h3>
      <p>The Platform provides access to tokenized assets on the Solana blockchain. Users can view, buy, and sell shares in real assets represented as tokens.</p>
      
      <h3>3. Demo Mode</h3>
      <p>This version of the platform operates in demonstration mode. All transactions are executed on the test network (devnet) and have no real financial value.</p>
      
      <h3>4. User Responsibility</h3>
      <p>The user bears full responsibility for:</p>
      <ul>
        <li>Security of their wallet and private keys</li>
        <li>Compliance with local legislation</li>
        <li>Understanding investment risks</li>
      </ul>
      
      <h3>5. Restrictions</h3>
      <p>The Platform is not available to residents of certain jurisdictions. Users must independently verify the legality of using the platform in their country.</p>
    `
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: Shield,
    content: `
      <h3>1. Information Collection</h3>
      <p>We collect the minimum necessary information to provide services:</p>
      <ul>
        <li>Solana wallet address</li>
        <li>Country of residence</li>
        <li>Blockchain transaction data</li>
      </ul>
      
      <h3>2. Data Usage</h3>
      <p>Collected information is used exclusively for:</p>
      <ul>
        <li>Providing platform access</li>
        <li>Regulatory compliance</li>
        <li>Improving user experience</li>
      </ul>
      
      <h3>3. Data Protection</h3>
      <p>We employ modern information protection methods and do not share personal data with third parties without user consent.</p>
      
      <h3>4. Blockchain and Transparency</h3>
      <p>All transactions are recorded on the public Solana blockchain and are available for viewing. This ensures transparency but means transaction data is public.</p>
    `
  },
  {
    id: 'risks',
    title: 'Risk Warning',
    icon: AlertTriangle,
    content: `
      <h3>Important Warning</h3>
      <p class="text-red-600 dark:text-red-400 font-semibold">Investing in tokenized assets involves high risks and may result in complete loss of invested funds.</p>
      
      <h3>Main Risks:</h3>
      <ul>
        <li><strong>Market Risk:</strong> Asset values may fluctuate significantly</li>
        <li><strong>Technology Risk:</strong> Possible blockchain or smart contract failures</li>
        <li><strong>Regulatory Risk:</strong> Legislative changes may affect service availability</li>
        <li><strong>Liquidity Risk:</strong> Possible difficulties selling assets</li>
        <li><strong>Cybersecurity Risk:</strong> Threats of wallet and platform hacking</li>
      </ul>
      
      <h3>Recommendations:</h3>
      <ul>
        <li>Only invest funds whose loss you can afford</li>
        <li>Diversify your portfolio</li>
        <li>Study assets before investing</li>
        <li>Regularly update wallet software</li>
      </ul>
      
      <h3>Disclaimer</h3>
      <p>This platform does not provide investment advice. All decisions are made by users independently based on their own analysis.</p>
    `
  },
  {
    id: 'compliance',
    title: 'Compliance Requirements',
    icon: Scale,
    content: `
      <h3>Regulatory Compliance</h3>
      <p>The platform strives to comply with applicable laws and regulatory requirements in various jurisdictions.</p>
      
      <h3>KYC/AML Policy</h3>
      <p>In accordance with anti-money laundering requirements, the platform may request additional information for user verification.</p>
      
      <h3>Jurisdictional Restrictions</h3>
      <p>Platform services may be unavailable in the following jurisdictions:</p>
      <ul>
        <li>Countries under international sanctions</li>
        <li>Jurisdictions with cryptocurrency operation bans</li>
        <li>Regions with unclear legal status of tokenized assets</li>
      </ul>
      
      <h3>Tax Obligations</h3>
      <p>Users bear independent responsibility for compliance with their country's tax legislation regarding tokenized asset operations.</p>
    `
  }
]

export default function LegalPage() {
  const [activeSection, setActiveSection] = useState('terms')

  const activeContent = sections.find(section => section.id === activeSection)

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Scale className="mr-3 h-8 w-8" />
              Legal Information
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Terms of use, privacy policy, and important risk information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Sections
                </h2>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={clsx(
                          'w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors',
                          activeSection === section.id
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                        )}
                      >
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 mr-3" />
                          <span className="font-medium">{section.title}</span>
                        </div>
                        <ChevronRight className={clsx(
                          'h-4 w-4 transition-transform',
                          activeSection === section.id && 'rotate-90'
                        )} />
                      </button>
                    )
                  })}
                </nav>

                {/* Quick Links */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Useful Links
                  </h3>
                  <div className="space-y-2">
                    <a
                      href="https://solana.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      Solana.com
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                    <a
                      href="https://explorer.solana.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      Solana Explorer
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-8"
              >
                {activeContent && (
                  <>
                    <div className="flex items-center mb-6">
                      <activeContent.icon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activeContent.title}
                      </h2>
                    </div>

                    <div 
                      className="prose prose-gray dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: activeContent.content.replace(/\n\s*/g, '').replace(/<h3>/g, '<h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">').replace(/<p>/g, '<p class="text-gray-700 dark:text-gray-300 mb-4">').replace(/<ul>/g, '<ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">').replace(/<li>/g, '<li class="ml-4">')
                      }}
                    />

                    {/* Special notice for risks section */}
                    {activeSection === 'risks' && (
                      <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-start">
                          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                              Demo Platform Version
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              This version of the platform operates in test mode on Solana devnet. 
                              All assets and transactions are demonstrative and have no real value. 
                              Do not use real funds to test the platform.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>

              {/* Footer Notice */}
              <div className="mt-8 p-6 bg-gray-100 dark:bg-dark-700 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Last updated: {new Date().toLocaleDateString('en-US')} | 
                  For inquiries contact: legal@tokenized-assets.demo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}