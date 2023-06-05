import { useEffect } from 'react'

import { useAccount } from 'wagmi'

import { ConnectButton } from '@rainbow-me/rainbowkit'

import { useLedgerStatus } from 'hooks/useLedgerStatus'
import { useNetwork } from 'hooks/useNetwork'
import { logConnect } from 'utils/api/analytics'

const Navigation = () => {
  const { address } = useAccount()
  const { chainId } = useNetwork()

  useEffect(() => {
    if (address === undefined || chainId === undefined) return
    logConnect(address, chainId)
  }, [address])

  const { isRunningInLedgerLive } = useLedgerStatus()
  const chainStatus = isRunningInLedgerLive
    ? { smallScreen: 'none', largeScreen: 'none' }
    : { smallScreen: 'full', largeScreen: 'full' }
  return (
    <ConnectButton
      label='Connect'
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
      chainStatus={chainStatus as any}
    />
  )
}

export default Navigation
