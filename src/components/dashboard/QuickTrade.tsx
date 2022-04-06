import { useEffect, useState } from 'react'

import { colors, useICColorMode } from 'styles/colors'

import { UpDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, useEthers } from '@usedapp/core'

import ConnectModal from 'components/header/ConnectModal'
import {
  ExchangeIssuanceLeveragedMainnetAddress,
  ExchangeIssuanceLeveragedPolygonAddress,
  ExchangeIssuanceZeroExAddress,
  zeroExRouterAddress,
} from 'constants/ethContractAddresses'
import { ETH, icETHIndex, Token } from 'constants/tokens'
import { useApproval } from 'hooks/useApproval'
import { useBestTradeOption } from 'hooks/useBestTradeOption'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useTrade } from 'hooks/useTrade'
import { useTradeExchangeIssuance } from 'hooks/useTradeExchangeIssuance'
import { useTradeLeveragedExchangeIssuance } from 'hooks/useTradeLeveragedExchangeIssuance'
import { useTradeTokenLists } from 'hooks/useTradeTokenLists'
import { isValidTokenInput, toWei } from 'utils'

import {
  formattedBalance,
  getTradeInfoData0x,
  getTradeInfoDataFromEI,
} from './QuickTradeFormatter'
import QuickTradeSelector from './QuickTradeSelector'
import TradeInfo, { TradeInfoItem } from './TradeInfo'

enum QuickTradeBestOption {
  zeroEx,
  exchangeIssuance,
  leveragedExchangeIssuance,
}

