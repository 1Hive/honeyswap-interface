import React, { useState } from 'react'
import { Settings, X, Info, Code } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'
import { transparentize } from 'polished'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import {
  useExpertModeManager,
  useUserTransactionTTL,
  useUserSlippageTolerance,
  useDarkModeManager
} from '../../state/user/hooks'
import { TYPE, ExternalLink, LinkStyledButton, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import Row, { RowBetween, RowFixed } from '../Row'
import Toggle from '../Toggle'
import TransactionSettings from '../TransactionSettings'
import border8pxRadius from '../../assets/images/border-8px-radius.png'
import { useTransition, animated } from 'react-spring'
import { version } from '../../../package.json'

const StyledDialogOverlay = animated(styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => transparentize(0.65, theme.black)};
`)

const StyledMenuIcon = styled(Settings)`
  height: 18px;
  width: 18px;
  margin: 0 8px;
  cursor: pointer;

  > * {
    stroke: ${({ theme }) => theme.text4};
  }
`

const StyledCloseIcon = styled(X)`
  position: absolute;
  right: 18px;
  height: 20px;
  width: 20px;

  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.bg5};
  }
`
const EmojiWrapper = styled.div`
  position: absolute;
  cursor: pointer;
  bottom: -6px;
  right: 3px;
  font-size: 12px;
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 80px;
  right: 20px;
  width: 322px;
  z-index: 100;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    position: fixed;
    top: initial;
    right: initial;
    justify-content: center;
    align-items: center;
  `};
`

const MenuFlyout = styled.div`
  min-width: 322px;
  max-width: 322px;
  background: ${({ theme }) => transparentize(0.25, theme.bg2)};
  border-radius: 8px;
  backdrop-filter: blur(16px);
  border-radius: 8px;
  border: 8px solid;
  border-radius: 8px;
  border-image: url(${border8pxRadius}) 8;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  height: auto;
  box-shadow: 0px 0px 12px ${({ theme }) => transparentize(0.84, theme.black)};
`

const MenuFlyoutBottom = styled.div`
  width: 215px;
  background: ${({ theme }) => transparentize(0.25, theme.bg2)};
  backdrop-filter: blur(16px);
  border: 8px solid;
  border-radius: 8px;
  border-image: url(${border8pxRadius}) 8;
  font-size: 1rem;
  box-shadow: 0px 0px 12px ${({ theme }) => transparentize(0.84, theme.black)};
  margin-top: 16px;
  padding: 21px 13px;
`

const MenuFlyoutBottomItem = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
`

const InfoBadge = styled.div`
  background: ${({ theme }) => theme.bg3};
  padding: 3px 4px;
  color: ${({ theme }) => theme.text1};
  border-radius: 4px;
  margin-right: 8px;
`

const MenuBanner = styled(ExternalLink)`
  display: flex;
  flex-direction: column;
  position: relative;
  background: ${({ theme }) => theme.primary1};
  border-radius: 4px;
  padding: 9px 16px;
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }

  img {
    top: 0;
    left: 10px;
    height: 100%;
    position: absolute;
  }
`

const FlyoutBottomAligner = styled.div`
  display: flex;
  justify-content: flex-end;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: center;
  `};
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 26px 0;
  background-color: ${({ theme }) => transparentize(0.25, theme.bg2)};
`
const MenuItem = styled(ExternalLink)`
  width: 50%;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`

const CloseTextButton = styled(LinkStyledButton)`
  color: ${({ theme }) => theme.text4};
  font-size: 13px;
  text-decoration: underline;
`

const CODE_LINK = 'https://github.com/1Hive/honeyswap-interface'

