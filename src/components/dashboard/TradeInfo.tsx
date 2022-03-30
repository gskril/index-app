import { Box, Flex, Text } from '@chakra-ui/react'

export interface TradeInfoItem {
  title: string
  value: string
}

const excludePriceItem = (tradeInfoItem: TradeInfoItem): boolean =>
  tradeInfoItem.title !== 'Price'

const TradeInfoItemRow = (props: { title: string; value: string }) => {
  const parsedValue = parseFloat(props.value)
  const value = isNaN(parsedValue) ? props.value : parsedValue.toFixed(3)
  return (
    <Flex direction='column'>
      <Text fontSize='14px' fontWeight='500'>
        {props.title}
      </Text>
      <Text fontSize='20px' fontWeight='700'>
        {value}
      </Text>
    </Flex>
  )
}

const TradeInfo = (props: { data: TradeInfoItem[] }) => {
  return (
    <Flex direction='column'>
      {props.data.filter(excludePriceItem).map((item, index) => (
        <Box key={index} mb='16px'>
          <TradeInfoItemRow title={item.title} value={item.value} />
        </Box>
      ))}
    </Flex>
  )
}

export default TradeInfo
