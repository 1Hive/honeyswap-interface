import React, { useRef } from 'react'
import styled from 'styled-components'
import { ApplicationModal } from '../../state/application/actions'
import { useCloseModals, useModalOpen, useToggleMobileMenu } from '../../state/application/hooks'
import { ExternalLink } from '../../theme'
import { darken, transparentize } from 'polished'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { Menu } from 'react-feather'
import Modal from '../Modal'
import { Box, Flex } from 'rebass'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text5};
  width: fit-content;
  height: 36px;
  font-weight: 400;
  font-size: 16px;
  line-height: 19.5px;

  &.${activeClassName} {
    font-weight: 600;
    color: ${({ theme }) => theme.white};
  }
`
const StyledExternalLink = styled(ExternalLink)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text5};
  font-weight: 400;
  font-size: 16px;
  line-height: 19.5px;
  height: 36px;

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const Wrapper = styled(Flex)`
  width: 100%;
  background: ${({ theme }) => transparentize(0.25, theme.bg2)};
`

export default function MobileOptions({ history }: { history: any }) {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.MOBILE)
  const toggle = useToggleMobileMenu()
  const closeModals = useCloseModals()
  const { t } = useTranslation()
  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <Menu size={24} onClick={toggle} />
      <Modal isOpen={open} onDismiss={toggle}>
        <Wrapper flexDirection="column" p="16px 24px">
          <Box>
            <StyledNavLink
              id={`swap-nav-link`}
              to={'/swap'}
              onClick={closeModals}
              isActive={() => history.location.pathname.includes('/swap')}
            >
              {t('swap')}
            </StyledNavLink>
          </Box>
          <Box>
            <StyledNavLink
              id={`pool-nav-link`}
              to={'/pool'}
              onClick={closeModals}
              isActive={() =>
                history.location.pathname.includes('/pools') ||
                history.location.pathname.includes('/add') ||
                history.location.pathname.includes('/remove') ||
                history.location.pathname.includes('/create')
              }
            >
              {t('pool')}
            </StyledNavLink>
          </Box>
          <Box>
            <StyledExternalLink id={`stake-nav-link`} href={'https://1hive.org/'}>
              Governance <span style={{ fontSize: '11px' }}>↗</span>
            </StyledExternalLink>
          </Box>
          <Box>
            <StyledExternalLink id={`stake-nav-link`} href={'https://1hive.io/'}>
              Farms <span style={{ fontSize: '11px' }}>↗</span>
            </StyledExternalLink>
          </Box>
          <Box>
            <StyledExternalLink id={`stake-nav-link`} href={'https://info.honeyswap.org/'}>
              Charts <span style={{ fontSize: '11px' }}>↗</span>
            </StyledExternalLink>
          </Box>
        </Wrapper>
      </Modal>
    </StyledMenu>
  )
}
