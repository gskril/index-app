import { formatTvl } from '@/app/products/utils/formatters'
import { PeriodSelector } from '@/components/charts/period-selector'
import TvlXyChart from '@/components/charts/tvl-xy-chart'
import { useChartData } from '@/components/charts/use-chart-data'
import { cn } from '@/lib/utils/tailwind'

type Props = {
  indexTokenAddress: string
  isFetchingStats?: boolean
  tvl: number | null
}

export function TvlChart({
  indexTokenAddress,
  isFetchingStats = false,
  tvl,
}: Props) {
  const { historicalData, selectedPeriod, setSelectedPeriod } = useChartData(
    indexTokenAddress,
    'pav',
  )

  return (
    <div className='border-ic-gray-200 dark:border-ic-gray-600 flex h-full w-full flex-col rounded-lg border bg-[#F7F8F8] dark:bg-[#1C2C2E]'>
      <div className='text-ic-gray-800 dark:text-ic-white flex w-full items-stretch px-4 pt-4 md:px-8 md:pt-6'>
        <div
          className={cn(
            'basis-1/2 self-center text-lg font-semibold md:basis-1/4 md:text-2xl',
            tvl === null &&
              isFetchingStats &&
              'bg-ic-gray-200 h-[18px] animate-pulse rounded-md text-opacity-0 md:h-8',
          )}
        >
          {formatTvl(tvl)}
        </div>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
      </div>
      <div className='block h-full w-full dark:hidden'>
        <TvlXyChart data={historicalData} selectedPeriod={selectedPeriod} />
      </div>
      <div className='hidden h-full w-full dark:block'>
        <TvlXyChart
          data={historicalData}
          selectedPeriod={selectedPeriod}
          isDark={true}
        />
      </div>
    </div>
  )
}
