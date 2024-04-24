import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAccount, useWalletClient } from 'wagmi'

import { IndexApi } from '@/lib/utils/api/index-api'

interface Context {
  hasSignedTerms: boolean
  signTermsOfService: () => void
}

const SignTermsContext = createContext<Context>({
  hasSignedTerms: false,
  signTermsOfService: () => {},
})

interface Props {
  children: ReactNode
}

const SIGN_TERMS_KEY = 'termsOfServiceV1'
const TERMS_MESSAGE = 'I have read and accept the Terms of Service.'

export const SignTermsProvider = ({ children }: Props) => {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [hasSignedTerms, setHasSignedTerms] = useState(false)

  useEffect(() => {
    async function fetchSignature() {
      try {
        const indexApi = new IndexApi()
        const res = await indexApi.get(`/signature/${address}`)
        const json = await res.json()
        if (json[SIGN_TERMS_KEY]) {
          setHasSignedTerms(true)
        }
      } catch (e) {
        console.error('Signature GET error', e)
      }
    }

    if (!address) return
    fetchSignature()
  }, [address])

  const signTermsOfService = async () => {
    let signature: `0x${string}` | undefined
    try {
      signature = await walletClient?.signMessage({
        message: TERMS_MESSAGE
      })
    } catch (e) {
      console.error('Sign message error', e)
    }

    if (signature === undefined) return

    try {
      await new IndexApi().put(`/signature/${address}`, {
        address,
        signature,
        [SIGN_TERMS_KEY]: new Date().toISOString(),
      })
    } catch (e) {
      console.error('Signature PUT error', e)
    }
    setHasSignedTerms(true)
  }

  return (
    <SignTermsContext.Provider
      value={{
        hasSignedTerms,
        signTermsOfService,
      }}
    >
      {children}
    </SignTermsContext.Provider>
  )
  return
}

export const useSignTerms = () => useContext(SignTermsContext)
