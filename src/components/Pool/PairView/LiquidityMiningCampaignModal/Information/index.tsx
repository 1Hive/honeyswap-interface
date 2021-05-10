import { LiquidityMiningCampaign } from 'dxswap-sdk'
import { DateTime } from 'luxon'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import { useNativeCurrencyUSDPrice } from '../../../../../hooks/useNativeCurrencyUSDPrice'
import { getRemainingRewardsUSD } from '../../../../../utils/liquidityMining'
import { AutoColumn } from '../../../../Column'
import Countdown from '../../../../Countdown'
import CurrencyLogo from '../../../../CurrencyLogo'
import Row from '../../../../Row'
import ApyBadge from '../../../ApyBadge'
import DataRow from '../DataRow'

const Divider = styled.div`
  height: 100%;
  width: 1px;
  background: ${props => props.theme.bg5};
`

interface LiquidityMiningInformationProps {
  campaign: LiquidityMiningCampaign
}

export default function LiquidityMiningInformation({ campaign }: LiquidityMiningInformationProps) {
  const { currentlyActive, locked, startsAt, endsAt, apy } = campaign
  const { loading: loadingNativeCurrencyUSDPrice, nativeCurrencyUSDPrice } = useNativeCurrencyUSDPrice()

  return (
    <Flex flexDirection={['column', 'row']} justifyContent="stretch" width="100%">
      <Flex flexDirection="column" flex="1">
        <DataRow title="APY" value={<ApyBadge apy={apy} />} />
        {!campaign.ended && (
          <DataRow
            title={currentlyActive ? 'Time left' : 'Starts in'}
            value={<Countdown to={parseInt(currentlyActive ? endsAt.toString() : startsAt.toString())} />}
          />
        )}
        <DataRow
          title="Rewards left"
          value={
            <AutoColumn gap="4px" justify="flex-end">
              {campaign.remainingRewards.map(remainingReward => (
                <Row alignItems="center" justifyContent="flex-end" key={remainingReward.token.address}>
                  {remainingReward.toSignificant(3)}
                  <CurrencyLogo marginLeft={4} size="14px" currency={remainingReward.token} />
                </Row>
              ))}
            </AutoColumn>
          }
        />
        <DataRow
          title="Rewards left (USD)"
          value={
            loadingNativeCurrencyUSDPrice ? (
              <Skeleton width="60px" />
            ) : (
              `$${getRemainingRewardsUSD(campaign, nativeCurrencyUSDPrice).toFixed(2)}`
            )
          }
        />
      </Flex>
      <Box display={['none', 'flex']} mx="18px">
        <Divider />
      </Box>
      <Flex flexDirection="column" flex="1">
        <DataRow
          title="Starts at"
          value={DateTime.fromSeconds(parseInt(startsAt.toString())).toFormat('dd-MM-yyyy hh:mm')}
        />
        <DataRow
          title="Ends at"
          value={DateTime.fromSeconds(parseInt(endsAt.toString())).toFormat('dd-MM-yyyy hh:mm')}
        />
        <DataRow title="Timelock" value={locked ? 'ON' : 'OFF'} />
        <DataRow
          title="Max pool size"
          value={
            campaign.stakingCap.equalTo('0')
              ? 'UNLIMITED'
              : `${campaign.stakingCap.toSignificant(4)} ${campaign.targetedPair.token0.symbol}/${
                  campaign.targetedPair.token1.symbol
                } LP`
          }
        />
      </Flex>
    </Flex>
  )
}
