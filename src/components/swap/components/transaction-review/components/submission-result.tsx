import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'

import { TradeButton } from '@/components/trade-button'

interface SubmissionSuccessfulProps {
  success: boolean
  onClick: () => void
}

export function SubmissionResult({
  onClick,
  success,
}: SubmissionSuccessfulProps) {
  return (
    <div className='flex flex-col items-center'>
      <div className='flex flex-col items-center p-4'>
        {success ? (
          <CheckCircleIcon w='32px' h='32px' />
        ) : (
          <WarningIcon w='32px' h='32px' />
        )}
        <div className='p-4 text-center text-3xl'>
          {success
            ? 'You successfully submitted the transaction.'
            : 'Submitting the transaction was cancelled or failed.'}
        </div>
      </div>
      <TradeButton
        isDisabled={false}
        isLoading={false}
        label={'Done'}
        onClick={onClick}
      />
    </div>
  )
}