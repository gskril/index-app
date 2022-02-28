import { useEffect, useState } from 'react'

import { colors } from 'styles/colors'

import { UpDownIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Select,
  Spacer,
  Tab,
  TabList,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { useEtherBalance, useEthers } from '@usedapp/core'

import { MAINNET, POLYGON } from 'constants/chains'
import indexNames, {
  DefiPulseIndex,
  ETH,
  mainnetCurrencyTokens,
  polygonCurrencyTokens,
  Token,
} from 'constants/tokens'
import { useFormattedBalance } from 'hooks/useFormattedBalance'
import { displayFromWei } from 'utils'

const InputSelector = (props: {
  title: string
  selectedToken: Token
  tokenList: Token[]
  onChange: (symbol: string) => void
}) => {
  const { chainId, account } = useEthers()
  // TODO: Make balance real
  const [balance, setBalance] = useState<string>('0')
  const etherBalance = displayFromWei(useEtherBalance(account), 2, 18) || '0.00'
  const balanceString = useFormattedBalance(props.selectedToken)

  useEffect(() => {
    console.log('balanceString', props.selectedToken.symbol, balanceString)
    if (props.selectedToken.symbol === ETH.symbol) {
      setBalance(etherBalance)
    } else {
      setBalance(balanceString)
    }
    console.log(props.selectedToken.symbol, balance)
  }, [chainId])

  return (
    <Flex direction='column'>
      <Text fontSize='20px' fontWeight='700'>
        {props.title}
      </Text>
      <Flex mt='10px' h='54px'>
        <Flex
          align='center'
          justify='center'
          grow='1'
          border='1px solid #F6F1E4'
          px='40px'
        >
          <Input placeholder='0' type='number' variant='unstyled' />
          <Spacer />
          <Text align='right' fontSize='12px' fontWeight='400' w='100%'>
            Balance: {balance}
          </Text>
        </Flex>
        <Flex
          align='center'
          h='54px'
          border='1px solid #F6F1E4'
          minWidth='100px'
        >
          <Select
            border='0'
            w='100px'
            minWidth='100px'
            h='54px'
            onChange={(event) => {
              console.log('event', event.target.value, balanceString)
              props.onChange(event.target.value)
            }}
          >
            {props.tokenList.map((token) => {
              return (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              )
            })}
          </Select>
        </Flex>
      </Flex>
    </Flex>
  )
}

const QuickTrade = () => {
  const { chainId } = useEthers()
  const [isBuying, setIsBuying] = useState<boolean>(true)
  const [sellToken, setSellToken] = useState<Token>(ETH)
  const [buyToken, setBuyToken] = useState<Token>(DefiPulseIndex)
  const [sellTokenList, setSellTokenList] = useState<Token[]>(
    chainId === MAINNET.chainId ? mainnetCurrencyTokens : polygonCurrencyTokens
  )
  const [buyTokenList, setBuyTokenList] = useState<Token[]>(indexNames)

  /**
   * Switches sell token lists between mainnet and polygon
   */
  useEffect(() => {
    if (chainId === MAINNET.chainId) {
      setSellTokenList(mainnetCurrencyTokens)
    } else {
      setSellTokenList(polygonCurrencyTokens)
    }
  }, [chainId])

  /**
   * Get the list of currency tokens for the selected chain
   * @returns {Token[]} list of tokens
   */
  const getCurrencyTokensByChain = () => {
    if (chainId === POLYGON.chainId) return polygonCurrencyTokens
    return mainnetCurrencyTokens
  }

  /**
   * Sets the list of tokens based on if the user is buying or selling
   */
  const swapTokenLists = () => {
    let buyTemp = buyToken
    let sellTemp = sellToken
    if (isBuying) {
      setSellTokenList(getCurrencyTokensByChain())
      setBuyTokenList(indexNames)
    } else {
      setSellTokenList(indexNames)
      setBuyTokenList(getCurrencyTokensByChain())
    }
    setBuyToken(sellTemp)
    setSellToken(buyTemp)
    setIsBuying(!isBuying)
  }

  const onChangeSellToken = (symbol: string) => {
    const filteredList = sellTokenList.filter(
      (token) => token.symbol === symbol
    )
    if (filteredList.length < 0) {
      return
    }
    setSellToken(filteredList[0])
  }

  const onChangeBuyToken = (symbol: string) => {
    const filteredList = buyTokenList.filter((token) => token.symbol === symbol)
    if (filteredList.length < 0) {
      return
    }
    setBuyToken(filteredList[0])
  }

  return (
    <Flex
      border='2px solid #F7F1E4'
      borderRadius='16px'
      direction='column'
      py='20px'
      px='40px'
    >
      <Flex>
        <Text fontSize='24px' fontWeight='700'>
          Quick Trade
        </Text>
        <Spacer />
        <Tabs
          background='#1D1B16'
          borderRadius='8px'
          fontSize='16px'
          fontWeight='500'
          height='45px'
          color={white}
          outline='0'
          variant='unstyle'
        >
          <TabList>
            <Tab _selected={selectedTabStyle}>DEX Swap</Tab>
            <Tab _selected={selectedTabStyle}>Index Issuance</Tab>
          </TabList>
        </Tabs>
      </Flex>
      <Flex direction='column' my='20px'>
        <InputSelector
          title='From'
          selectedToken={sellToken}
          tokenList={sellTokenList}
          onChange={onChangeSellToken}
        />
        <Box h='12px' alignSelf={'flex-end'}>
          <IconButton
            margin={'6px 0'}
            aria-label='Search database'
            borderColor={colors.icWhite}
            color={colors.icWhite}
            icon={<UpDownIcon />}
            onClick={swapTokenLists}
          />
        </Box>
        <InputSelector
          title='To'
          selectedToken={buyToken}
          tokenList={buyTokenList}
          onChange={onChangeBuyToken}
        />
      </Flex>
      <Flex>
        <Button
          background='#F7F1E4'
          border='0'
          borderRadius='12px'
          color='#000'
          fontSize='24px'
          fontWeight='600'
          height='54px'
          w='100%'
        >
          Trade
        </Button>
      </Flex>
    </Flex>
  )
}

const white = '#F6F1E4'
const selectedTabStyle = {
  bg: white,
  borderRadius: '4px',
  color: 'black',
  outline: 0,
}

export default QuickTrade