const QuickTrade = (props: {
  isNarrowVersion?: boolean
  singleToken?: Token
}) => {
  const { isDarkMode } = useICColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { account, chainId } = useEthers()

  const {
    isBuying,
    buyToken,
    buyTokenList,
    sellToken,
    sellTokenList,
    changeBuyToken,
    changeSellToken,
    swapTokenLists,
  } = useTradeTokenLists(chainId)

  const [bestOption, setBestOption] = useState<QuickTradeBestOption | null>(
    null
  )
  const [hasInsufficientFunds, setHasInsufficientFunds] = useState(false)
  const [sellTokenAmount, setSellTokenAmount] = useState('0')
  const [tradeInfoData, setTradeInfoData] = useState<TradeInfoItem[]>([])

  const [icEthErrorMessage, setIcEthErrorMessage] = useState<boolean>(false)

  const sellTokenBalance = useTokenBalance(sellToken)
  const buyTokenBalance = useTokenBalance(buyToken)

  const { bestOptionResult, isFetchingTradeData, fetchAndCompareOptions } =
    useBestTradeOption()

  const hasFetchingError =
    bestOptionResult && !bestOptionResult.success && !isFetchingTradeData

  const spenderAddressLevEIL =
    chainId === ChainId.Polygon
      ? ExchangeIssuanceLeveragedPolygonAddress
      : ExchangeIssuanceLeveragedMainnetAddress

  const {
    isApproved: isApprovedForSwap,
    isApproving: isApprovingForSwap,
    onApprove: onApproveForSwap,
  } = useApproval(
    sellToken,
    zeroExRouterAddress,
    toWei(sellTokenAmount, sellToken.decimals)
  )
  const {
    isApproved: isApprovedForEIL,
    isApproving: isApprovingForEIL,
    onApprove: onApproveForEIL,
  } = useApproval(
    sellToken,
    spenderAddressLevEIL,
    toWei(sellTokenAmount, sellToken.decimals)
  )
  const {
    isApproved: isApprovedForEIZX,
    isApproving: isApprovingForEIZX,
    onApprove: onApproveForEIZX,
  } = useApproval(
    sellToken,
    ExchangeIssuanceZeroExAddress,
    toWei(sellTokenAmount, sellToken.decimals)
  )

  const buyTokenAmountFormatted = tradeInfoData[0]?.value ?? '0'

  const { executeTrade, isTransacting } = useTrade(
    sellToken,
    bestOptionResult?.success ? bestOptionResult.dexData : null
  )
  const { executeEITrade, isTransactingEI } = useTradeExchangeIssuance(
    isBuying,
    sellToken,
    buyToken,
    bestOptionResult?.success
      ? bestOptionResult.exchangeIssuanceData?.inputTokenAmount ??
          BigNumber.from(0)
      : BigNumber.from(0),
    bestOptionResult?.success ? bestOptionResult.exchangeIssuanceData : null
  )
  const { executeLevEITrade, isTransactingLevEI } =
    useTradeLeveragedExchangeIssuance(
      isBuying,
      sellToken,
      buyToken,
      bestOptionResult?.success
        ? bestOptionResult.leveragedExchangeIssuanceData?.setTokenAmount ??
            BigNumber.from(0)
        : BigNumber.from(0),
      bestOptionResult?.success
        ? bestOptionResult.leveragedExchangeIssuanceData?.inputTokenAmount ??
            BigNumber.from(0)
        : BigNumber.from(0)
    )

  /**
   * Determine the best trade option.
   */
  useEffect(() => {
    if (bestOptionResult === null || !bestOptionResult.success) {
      setTradeInfoData([])
      return
    }

    const gasLimit0x = BigNumber.from(bestOptionResult.dexData?.gas ?? '0')
    const gasPrice0x = BigNumber.from(bestOptionResult.dexData?.gasPrice ?? '0')
    const gasPriceLevEI =
      bestOptionResult.leveragedExchangeIssuanceData?.gasPrice ??
      BigNumber.from(0)
    const gasLimit = 1800000 // TODO: Make gasLimit dynamic

    const gas0x = gasPrice0x.mul(gasLimit0x)
    const gasLevEI = gasPriceLevEI.mul(gasLimit)

    const fullCosts0x = toWei(sellTokenAmount, sellToken.decimals).add(gas0x)
    const fullCostsLevEI = bestOptionResult.leveragedExchangeIssuanceData
      ? bestOptionResult.leveragedExchangeIssuanceData.inputTokenAmount.add(
          gasLevEI
        )
      : null

    const bestOptionIs0x =
      !fullCostsLevEI ||
      fullCosts0x.lt(
        //NOTE: Change to .gt if you wanna pay up to taste EI
        fullCostsLevEI
      )

    const buyTokenDecimals = buyToken.decimals

    const dexTradeInfoData = bestOptionIs0x
      ? getTradeInfoData0x(
          bestOptionResult.dexData,
          buyTokenDecimals,
          buyToken,
          chainId
        )
      : getTradeInfoDataFromEI(
          bestOptionResult.leveragedExchangeIssuanceData?.setTokenAmount ??
            BigNumber.from(0),
          gasPriceLevEI,
          buyToken,
          bestOptionResult.leveragedExchangeIssuanceData,
          isBuying ? buyToken.decimals : sellToken.decimals,
          chainId
        )
    setTradeInfoData(dexTradeInfoData)

    setBestOption(
      bestOptionIs0x
        ? QuickTradeBestOption.zeroEx
        : QuickTradeBestOption.leveragedExchangeIssuance
    )

    // Temporary needed as icETH EI can't provide more than 120 icETH
    const shouldShowicEthErrorMessage =
      !bestOptionIs0x &&
      sellToken.symbol === ETH.symbol &&
      buyToken.symbol === icETHIndex.symbol &&
      toWei(sellTokenAmount, sellToken.decimals).gt(toWei(120))
    setIcEthErrorMessage(shouldShowicEthErrorMessage)
  }, [bestOptionResult])

  useEffect(() => {
    setTradeInfoData([])
  }, [chainId])

  useEffect(() => {
    const sellAmount = toWei(sellTokenAmount, sellToken.decimals)

    if (
      bestOption === null ||
      sellAmount.isZero() ||
      sellAmount.isNegative() ||
      sellTokenBalance === undefined
    )
      return

    const hasInsufficientFunds = sellAmount.gt(sellTokenBalance)
    setHasInsufficientFunds(hasInsufficientFunds)
  }, [bestOption, buyToken, sellTokenAmount, sellTokenBalance, sellToken])

  useEffect(() => {
    fetchOptions()
  }, [buyToken, sellToken, sellTokenAmount])

  const fetchOptions = () => {
    // Right now we only allow setting the sell amount, so no need to check
    // buy token amount here
    const sellTokenInWei = toWei(sellTokenAmount, sellToken.decimals)
    if (sellTokenInWei.isZero() || sellTokenInWei.isNegative()) return
    fetchAndCompareOptions(
      sellToken,
      sellTokenAmount,
      buyToken,
      // buyTokenAmount,
      isBuying
    )
  }

  const getIsApproved = () => {
    switch (bestOption) {
      case QuickTradeBestOption.exchangeIssuance:
        return isApprovedForEIZX
      case QuickTradeBestOption.leveragedExchangeIssuance:
        return isApprovedForEIL
      default:
        return isApprovedForSwap
    }
  }

  const getIsApproving = () => {
    switch (bestOption) {
      case QuickTradeBestOption.exchangeIssuance:
        return isApprovingForEIZX
      case QuickTradeBestOption.leveragedExchangeIssuance:
        return isApprovingForEIL
      default:
        return isApprovingForSwap
    }
  }

  const getOnApprove = () => {
    switch (bestOption) {
      case QuickTradeBestOption.exchangeIssuance:
        return onApproveForEIZX()
      case QuickTradeBestOption.leveragedExchangeIssuance:
        return onApproveForEIL()
      default:
        return onApproveForSwap()
    }
  }

  /**
   * Get the correct trade button label according to different states
   * @returns string label for trade button
   */
  const getTradeButtonLabel = () => {
    if (!account) {
      return 'Connect Wallet'
    }

    if (sellTokenAmount === '0') {
      return 'Enter an amount'
    }

    if (hasInsufficientFunds) {
      return 'Insufficient funds'
    }

    if (hasFetchingError) {
      return 'Try again'
    }

    const isNativeToken =
      sellToken.symbol === 'ETH' || sellToken.symbol === 'MATIC'

    if (!isNativeToken && getIsApproving()) {
      return 'Approving...'
    }

    if (!isNativeToken && !getIsApproved()) {
      return 'Approve Tokens'
    }

    if (isTransacting || isTransactingEI || isTransactingLevEI)
      return 'Trading...'

    return 'Trade'
  }

  const onChangeBuyTokenAmount = (token: Token, input: string) => {
    // const inputNumber = Number(input)
    // if (input === buyTokenAmount || input.slice(-1) === '.') return
    // if (isNaN(inputNumber) || inputNumber < 0) return
    // setBuyTokenAmount(inputNumber.toString())
  }

  const onChangeSellTokenAmount = (token: Token, input: string) => {
    if (!isValidTokenInput(input, token.decimals)) return
    setSellTokenAmount(input || '0')
  }

  const onClickTradeButton = async () => {
    if (!account) {
      // Open connect wallet modal
      onOpen()
      return
    }

    if (hasInsufficientFunds) return

    if (hasFetchingError) {
      fetchOptions()
      return
    }

    const isNativeToken =
      sellToken.symbol === 'ETH' || sellToken.symbol === 'MATIC'
    if (!getIsApproved() && !isNativeToken) {
      await getOnApprove()
      return
    }

    switch (bestOption) {
      case QuickTradeBestOption.zeroEx:
        await executeTrade()
        break
      case QuickTradeBestOption.exchangeIssuance:
        await executeEITrade()
        break
      case QuickTradeBestOption.leveragedExchangeIssuance:
        await executeLevEITrade()
        break
      default:
      // Nothing
    }
  }

  const isLoading = getIsApproving() || isFetchingTradeData

  const getButtonDisabledState = () => {
    if (!account) return false
    if (hasFetchingError) return false
    return (
      sellTokenAmount === '0' ||
      hasInsufficientFunds ||
      isTransacting ||
      isTransactingEI ||
      isTransactingLevEI
    )
  }

  const buttonLabel = getTradeButtonLabel()
  const isButtonDisabled = getButtonDisabledState()

  const sellTokenBalanceFormatted = formattedBalance(
    sellToken,
    sellTokenBalance
  )
  const buyTokenBalanceFormatted = formattedBalance(buyToken, buyTokenBalance)

  const isNarrow = props.isNarrowVersion ?? false
  const paddingX = isNarrow ? '16px' : '40px'

  return (
    <Flex
      border='2px solid #F7F1E4'
      borderColor={isDarkMode ? colors.icWhite : colors.black}
      borderRadius='16px'
      direction='column'
      py='20px'
      px={['16px', paddingX]}
      height={'100%'}
    >
      <Flex>
        <Text fontSize='24px' fontWeight='700'>
          Quick Trade
        </Text>
      </Flex>
      <Flex direction='column' my='20px'>
        <QuickTradeSelector
          title='From'
          config={{
            isDarkMode,
            isInputDisabled: false,
            isSelectorDisabled: false,
            isReadOnly: false,
          }}
          selectedToken={sellToken}
          tokenList={sellTokenList}
          selectedTokenBalance={sellTokenBalanceFormatted}
          onChangeInput={onChangeSellTokenAmount}
          onSelectedToken={(tokenSymbol) => changeSellToken(tokenSymbol)}
          isNarrowVersion={isNarrow}
        />
        <Box h='12px' alignSelf={'flex-end'} m={'-12px 0 12px 0'}>
          <IconButton
            background='transparent'
            margin={'6px 0'}
            aria-label='Search database'
            borderColor={isDarkMode ? colors.icWhite : colors.black}
            color={isDarkMode ? colors.icWhite : colors.black}
            icon={<UpDownIcon />}
            onClick={() => swapTokenLists()}
          />
        </Box>
        <QuickTradeSelector
          title='To'
          config={{
            isDarkMode,
            isInputDisabled: true,
            isSelectorDisabled: false,
            isReadOnly: true,
          }}
          selectedToken={buyToken}
          selectedTokenAmount={buyTokenAmountFormatted}
          selectedTokenBalance={buyTokenBalanceFormatted}
          tokenList={buyTokenList}
          onChangeInput={onChangeBuyTokenAmount}
          onSelectedToken={(tokenSymbol) => changeBuyToken(tokenSymbol)}
          isNarrowVersion={isNarrow}
        />
      </Flex>
      <Flex direction='column'>
        {tradeInfoData.length > 0 && <TradeInfo data={tradeInfoData} />}
        {hasFetchingError && (
          <Text align='center' color={colors.icRed} p='16px'>
            {bestOptionResult.error.message}
          </Text>
        )}
        {icEthErrorMessage && (
          <Text align='center' color={colors.icYellow} p='16px'>
            You can only issue the displayed amout of icETH at a time (you'll
            pay this amount of ETH, instead of the quantity you want to spend).
          </Text>
        )}
        <TradeButton
          label={buttonLabel}
          background={isDarkMode ? colors.icWhite : colors.icYellow}
          isDisabled={isButtonDisabled}
          isLoading={isLoading}
          onClick={onClickTradeButton}
        />
      </Flex>
      <ConnectModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  )
}

interface TradeButtonProps {
  label: string
  background: string
  isDisabled: boolean
  isLoading: boolean
  onClick: () => void
}

const TradeButton = (props: TradeButtonProps) => (
  <Button
    background={props.background}
    border='0'
    borderRadius='12px'
    color='#000'
    disabled={props.isDisabled}
    fontSize='24px'
    fontWeight='600'
    isLoading={props.isLoading}
    height='54px'
    w='100%'
    onClick={props.onClick}
  >
    {props.label}
  </Button>
)

export default QuickTrade
