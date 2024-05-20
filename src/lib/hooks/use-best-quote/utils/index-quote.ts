import { BigNumber } from '@ethersproject/bignumber'

import { displayFromWei, parseUnits, toWei } from '@/lib/utils'
import { IndexApi } from '@/lib/utils/api/index-api'
import { getFullCostsInUsd, getGasCostsInUsd } from '@/lib/utils/costs'

import { IndexQuoteRequest, QuoteType, ZeroExQuote } from '../types'

import { getPriceImpact } from './price-impact'

interface ExtendedIndexQuoteRequest extends IndexQuoteRequest {
  chainId: number
  address: string
  nativeTokenPrice: number
}

interface QuoteResponseTransaction {
  data: string
  to: string
  value: string
  gasPrice?: string
  gasLimit?: string
  from?: string
  chainId?: number
}

interface QuoteResponse {
  type: string
  chainId: number
  contract: string
  takerAddress: string
  inputToken: string
  outputToken: string
  inputAmount: string // in wei
  outputAmount: string // in wei
  rawResponse: any
  transaction: QuoteResponseTransaction
}

export async function getIndexQuote(
  request: ExtendedIndexQuoteRequest,
): Promise<ZeroExQuote | null> {
  const {
    chainId,
    address,
    inputToken,
    inputTokenAmount,
    inputTokenPrice,
    isMinting,
    nativeTokenPrice,
    outputToken,
    outputTokenPrice,
    slippage,
  } = request
  //   let rfq: boolean = false
  // TODO: not supported yet
  //   if (outputToken.symbol === ic21.symbol || inputToken.symbol === ic21.symbol) {
  //     rfq = true
  //   }
  try {
    const inputAmount = parseUnits(inputTokenAmount, inputToken.decimals)
    const path = `/quote?takerAddress=${address}&inputToken=${inputToken.address}&outputToken=${outputToken.address}&inputAmount=${inputAmount.toString()}&chainId=${chainId}`
    console.log(path)
    const indexApi = new IndexApi()
    const res: QuoteResponse = await indexApi.get(path)
    const estimate = res.rawResponse.estimate
    const gasLimit0x = BigNumber.from(estimate?.gasCosts[0].limit ?? '0')
    const gasPrice0x = BigNumber.from(estimate?.gasCosts[0].price ?? '0')
    const gas0x = gasPrice0x.mul(gasLimit0x)
    const inputTokenAmountBn = toWei(inputTokenAmount, inputToken.decimals)
    const outputTokenAmount = BigNumber.from(res.outputAmount)
    const gasCostsInUsd = getGasCostsInUsd(gas0x.toBigInt(), nativeTokenPrice)

    const inputTokenAmountUsd = parseFloat(inputTokenAmount) * inputTokenPrice
    const outputTokenAmountUsd =
      parseFloat(
        displayFromWei(outputTokenAmount, 10, outputToken.decimals) ?? '0',
      ) * outputTokenPrice
    const priceImpact = getPriceImpact(
      inputTokenAmountUsd,
      outputTokenAmountUsd,
    )

    const outputTokenAmountUsdAfterFees = outputTokenAmountUsd - gasCostsInUsd

    const fullCostsInUsd = getFullCostsInUsd(
      inputTokenAmountBn.toBigInt(),
      gas0x.toBigInt(),
      inputToken.decimals,
      inputTokenPrice,
      nativeTokenPrice,
    )
    return {
      type: QuoteType.zeroex,
      chainId,
      contract: res.contract,
      isMinting,
      inputToken,
      outputToken,
      gas: gasLimit0x,
      gasPrice: gasPrice0x,
      gasCosts: gas0x,
      gasCostsInUsd,
      fullCostsInUsd,
      priceImpact,
      indexTokenAmount: isMinting ? outputTokenAmount : inputTokenAmountBn,
      inputOutputTokenAmount: isMinting
        ? inputTokenAmountBn
        : outputTokenAmount,
      inputTokenAmount: inputTokenAmountBn,
      inputTokenAmountUsd,
      outputTokenAmount,
      outputTokenAmountUsd,
      outputTokenAmountUsdAfterFees,
      inputTokenPrice,
      outputTokenPrice,
      slippage,
      tx: {
        account: address,
        data: res.transaction.data,
        from: address, // define for simulations which otherwise might fail
        to: res.transaction.to,
        value: BigNumber.from(res.transaction.value),
      },
      // 0x type specific properties (will change with interface changes to the quote API)
      minOutput: BigNumber.from(estimate.toAmountMin),
      sources: [{ name: estimate.tool, proportion: '1' }],
    }
  } catch (err) {
    console.log('Error fetching Index quote', err)
    return null
  }
}