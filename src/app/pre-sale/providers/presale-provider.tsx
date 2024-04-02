import { useEffect, useMemo, useState } from 'react'

import { preSaleTokens } from '@/app/pre-sale/constants'
import { Token, WSTETH } from '@/constants/tokens'
import { formatAmount } from '@/lib/utils'
import { IndexApi } from '@/lib/utils/api/index-api'

interface PresaleData {
  currencyToken: Token
  data: {
    tvl: number
  }
  formatted: {
    prtRewards: string
    indexRewards: string
    tvl: string
  }
}

export function usePresaleData(symbol: string): PresaleData {
  const presaleToken = preSaleTokens.find((token) => token.symbol === symbol)
  const currencyToken = WSTETH

  const [tvl, setTvl] = useState(0)

  const tvlFormatted = useMemo(
    () => `${formatAmount(tvl)} ${currencyToken.symbol}`,
    [currencyToken, tvl],
  )

  useEffect(() => {
    if (!presaleToken) return
    const fetchTvl = async () => {
      try {
        const indexApi = new IndexApi()
        const res = await indexApi.get(`/${presaleToken.symbol}/marketcap`)
        setTvl(res.marketcap)
      } catch (err) {
        console.log('Error fetching tvl', err)
      }
    }
    fetchTvl()
  }, [presaleToken])

  return {
    currencyToken,
    data: {
      ...presaleToken,
      tvl,
    },
    formatted: {
      prtRewards: '',
      indexRewards: '',
      tvl: tvlFormatted,
    },
  }
}
