import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createStorage, http } from 'wagmi'
import { arbitrum, base, localhost, mainnet, polygon } from 'wagmi/chains'
import { safe } from 'wagmi/connectors'

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const isDevelopmentEnv = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
const isPreviewEnv = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
const shouldShowLocalHost = isDevelopmentEnv || isPreviewEnv

// Create a metadata object
export const metadata = {
  name: 'indexcoop-app',
  description: 'IndexCoop App',
  url: 'https://app.indexcoop.com',
  icons: ['/index-logo-black.png'],
}

// default wagmi localhost uses 1_337 as the chain id
const localhostHH = {
  ...localhost,
  id: 31_337,
}

export const chains = [
  arbitrum,
  mainnet,
  base,
  polygon,
  ...(shouldShowLocalHost ? [localhostHH] : []),
] as const

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  auth: {
    email: false,
    socials: [],
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  connectors: [safe()],
  transports: {
    [mainnet.id]: http(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    ),
    [arbitrum.id]: http(
      `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    ),
    [base.id]: http(
      `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    ),
    [polygon.id]: http(
      `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    ),
  },
})
