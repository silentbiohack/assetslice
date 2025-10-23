'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Shield, Clock, TrendingUp, Users, Globe, Zap } from 'lucide-react'

const partners = [
  { name: 'Phantom', logo: '/logos/phantom.svg' },
  { name: 'Solflare', logo: '/logos/solflare.svg' },
  { name: 'Backpack', logo: '/logos/backpack.svg' },
]

const benefits = [
  {
    icon: Globe,
    title: 'Fractional ownership without borders',
    description: 'Invest in real estate, equipment and art from around the world, starting from 10 USDC'
  },
  {
    icon: Clock,
    title: 'Trade shares 24/7 on Solana',
    description: 'Fast and cheap transactions thanks to Solana blockchain. Trade anytime'
  },
  {
    icon: Shield,
    title: 'Transparency through smart contracts',
    description: 'All operations are recorded on blockchain. Full transparency of ownership and returns'
  }
]

const stats = [
  { label: 'Assets in portfolio', value: '150+' },
  { label: 'Total value', value: '$2.5M' },
  { label: 'Active investors', value: '1,200+' },
  { label: 'Average yield', value: '8.2%' }
]

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-700">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center"
            >
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                Invest in the{' '}
                <span className="bg-gradient-to-r from-primary-600 to-solana-500 bg-clip-text text-transparent">
                  real world
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">
                powered by Solana
              </p>
              <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                Transform real assets into digital tokens. Invest in real estate, 
                equipment and art with minimal entry threshold.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button variant="gradient" size="lg" asChild>
                  <Link href="/onboarding">
                    Open Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/assets">Asset Catalog</Link>
                </Button>
              </div>
              
              {/* Partners */}
              <div className="mt-12">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Supported wallets
                </p>
                <div className="mt-4 flex items-center space-x-8">
                  {partners.map((partner) => (
                    <div key={partner.name} className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {partner.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto aspect-square max-w-lg">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/20 to-solana-500/20 blur-3xl" />
                <div className="relative grid grid-cols-2 gap-4 p-8">
                  {/* Asset Cards */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="glass rounded-2xl p-4"
                  >
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-500 to-purple-600" />
                    <div className="mt-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Berlin Loft</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">+7.8% APY</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="glass rounded-2xl p-4 mt-8"
                  >
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-green-500 to-teal-600" />
                    <div className="mt-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Art Collection</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">+12.3% APY</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="glass rounded-2xl p-4 -mt-4"
                  >
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-orange-500 to-red-600" />
                    <div className="mt-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Equipment</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">+9.1% APY</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="glass rounded-2xl p-4 mt-4"
                  >
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-500 to-rose-600" />
                    <div className="mt-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">NYC Property</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">+6.5% APY</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-dark-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gray-900 dark:text-white lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 dark:bg-dark-900 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why choose our platform
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Modern technology for investing in real assets
            </p>
          </motion.div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative rounded-2xl bg-white dark:bg-dark-800 p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500 to-solana-500 text-white mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-solana-500 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start investing today
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Minimum investment amount — just 10 USDC
            </p>
            <div className="mt-8">
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-white text-primary-600 hover:bg-gray-50"
                asChild
              >
                <Link href="/onboarding">
                  Start with 10 USDC
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}