import { QuoteAvailable } from './available'
import { QuoteNotAvailable } from './not-available'
import { QuoteDisplay } from './types'

// TODO: isLoading?
type QuoteProps = {
  type: string
  isSelected: boolean
  quote: QuoteDisplay | null
}

export const QuoteResult = (props: QuoteProps) => {
  const { isSelected, quote, type } = props
  return quote ? (
    <QuoteAvailable isSelected={isSelected} quote={quote} type={type} />
  ) : (
    <QuoteNotAvailable type={type} />
  )
}
