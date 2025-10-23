'use client'

import { useState, useEffect } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface WalletButtonProps {
  className?: string
}

export function WalletButton({ className }: WalletButtonProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder button that matches the expected structure
    return (
      <button
        className={className}
        disabled
        style={{ opacity: 0.7 }}
      >
        Connect Wallet
      </button>
    )
  }

  return <WalletMultiButton className={className} />
}