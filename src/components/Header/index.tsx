import React from 'react'
import { NavLink, withRouter } from 'react-router-dom'

import styled from 'styled-components'

import Logo from '../../assets/svg/logo.svg'
import LogoDark from '../../assets/svg/logo_white.svg'
import Wordmark from '../../assets/svg/wordmark.svg'
import WordmarkDark from '../../assets/svg/wordmark_white.svg'
import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useNativeCurrencyBalances } from '../../state/wallet/hooks'

import Settings from '../Settings'

import Row, { RowFixed } from '../Row'
import { Text } from 'rebass'
import Web3Status from '../Web3Status'
import { useTranslation } from 'react-i18next'
import { ExternalLink, TYPE } from '../../theme'
import MobileOptions from './MobileOptions'
import { useNativeCurrency } from '../../hooks/useNativeCurrency'

import { useWeb3React } from '@web3-react/core'

const HeaderFrame = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  padding: 1rem;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: flex-end;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    height: 72px;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
   flex-direction: row-reverse;
    align-items: center;
  `};
`

const MoreLinksIcon = styled(HeaderElement)`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: flex;
  `};
`

const MobileSettingsWrap = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: block;
    align-items: center;
  `}
`

const DesktopSettingsWrap = styled.div`
  display: flex;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `}
`

const HeaderRow = styled(RowFixed)<{ isDark: boolean }>`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 1rem 0 1rem 0;
  `};
`

const AccountElement = styled.div<{ active: boolean, networkError: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.networkError ? 'transparent' : ({ theme }) => theme.bg1};
  border: solid 2px transparent;
  box-sizing: border-box;
  color: ${({ theme }) => theme.yellow1};
  border-radius: 8px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: solid 2px transparent;
  }
`

const Title = styled.a`
  display: flex;
  align-items: center;
  pointer-events: auto;
  justify-self: flex-start;
  margin-right: 30px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-self: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0px;
  `};
  :hover {
    cursor: pointer;
  }
`

const TitleText = styled(Row)`
  width: fit-content;
  white-space: nowrap;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const DXswapIcon = styled.div`
  img {
    margin-left: 5px;
    margin-bottom: -5px;
  }
`

const activeClassName = 'ACTIVE'

export const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text5};
  width: fit-content;
  margin: 0 16px;
  font-weight: 400;
  font-size: 16px;
  line-height: 19.5px;

  &.${activeClassName} {
    font-weight: 600;
    color: ${({ theme }) => theme.white};
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

const StyledExternalLink = styled(ExternalLink).attrs({
  activeClassName
})<{ isActive?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text5};
  font-weight: 400;
  font-size: 16px;
  line-height: 19.5px;
  width: fit-content;
  text-decoration: none !important;
  margin: 0 12px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`

function Header({ history }: { history: any }) {
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()
  const { error } = useWeb3React()

  const nativeCurrency = useNativeCurrency()
  const userNativeCurrencyBalances = useNativeCurrencyBalances(account ? [account] : [])
  const userNativeCurrencyBalance = userNativeCurrencyBalances?.[account || '']
  const [isDark] = useDarkModeManager()

  return (
    <HeaderFrame>
      <HeaderRow isDark={isDark}>
        <Title href=".">
          <DXswapIcon>
            <img src={isDark ? LogoDark : Logo} alt="logo" />
          </DXswapIcon>
          <TitleText>
            <img style={{ marginLeft: '4px', marginTop: '4px' }} src={isDark ? WordmarkDark : Wordmark} alt="logo" />
          </TitleText>
        </Title>
        <HeaderLinks>
          <StyledNavLink id={`swap-nav-link`} to={'/swap'} isActive={() => history.location.pathname.includes('/swap')}>
            {t('Swap')}
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/pool'}
            isActive={() =>
              history.location.pathname.includes('/pool') ||
              history.location.pathname.includes('/add') ||
              history.location.pathname.includes('/remove') ||
              history.location.pathname.includes('/create')
            }
          >
            {t('pool')}
          </StyledNavLink>
          <StyledExternalLink id={`stake-nav-link`} href={`https://1hive.org/`}>
            Governance{' '}
            <Text ml="4px" fontSize="11px">
              ↗
            </Text>
          </StyledExternalLink>
          <StyledExternalLink id={`stake-nav-link`} href={`https://1hive.io/`}>
            Farms{' '}
            <Text ml="4px" fontSize="11px">
              ↗
            </Text>
          </StyledExternalLink>
          <StyledExternalLink id={`stake-nav-link`} href={`https://info.honeyswap.org/`}>
            Charts{' '}
            <Text ml="4px" fontSize="11px">
              ↗
            </Text>
          </StyledExternalLink>
          <MobileSettingsWrap>
            <Settings />
          </MobileSettingsWrap>
          <MoreLinksIcon>
            <MobileOptions history={history} />
          </MoreLinksIcon>
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement>
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }} networkError={!!error}>
            {account && userNativeCurrencyBalance ? (
              <TYPE.black
                style={{ flexShrink: 0 }}
                ml="18px"
                mr="12px"
                fontWeight={700}
                fontSize="12px"
                lineHeight="15px"
                letterSpacing="0.08em"
              >
                {userNativeCurrencyBalance?.toSignificant(4)} {nativeCurrency.symbol}
              </TYPE.black>
            ) : null }
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <DesktopSettingsWrap>
          <Settings />
        </DesktopSettingsWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}

export default withRouter(Header)
