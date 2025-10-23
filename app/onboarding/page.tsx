'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/Button'
import { 
  Wallet, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Globe,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Lock
} from 'lucide-react'
import { clsx } from 'clsx'

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
]

const steps = [
  {
    id: 1,
    title: 'Welcome',
    subtitle: 'Start investing in real assets'
  },
  {
    id: 2,
    title: 'Connect Wallet',
    subtitle: 'Secure connection to Solana'
  },
  {
    id: 3,
    title: 'Select Country',
    subtitle: 'For regulatory compliance'
  },
  {
    id: 4,
    title: 'Confirmation',
    subtitle: 'Review terms and risks'
  },
  {
    id: 5,
    title: 'Complete!',
    subtitle: 'Welcome to the world of tokenized assets'
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [acceptedRisks, setAcceptedRisks] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const { connected, publicKey } = useWallet()

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true
      case 2:
        return connected
      case 3:
        return selectedCountry !== ''
      case 4:
        return acceptedRisks && acceptedTerms
      case 5:
        return true
      default:
        return false
    }
  }

  const handleComplete = () => {
    // Redirect to assets page
    window.location.href = '/assets'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                  currentStep >= step.id
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-dark-800 dark:text-gray-400'
                )}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={clsx(
                    'ml-4 h-0.5 w-16 transition-colors sm:w-24',
                    currentStep > step.id
                      ? 'bg-primary-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {steps[currentStep - 1].subtitle}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-xl p-8 md:p-12">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="mx-auto mb-8 h-24 w-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Invest in the Real World
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                  Get access to tokenized assets: real estate, equipment, and art. 
                  Trade shares 24/7 on the Solana blockchain.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <Globe className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Global Access</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Invest in assets worldwide without borders
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-secondary-100 dark:bg-secondary-900/20 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Transactions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Buy and sell asset shares in seconds
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Transparency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All transactions recorded on blockchain
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Connect Wallet */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="mx-auto mb-8 h-24 w-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Wallet className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Connect Solana Wallet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  You'll need a Solana wallet to securely store tokens and make transactions
                </p>

                {!connected ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700 !rounded-xl !px-8 !py-3 !text-base !font-medium" />
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p className="mb-2">Recommended wallets:</p>
                      <div className="flex justify-center space-x-4">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Phantom</span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Solflare</span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Backpack</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-6 w-6" />
                      <span className="font-medium">Wallet Connected</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Select Country */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Globe className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Select Your Country
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    This helps us comply with local regulatory requirements and provide you with relevant assets
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => setSelectedCountry(country.code)}
                        className={clsx(
                          'flex items-center space-x-3 w-full p-3 rounded-xl border-2 transition-colors text-left',
                          selectedCountry === country.code
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        )}
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {country.name}
                        </span>
                        {selectedCountry === country.code && (
                          <CheckCircle className="h-5 w-5 text-primary-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Terms and Risks */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                    <Lock className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Confirmation and Consent
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Please review the terms of use and investment risks
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Important Risk Information
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                      <li>• Investments in tokenized assets involve high risks</li>
                      <li>• Asset values can both rise and fall</li>
                      <li>• Past performance does not guarantee future results</li>
                      <li>• This is a demo version of the platform for informational purposes</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedRisks}
                        onChange={(e) => setAcceptedRisks(e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        I understand the risks associated with investing in tokenized assets, 
                        and acknowledge that I may lose part or all of my invested funds
                      </span>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        I accept the{' '}
                        <a href="/legal" className="text-primary-600 hover:text-primary-700 underline">
                          terms of use
                        </a>{' '}
                        and{' '}
                        <a href="/legal" className="text-primary-600 hover:text-primary-700 underline">
                          privacy policy
                        </a>
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Complete */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="mx-auto mb-8 h-24 w-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome!
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Your account is set up. You can now start investing in tokenized assets.
                </p>

                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 mb-8">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">What's next?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Explore the asset catalog</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Fund your balance (devnet)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Make your first purchase</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">Track your portfolio</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button
               variant="ghost"
               onClick={prevStep}
               disabled={currentStep === 1}
               className="flex items-center"
             >
               <ArrowLeft className="mr-2 h-4 w-4" />
               Back
             </Button>

             <div className="text-sm text-gray-500 dark:text-gray-400">
               Step {currentStep} of {steps.length}
             </div>

             {currentStep < steps.length ? (
               <Button
                 variant="primary"
                 onClick={nextStep}
                 disabled={!canProceed()}
                 className="flex items-center"
               >
                 Next
                 <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             ) : (
               <Button
                 variant="primary"
                 onClick={handleComplete}
                 className="flex items-center"
               >
                 Start Investing
                 <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}