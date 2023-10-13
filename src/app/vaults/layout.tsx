'use client'

import { Flex } from '@chakra-ui/react'

import Footer from '@/components/page/Footer'
import HeaderV2 from '@/components/page/header/HeaderV2'

import { Providers } from './providers'

export default function SwapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <HeaderV2 />
      <Flex direction='column' mb='50px'>
        <Flex
          w={['390px', '500px', '820px', '1024px']}
          m={['0', '0 auto']}
          p={[
            '100px 16px 0px 16px',
            '100px 16px 0px 16px',
            '128px 0 0 0',
            '128px 0 0 0',
          ]}
        >
          {children}
        </Flex>
      </Flex>
      <Footer />
    </Providers>
  )
}
