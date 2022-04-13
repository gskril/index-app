import { useEffect, useState } from 'react'

import { ChainId } from '@usedapp/core'

import { POLYGON } from 'constants/chains'
import {
  DefiPulseIndex,
  ETH,
  indexNamesMainnet,
  indexNamesPolygon,
  mainnetCurrencyTokens,
  MATIC,
  polygonCurrencyTokens,
  Token,
} from 'constants/tokens'

export const useTradeTokenLists = (
  chainId: ChainId | undefined,
  singleToken?: Token
) => {
  const isPolygon = chainId === ChainId.Polygon

  const [isBuying, setIsBuying] = useState<boolean>(true)
  const [buyToken, setBuyToken] = useState<Token>(DefiPulseIndex)
  const [buyTokenList, setBuyTokenList] = useState<Token[]>(
    getTokenListByChain(chainId, singleToken)
  )
  const [sellToken, setSellToken] = useState<Token>(isPolygon ? MATIC : ETH)
  const [sellTokenList, setSellTokenList] = useState<Token[]>(
    getCurrencyTokensByChain(chainId)
  )

  /**
   * Switches sell token lists between mainnet and polygon
   */
  useEffect(() => {
    const newSellTokenList = getCurrencyTokensByChain(chainId)
    const newBuyTokenList = getTokenListByChain(chainId, singleToken)
    setSellTokenList(newSellTokenList)
    setBuyTokenList(newBuyTokenList)
    setSellToken(newSellTokenList[0])
    setBuyToken(newBuyTokenList[0])
    setIsBuying(true)
  }, [chainId])

  const changeBuyToken = (symbol: string) => {
    const filteredList = buyTokenList.filter((token) => token.symbol === symbol)
    if (filteredList.length < 0) {
      return
    }
    setBuyToken(filteredList[0])
  }

  const changeSellToken = (symbol: string) => {
    const filteredList = sellTokenList.filter(
      (token) => token.symbol === symbol
    )
    if (filteredList.length < 0) {
      return
    }
    setSellToken(filteredList[0])
  }

  const swapTokenLists = () => {
    const isBuyingNew = !isBuying
    const prevSellToken = sellToken
    const prevBuyToken = buyToken
    const currencyTokensList = getCurrencyTokensByChain(chainId)
    const sellTokenList = isBuyingNew
      ? currencyTokensList
      : getTokenListByChain(chainId, singleToken)
    const buyTokenList = isBuyingNew
      ? getTokenListByChain(chainId, singleToken)
      : currencyTokensList
    setSellTokenList(sellTokenList)
    setBuyTokenList(buyTokenList)
    setSellToken(prevBuyToken)
    setBuyToken(prevSellToken)
    setIsBuying(isBuyingNew)
  }

  return {
    isBuying,
    buyToken,
    buyTokenList,
    sellToken,
    sellTokenList,
    changeBuyToken,
    changeSellToken,
    swapTokenLists,
  }
}

/**
 * Get the list of currency tokens for the selected chain
 * @returns Token[] list of tokens
 */
const getCurrencyTokensByChain = (
  chainId: ChainId | undefined = ChainId.Mainnet
) => {
  if (chainId === POLYGON.chainId) return polygonCurrencyTokens
  return mainnetCurrencyTokens
}

/**
 * Get the list of currency tokens for the selected chain
 * @returns Token[] list of tokens
 */
const getTokenListByChain = (
  chainId: ChainId | undefined = ChainId.Mainnet,
  singleToken: Token | undefined
) => {
  if (singleToken) return [singleToken]
  if (chainId === POLYGON.chainId) return indexNamesPolygon
  return indexNamesMainnet
}