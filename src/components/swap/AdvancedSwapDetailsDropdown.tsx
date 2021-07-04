import React from 'react'
import styled from 'styled-components'
import { RoutablePlatform, Trade } from 'dxswap-sdk'
import { useLastTruthy } from '../../hooks/useLast'
import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import { SwapPlatformSelector } from './SwapPlatformSelector'
import border8pxRadius from '../../assets/images/border-8px-radius.png'

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
  width: calc(100% - 20px);
  max-width: 400px;
  color: ${({ theme }) => theme.yellow1};
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 0px 40px 36px -24px rgba(0, 0, 0, 0.32);
  z-index: -1;
  border: 16px solid transparent;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-image: url(${border8pxRadius}) 8;

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease;
`

interface AdvancedSwapDetailsDropdownProps {
  trade?: Trade
  allPlatformTrades?: (Trade | undefined)[] | undefined
  onSelectedPlatformChange: (newPlatform: RoutablePlatform) => void
}

export default function AdvancedSwapDetailsDropdown({
  trade,
  allPlatformTrades,
  onSelectedPlatformChange,
  ...rest
}: AdvancedSwapDetailsDropdownProps) {
  const lastTrade = useLastTruthy(trade)

  return (
    <AdvancedDetailsFooter show={Boolean(trade)}>
      <SwapPlatformSelector
        selectedTrade={trade}
        allPlatformTrades={allPlatformTrades}
        onSelectedPlatformChange={onSelectedPlatformChange}
      />
      <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
      
    </AdvancedDetailsFooter>
  )
}
