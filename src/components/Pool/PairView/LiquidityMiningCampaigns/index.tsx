import { Pair } from 'dxswap-sdk'
import { DateTime, Duration } from 'luxon'
import React, { useMemo, useState } from 'react'
import { useActiveWeb3React } from '../../../../hooks'
import { useActiveLiquidityMiningCampaignsForPair } from '../../../../hooks/useActiveLiquidityMiningCampaignsForPair'
import { useExpiredLiquidityMiningCampaignsForPair } from '../../../../hooks/useExpiredLiquidityMiningCampaignsForPair'
import { useUpcomingLiquidityMiningCampaignsForPair } from '../../../../hooks/useUpcomingLiquidityMiningCampaignsForPair'
import { AutoColumn } from '../../../Column'
import TabBar from '../../../TabBar'
import List from './List'
import TabTitle from './TabTitle'

interface LiquidityMiningCampaignsListProps {
  pair?: Pair
}

export default function LiquidityMiningCampaigns({ pair }: LiquidityMiningCampaignsListProps) {
  const { account } = useActiveWeb3React()
  const lowerExpiredCampaignTimeLimit = useMemo(
    () =>
      DateTime.utc()
        .minus(Duration.fromObject({ days: 30 }))
        .toJSDate(),
    []
  )
  const { loading: loadingActive, wrappedCampaigns: activeWrappedCampaigns } = useActiveLiquidityMiningCampaignsForPair(
    pair
  )
  const {
    loading: loadingUpcoming,
    wrappedCampaigns: upcomingWrappedCampaigns
  } = useUpcomingLiquidityMiningCampaignsForPair(pair)
  const {
    loading: loadingExpired,
    wrappedCampaigns: expiredWrappedCampaigns
  } = useExpiredLiquidityMiningCampaignsForPair(pair, lowerExpiredCampaignTimeLimit)

  const [activeTab, setActiveTab] = useState(account ? 0 : 1)

  return (
    <AutoColumn gap="16px">
      <TabBar
        titles={[
          <TabTitle key="active" loadingAmount={!!(!pair || loadingActive)} itemsAmount={activeWrappedCampaigns.length}>
            Active rewards
          </TabTitle>,
          <TabTitle
            key="active"
            loadingAmount={!!(!pair || loadingUpcoming)}
            itemsAmount={upcomingWrappedCampaigns.length}
          >
            Upcoming
          </TabTitle>,
          <TabTitle
            key="active"
            loadingAmount={!!(!pair || loadingExpired)}
            itemsAmount={expiredWrappedCampaigns.length}
          >
            Expired (30 days)
          </TabTitle>
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />
      {pair ? (
        <>
          {activeTab === 0 && <List loading={loadingActive} stakablePair={pair} items={activeWrappedCampaigns} />}
          {activeTab === 1 && <List loading={loadingUpcoming} stakablePair={pair} items={upcomingWrappedCampaigns} />}
          {activeTab === 2 && <List loading={loadingExpired} stakablePair={pair} items={expiredWrappedCampaigns} />}
        </>
      ) : (
        <List loading />
      )}
    </AutoColumn>
  )
}