export default function SettingsTab() {
  const open = useModalOpen(ApplicationModal.SETTINGS)
  const fadeTransition = useTransition(open, null, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })

  const toggle = useToggleSettingsMenu()
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()
  const [ttl, setTtl] = useUserTransactionTTL()
  const [expertMode, toggleExpertMode] = useExpertModeManager()
  const [darkMode] = useDarkModeManager()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        <ModalContentWrapper>
          <AutoColumn gap="25px">
            <Row style={{ padding: '0 25px', justifyContent: 'center' }}>
              <TYPE.body fontWeight={500} fontSize="20px" color="text3">
                Are you sure?
              </TYPE.body>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </Row>
            <AutoColumn gap="24px" style={{ padding: '0 24px' }}>
              <TYPE.body fontWeight={400} fontSize="16px" lineHeight="20px" color="text1" textAlign="center">
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </TYPE.body>
              <TYPE.body fontWeight={600} fontSize="13px" color="text1" textAlign="center">
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </TYPE.body>
              <ButtonError
                error={true}
                padding={'18px'}
                onClick={() => {
                  toggleExpertMode()
                  setShowConfirmation(false)
                }}
              >
                <TYPE.body fontSize="13px" fontWeight={600} color="text1" id="confirm-expert-mode">
                  Turn on Expert mode
                </TYPE.body>
              </ButtonError>
              <Row style={{ justifyContent: 'center' }}>
                <CloseTextButton onClick={() => setShowConfirmation(false)}>Cancel</CloseTextButton>
              </Row>
            </AutoColumn>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      <StyledMenuIcon onClick={toggle} id={darkMode ? 'open-settings-dialog-button' : 'no'}></StyledMenuIcon>
      {expertMode && (
        <EmojiWrapper onClick={toggle}>
          <span role="img" aria-label="wizard-icon">
            😎
          </span>
        </EmojiWrapper>
      )}
      {fadeTransition.map(
        ({ item, key, props }) =>
          item && (
            <StyledDialogOverlay key={key} style={props}>
              <MenuContainer>
                <MenuFlyout>
                  <AutoColumn gap="md" style={{ padding: '8px' }}>
                    <RowBetween>
                      <Text fontWeight={600} fontSize={14}>
                        Transaction settings
                      </Text>
                      <CloseIcon onClick={toggle} />
                    </RowBetween>
                    <TransactionSettings
                      rawSlippage={userSlippageTolerance}
                      setRawSlippage={setUserslippageTolerance}
                      deadline={ttl}
                      setDeadline={setTtl}
                    />
                    <Text fontWeight={600} fontSize={14}>
                      Interface settings
                    </Text>
                    <RowBetween>
                      <RowFixed>
                        <TYPE.body fontWeight={500} fontSize="12px" lineHeight="15px">
                          Toggle expert mode
                        </TYPE.body>
                        <QuestionHelper text="Bypasses confirmation modals and allows high slippage trades. Use at your own risk." />
                      </RowFixed>
                      <Toggle
                        id="toggle-expert-mode-button"
                        isActive={expertMode}
                        toggle={
                          expertMode
                            ? () => {
                                toggleExpertMode()
                                setShowConfirmation(false)
                              }
                            : () => {
                                toggle()
                                setShowConfirmation(true)
                              }
                        }
                      />
                    </RowBetween>
                    {/* <RowBetween>
                        <RowFixed>
                          <TYPE.body fontWeight={500} fontSize="12px" lineHeight="15px">
                            Toggle Dark Mode
                          </TYPE.body>
                        </RowFixed>
                        <Toggle id="toggle-dark-mode-button" isActive={darkMode} toggle={toggleDarkMode} />
                      </RowBetween> */}
                  </AutoColumn>
                </MenuFlyout>
                <FlyoutBottomAligner>
                  <MenuFlyoutBottom>
                    <MenuFlyoutBottomItem>
                      <MenuItem id="link" href="https://1hive.org/" rel="noopener noreferrer" target="_blank">
                        <Info size={14} />
                        About
                      </MenuItem>
                      <MenuItem id="link" href={CODE_LINK}>
                        <Code size={14} />
                        Code
                      </MenuItem>
                    </MenuFlyoutBottomItem>

                    <MenuFlyoutBottomItem>
                      <InfoBadge>
                        <TYPE.body fontWeight={700} fontSize="8px" letterSpacing="0.16em" color="text1">
                          v{version}
                        </TYPE.body>
                      </InfoBadge>
                    </MenuFlyoutBottomItem>

                    <MenuBanner id="link" href="https://1hive.org/" rel="noopener noreferrer" target="_blank">
                      <TYPE.body fontWeight={700} fontSize="10px" letterSpacing="3px" color="text1" marginBottom="4px">
                        Built by Bees
                      </TYPE.body>
                      <TYPE.body fontWeight={500} fontSize="10px" letterSpacing="3px" color="text1">
                        1Hive.org
                      </TYPE.body>
                    </MenuBanner>
                  </MenuFlyoutBottom>
                </FlyoutBottomAligner>
              </MenuContainer>
            </StyledDialogOverlay>
          )
      )}
    </StyledMenu>
  )
}
