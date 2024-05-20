import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

import { LeverageType } from '@/app/leverage/provider'

type FeesItemProps = {
  label: string
  showPositiveFee?: boolean
  percent: string
  valueUsd: string
}

function FeesItem(props: FeesItemProps) {
  return (
    <div className='text-ic-gray-300 flex flex-row items-center justify-between text-xs'>
      <div className='font-medium'>{props.label}</div>
      <div className='flex flex-row gap-1'>
        <div
          className={clsx(
            'font-bold',
            props.showPositiveFee ? 'text-ic-green' : 'text-ic-white',
          )}
        >{`${props.showPositiveFee ? '+' : ''}${props.percent}`}</div>
        <div className='font-normal'>{props.valueUsd}</div>
      </div>
    </div>
  )
}

type FeesProps = {
  costOfCarry: number | null
  leverageType: LeverageType
}

export function Fees(props: FeesProps) {
  return (
    <Disclosure as='div' className='rounded-xl border border-[#3A6060]'>
      {({ open }) => (
        <div className='p-4'>
          <dt>
            <Disclosure.Button className='text-ic-gray-300 flex w-full items-center justify-between text-left'>
              <span className='text-xs font-medium'>Costs and Fees</span>
              <div className='flex flex-row items-center gap-1'>
                <span className='flex items-center'>
                  {open ? (
                    <ChevronUpIcon className='h-6 w-6' aria-hidden='true' />
                  ) : (
                    <ChevronDownIcon className='h-6 w-6' aria-hidden='true' />
                  )}
                </span>
              </div>
            </Disclosure.Button>
          </dt>
          <Disclosure.Panel as='dd' className='mt-2 flex flex-col gap-2'>
            <FeesItem
              label='Streaming Fee'
              percent={
                props.leverageType === LeverageType.Long3x ? '5.48%' : '3.65%'
              }
              valueUsd={''}
            />
            <FeesItem label='Mint Fee' percent={'0.10%'} valueUsd={''} />
            <FeesItem label='Redeem Fee' percent={'0.10%'} valueUsd={''} />
            {props.costOfCarry !== null && (
              <FeesItem
                label='Cost of Carry'
                showPositiveFee={props.costOfCarry > 0}
                percent={new Intl.NumberFormat('en-us', {
                  style: 'percent',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Math.abs(props.costOfCarry))}
                valueUsd={''}
              />
            )}
            {/* // See if we need this */}
            {/* <div className='text-ic-gray-300 flex flex-row items-center justify-between text-xs'>
              <div className='font-normal'>Network Fee</div>
              <div>
                <GasFees valueUsd={gasFeesUsd} value={gasFeesEth} />
              </div>
            </div> */}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  )
}