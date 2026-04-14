import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BigNumber, ethers } from 'ethers'
import styled from 'styled-components'
import {
  BASE_CHAIN_ID,
  BASE_CHAIN_HEX,
  BASE_PROVIDER,
  BUY_URL,
  capDigits,
  formatEth,
  formatOwner,
  LEADERBOARD_ABI,
  LEADERBOARD_ADDRESS,
  MARKEE_ABI,
  MIN_INCREMENT,
} from './constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MarkeeModalProps {
  minimumPrice: BigNumber
  maxMessageLength: number
  topFundsAdded: BigNumber
  takeTopSpot: BigNumber
  currentMessage: string
  currentName: string
  onClose: () => void
  onSuccess: () => void
}

interface TopEntry {
  address: string
  funds: BigNumber
  message: string
  name: string
}

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.modalBG};
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`

const DialogBox = styled.div`
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 100%;
    max-height: 100vh;
    border-radius: 16px 16px 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  `};
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0;
`

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const SiteName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
`

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text3};
  font-size: 20px;
  line-height: 1;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    color: ${({ theme }) => theme.text1};
    background: ${({ theme }) => theme.bg2};
  }
`

const CurrentMessageBox = styled.div`
  margin: 16px 20px 0;
  padding: 12px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 10px;
  border-left: 3px solid ${({ theme }) => theme.primary2};
`

const CurrentMessageText = styled.p`
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  word-break: break-word;
`

const CurrentOwner = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  color: ${({ theme }) => theme.text4};
`

const TabBar = styled.div`
  display: flex;
  margin: 16px 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
`

const Tab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: ${({ active }) => (active ? '600' : '400')};
  color: ${({ active, theme }) => (active ? theme.text1 : theme.text3)};
  border-bottom: 2px solid ${({ active, theme }) => (active ? theme.primary2 : 'transparent')};
  margin-bottom: -1px;
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.text1};
  }
`

const TabContent = styled.div`
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.text3};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 6px;
`

const TextArea = styled.textarea`
  width: 100%;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 10px;
  color: ${({ theme }) => theme.text1};
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 10px 12px;
  resize: none;
  box-sizing: border-box;
  min-height: 80px;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.primary2};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

const CharCount = styled.div<{ near: boolean }>`
  text-align: right;
  font-size: 11px;
  color: ${({ near, theme }) => (near ? theme.yellow2 : theme.text4)};
  margin-top: 2px;
`

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 10px;
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
  padding: 10px 12px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.primary2};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

const AmountRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const PresetButton = styled.button`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 8px;
  color: ${({ theme }) => theme.text2};
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.primary2};
    color: ${({ theme }) => theme.text1};
  }
`

const AmountInput = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 10px;
  color: ${({ theme }) => theme.text1};
  font-size: 16px;
  font-weight: 600;
  padding: 10px 12px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.primary2};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text4};
    font-weight: 400;
  }
`

const BalanceLabel = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  color: ${({ theme }) => theme.text3};
  padding: 0;
  text-decoration: underline;
  text-align: right;

  &:hover {
    color: ${({ theme }) => theme.text1};
  }
`

const Warning = styled.div<{ variant?: 'error' | 'warn' | 'info' }>`
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: ${({ variant, theme }) =>
    variant === 'error'
      ? 'rgba(255,104,113,0.12)'
      : variant === 'info'
      ? 'rgba(33,114,229,0.12)'
      : 'rgba(243,132,30,0.12)'};
  color: ${({ variant, theme }) =>
    variant === 'error' ? theme.red1 : variant === 'info' ? theme.blue1 : theme.yellow2};
`

const SwitchButton = styled.button`
  background: ${({ theme }) => theme.primary2};
  border: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.bg1};
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
  }
`

const ActionButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${({ disabled, theme }) => (disabled ? theme.bg3 : theme.primary2)};
  color: ${({ disabled, theme }) => (disabled ? theme.text4 : theme.bg1)};
  font-size: 16px;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: opacity 0.15s;
  margin-top: 4px;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`

const BoostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
`

const BoostEntry = styled.div<{ selected: boolean }>`
  padding: 10px 12px;
  border-radius: 10px;
  border: 2px solid ${({ selected, theme }) => (selected ? theme.primary2 : theme.bg3)};
  background: ${({ selected, theme }) => (selected ? theme.bg2 : 'transparent')};
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: flex-start;
  gap: 8px;

  &:hover {
    border-color: ${({ theme }) => theme.primary2};
    background: ${({ theme }) => theme.bg2};
  }
`

const Badge = styled.span`
  background: ${({ theme }) => theme.primary2};
  color: ${({ theme }) => theme.bg1};
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
  padding: 1px 5px;
  flex-shrink: 0;
  margin-top: 2px;
`

const BoostMessage = styled.p`
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.text2};
  word-break: break-word;
`

const BoostMeta = styled.p`
  margin: 3px 0 0;
  font-size: 11px;
  color: ${({ theme }) => theme.text4};
`

const ExternalLink = styled.a`
  font-size: 12px;
  color: ${({ theme }) => theme.primary2};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const ModalFooter = styled.div`
  padding: 0 20px 20px;
  font-size: 12px;
  color: ${({ theme }) => theme.text4};
  line-height: 1.5;
`

const SuccessBox = styled.div`
  padding: 40px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

const Checkmark = styled.div`
  font-size: 48px;
  line-height: 1;
`

const SuccessTitle = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.green1};
`

const SuccessNote = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.text3};
`

const ErrorText = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.red1};
  word-break: break-all;
`

const Skeleton = styled.div`
  height: 58px;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg3};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MarkeeModal({
  minimumPrice,
  maxMessageLength,
  topFundsAdded,
  takeTopSpot,
  currentMessage,
  currentName,
  onClose,
  onSuccess,
}: MarkeeModalProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'boost'>('buy')
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [selectedBoostAddress, setSelectedBoostAddress] = useState<string | null>(null)

  const [txHash, setTxHash] = useState<string | null>(null)
  const [txPending, setTxPending] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  const [account, setAccount] = useState<string | undefined>()
  const [chainId, setChainId] = useState<number>(0)
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))

  const [topEntries, setTopEntries] = useState<TopEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)

  const backdropRef = useRef<HTMLDivElement>(null)

  // ---------------------------------------------------------------------------
  // Wallet state from window.ethereum (independent of web3-react chain restrictions)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const eth = (window as any).ethereum
    if (!eth) return

    const handleAccounts = (accounts: string[]) => setAccount(accounts[0] || undefined)
    const handleChain = (id: string) => setChainId(parseInt(id, 16))

    eth.request({ method: 'eth_accounts' }).then(handleAccounts).catch(() => {})
    eth.request({ method: 'eth_chainId' }).then(handleChain).catch(() => {})

    eth.on('accountsChanged', handleAccounts)
    eth.on('chainChanged', handleChain)

    return () => {
      eth.removeListener('accountsChanged', handleAccounts)
      eth.removeListener('chainChanged', handleChain)
    }
  }, [])

  const isConnected = !!account
  const isOnBase = chainId === BASE_CHAIN_ID

  // Balance on Base
  useEffect(() => {
    if (!account || !isOnBase) return
    const eth = (window as any).ethereum
    if (!eth) return
    const provider = new ethers.providers.Web3Provider(eth)
    provider.getBalance(account).then(setBalance).catch(() => {})
  }, [account, isOnBase])

  // ---------------------------------------------------------------------------
  // Boost tab: load top markees from contract
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'boost') return
    setLoadingEntries(true)

    const contract = new ethers.Contract(LEADERBOARD_ADDRESS, LEADERBOARD_ABI, BASE_PROVIDER)
    contract
      .getTopMarkees(BigNumber.from(10))
      .then(async ([addresses, funds]: [string[], BigNumber[]]) => {
        const active = addresses.filter((_: string, i: number) => !funds[i].isZero())
        const activeFunds = funds.filter((f: BigNumber) => !f.isZero())

        const entries: TopEntry[] = await Promise.all(
          active.map(async (addr: string, i: number) => {
            const markeeContract = new ethers.Contract(addr, MARKEE_ABI, BASE_PROVIDER)
            const [msg, nm] = await Promise.all([
              markeeContract.message().catch(() => ''),
              markeeContract.name().catch(() => ''),
            ])
            return { address: addr, funds: activeFunds[i], message: msg, name: nm }
          })
        )
        setTopEntries(entries)
        if (entries.length > 0 && !selectedBoostAddress) {
          setSelectedBoostAddress(entries[0].address)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEntries(false))
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) {
        if (txHash) onSuccess()
        else onClose()
      }
    },
    [txHash, onClose, onSuccess]
  )

  // ---------------------------------------------------------------------------
  // Amount helpers
  // ---------------------------------------------------------------------------
  const handleAmountChange = (raw: string) => {
    const sanitized = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setAmountInput(capDigits(sanitized))
  }

  const fillBalance = () => {
    const ethStr = ethers.utils.formatEther(balance)
    setAmountInput(capDigits(ethStr))
  }

  let amountBN = BigNumber.from(0)
  try {
    if (amountInput && amountInput !== '.' && amountInput !== '') {
      amountBN = ethers.utils.parseEther(amountInput)
    }
  } catch {
    // leave as 0
  }

  const exceedsBalance = isOnBase && amountBN.gt(BigNumber.from(0)) && amountBN.gt(balance)
  const belowMinOnBase = isOnBase && balance.gt(BigNumber.from(0)) && balance.lt(minimumPrice)

  // ---------------------------------------------------------------------------
  // Boost tab derived values
  // ---------------------------------------------------------------------------
  const selectedEntry = topEntries.find(e => e.address === selectedBoostAddress) ?? null
  const topEntry = topEntries[0] ?? null
  const selectedIsTop = selectedEntry && topEntry && selectedEntry.address === topEntry.address

  let boostTakeTopSpot = BigNumber.from(0)
  if (selectedEntry && topEntry) {
    if (selectedIsTop) {
      boostTakeTopSpot = selectedEntry.funds.add(MIN_INCREMENT)
    } else {
      boostTakeTopSpot = topEntry.funds.sub(selectedEntry.funds).add(MIN_INCREMENT)
    }
  }

  // ---------------------------------------------------------------------------
  // Transactions
  // ---------------------------------------------------------------------------
  const getSigner = () => {
    const eth = (window as any).ethereum
    if (!eth) return null
    return new ethers.providers.Web3Provider(eth).getSigner()
  }

  const switchToGnosis = async () => {
    const eth = (window as any).ethereum
    if (!eth) return
    await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x64' }] }).catch(() => {})
  }

  const handleBuy = async () => {
    if (!account || !isOnBase) return
    const signer = getSigner()
    if (!signer) return

    setTxPending(true)
    setTxError(null)

    try {
      const contract = new ethers.Contract(LEADERBOARD_ADDRESS, LEADERBOARD_ABI, signer)
      const tx = await contract.createMarkee(message, name, { value: amountBN })
      await tx.wait()
      setTxHash(tx.hash)
      switchToGnosis()
    } catch (err) {
      const e = err as any
      const msg: string = e?.data?.message ?? e?.message ?? 'Transaction failed'
      setTxError(msg.length > 120 ? msg.slice(0, 120) + '...' : msg)
    } finally {
      setTxPending(false)
    }
  }

  const handleBoost = async () => {
    if (!account || !isOnBase || !selectedBoostAddress) return
    const signer = getSigner()
    if (!signer) return

    setTxPending(true)
    setTxError(null)

    try {
      const contract = new ethers.Contract(LEADERBOARD_ADDRESS, LEADERBOARD_ABI, signer)
      const tx = await contract.addFunds(selectedBoostAddress, { value: amountBN })
      await tx.wait()
      setTxHash(tx.hash)
      switchToGnosis()
    } catch (err) {
      const e = err as any
      const msg: string = e?.data?.message ?? e?.message ?? 'Transaction failed'
      setTxError(msg.length > 120 ? msg.slice(0, 120) + '...' : msg)
    } finally {
      setTxPending(false)
    }
  }

  const handleConnect = async () => {
    const eth = (window as any).ethereum
    if (!eth) {
      window.open('https://metamask.io', '_blank')
      return
    }
    await eth.request({ method: 'eth_requestAccounts' }).catch(() => {})
  }

  const handleSwitchToBase = async () => {
    const eth = (window as any).ethereum
    if (!eth) return
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_CHAIN_HEX }],
      })
    } catch (switchErr) {
      if ((switchErr as any).code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BASE_CHAIN_HEX,
              chainName: 'Base',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            },
          ],
        })
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Buy tab submit disabled logic
  // ---------------------------------------------------------------------------
  const buyDisabled =
    txPending ||
    !isConnected ||
    !isOnBase ||
    amountBN.isZero() ||
    exceedsBalance ||
    message.trim().length === 0

  const boostDisabled =
    txPending ||
    !isConnected ||
    !isOnBase ||
    amountBN.isZero() ||
    exceedsBalance ||
    !selectedBoostAddress

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const honeyLogo = '🍯'

  return (
    <Backdrop ref={backdropRef} onClick={handleBackdropClick}>
      <DialogBox onClick={e => e.stopPropagation()}>
        {/* Header */}
        <ModalHeader>
          <ModalTitle>
            <span style={{ fontSize: 22 }}>{honeyLogo}</span>
            <SiteName>Honeyswap Markee</SiteName>
          </ModalTitle>
          <CloseButton
            onClick={() => {
              if (txHash) onSuccess()
              else onClose()
            }}
            aria-label="Close"
          >
            ✕
          </CloseButton>
        </ModalHeader>

        {/* Success state */}
        {txHash ? (
          <SuccessBox>
            <Checkmark>✓</Checkmark>
            <SuccessTitle>Transaction confirmed!</SuccessTitle>
            <ExternalLink
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Basescan ↗
            </ExternalLink>
            <SuccessNote>Refreshing in a moment...</SuccessNote>
          </SuccessBox>
        ) : (
          <>
            {/* Current top message */}
            <CurrentMessageBox>
              <CurrentMessageText>&ldquo;{currentMessage}&rdquo;</CurrentMessageText>
              {currentName && (
                <CurrentOwner>{formatOwner(currentName)}</CurrentOwner>
              )}
            </CurrentMessageBox>

            {/* Tabs */}
            <TabBar>
              <Tab active={activeTab === 'buy'} onClick={() => setActiveTab('buy')}>
                Buy a Message
              </Tab>
              <Tab active={activeTab === 'boost'} onClick={() => setActiveTab('boost')}>
                Boost Existing
              </Tab>
            </TabBar>

            {/* Buy tab */}
            {activeTab === 'buy' && (
              <TabContent>
                {/* Wrong network banner */}
                {isConnected && !isOnBase && (
                  <Warning variant="warn">
                    <span>This leaderboard is on Base</span>
                    <SwitchButton onClick={handleSwitchToBase}>Switch to Base</SwitchButton>
                  </Warning>
                )}

                {/* Low balance banner */}
                {isConnected && isOnBase && belowMinOnBase && (
                  <Warning variant="error">
                    Your ETH balance on Base is below the minimum ({formatEth(minimumPrice)} ETH)
                  </Warning>
                )}

                {/* Message */}
                <div>
                  <Label htmlFor="markee-message">Your Message</Label>
                  <TextArea
                    id="markee-message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    maxLength={maxMessageLength}
                    placeholder="What do you want the world to see?"
                    rows={3}
                  />
                  <CharCount near={message.length > maxMessageLength * 0.8}>
                    {message.length} / {maxMessageLength}
                  </CharCount>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="markee-name">Your Name (optional)</Label>
                  <Input
                    id="markee-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="ENS, handle, or leave blank"
                  />
                </div>

                {/* Amount */}
                <div>
                  <Label>Amount (ETH on Base)</Label>
                  <AmountRow>
                    {topFundsAdded.gt(BigNumber.from(0)) && (
                      <PresetButton
                        onClick={() => {
                          setAmountInput(capDigits(ethers.utils.formatEther(takeTopSpot)))
                        }}
                      >
                        Take top spot<br />
                        <span style={{ fontSize: 10, fontWeight: 400 }}>
                          {formatEth(takeTopSpot)} ETH
                        </span>
                      </PresetButton>
                    )}
                    <PresetButton
                      onClick={() => {
                        setAmountInput(capDigits(ethers.utils.formatEther(minimumPrice)))
                      }}
                    >
                      Minimum<br />
                      <span style={{ fontSize: 10, fontWeight: 400 }}>
                        {formatEth(minimumPrice)} ETH
                      </span>
                    </PresetButton>
                    <AmountInput
                      type="text"
                      inputMode="decimal"
                      value={amountInput}
                      onChange={e => handleAmountChange(e.target.value)}
                      placeholder="0.000"
                    />
                  </AmountRow>
                  {isConnected && isOnBase && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <BalanceLabel onClick={fillBalance}>
                        Balance: {formatEth(balance, 4)} ETH
                      </BalanceLabel>
                    </div>
                  )}
                  {exceedsBalance && (
                    <ErrorText>Amount exceeds your balance</ErrorText>
                  )}
                </div>

                {/* CTA */}
                {!isConnected ? (
                  <ActionButton onClick={handleConnect} disabled={false}>
                    Connect Wallet
                  </ActionButton>
                ) : (
                  <ActionButton disabled={buyDisabled} onClick={handleBuy}>
                    {txPending ? 'Confirm in wallet...' : 'Buy Message'}
                  </ActionButton>
                )}

                {txError && <ErrorText>{txError}</ErrorText>}
              </TabContent>
            )}

            {/* Boost tab */}
            {activeTab === 'boost' && (
              <TabContent>
                {/* Wrong network banner */}
                {isConnected && !isOnBase && (
                  <Warning variant="warn">
                    <span>This leaderboard is on Base</span>
                    <SwitchButton onClick={handleSwitchToBase}>Switch to Base</SwitchButton>
                  </Warning>
                )}

                {/* Entry list */}
                {loadingEntries ? (
                  <>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                  </>
                ) : topEntries.length === 0 ? (
                  <Warning variant="info">No messages yet. Be the first!</Warning>
                ) : (
                  <BoostList>
                    {topEntries.map((entry, i) => (
                      <BoostEntry
                        key={entry.address}
                        selected={selectedBoostAddress === entry.address}
                        onClick={() => setSelectedBoostAddress(entry.address)}
                      >
                        {i === 0 && <Badge>#1</Badge>}
                        <div style={{ flex: 1 }}>
                          <BoostMessage>{entry.message || '(no message)'}</BoostMessage>
                          <BoostMeta>
                            {formatOwner(entry.name) || entry.address.slice(0, 8) + '...'}{' '}
                            &middot; {formatEth(entry.funds)} ETH
                          </BoostMeta>
                        </div>
                      </BoostEntry>
                    ))}
                  </BoostList>
                )}

                {/* Edit link */}
                {!loadingEntries && topEntries.length > 0 && (
                  <ExternalLink href={BUY_URL} target="_blank" rel="noopener noreferrer">
                    {topEntries.length > 5
                      ? 'See more messages and edit messages you own. ↗'
                      : 'Edit messages you own on the Markee app. ↗'}
                  </ExternalLink>
                )}

                {/* Selected entry note */}
                {selectedEntry && selectedIsTop && (
                  <Warning variant="info">
                    This message has the top spot. Add more funds to make it harder to reach.
                  </Warning>
                )}

                {/* Amount */}
                <div>
                  <Label>Amount (ETH on Base)</Label>
                  <AmountRow>
                    {selectedEntry && boostTakeTopSpot.gt(BigNumber.from(0)) && (
                      <PresetButton
                        onClick={() => {
                          setAmountInput(capDigits(ethers.utils.formatEther(boostTakeTopSpot)))
                        }}
                      >
                        Take top spot<br />
                        <span style={{ fontSize: 10, fontWeight: 400 }}>
                          {formatEth(boostTakeTopSpot)} ETH
                        </span>
                      </PresetButton>
                    )}
                    <AmountInput
                      type="text"
                      inputMode="decimal"
                      value={amountInput}
                      onChange={e => handleAmountChange(e.target.value)}
                      placeholder="0.000"
                    />
                  </AmountRow>
                  {isConnected && isOnBase && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <BalanceLabel onClick={fillBalance}>
                        Balance: {formatEth(balance, 4)} ETH
                      </BalanceLabel>
                    </div>
                  )}
                  {exceedsBalance && (
                    <ErrorText>Amount exceeds your balance</ErrorText>
                  )}
                </div>

                {/* CTA */}
                {!isConnected ? (
                  <ActionButton onClick={handleConnect} disabled={false}>
                    Connect Wallet
                  </ActionButton>
                ) : (
                  <ActionButton disabled={boostDisabled} onClick={handleBoost}>
                    {txPending ? 'Confirm in wallet...' : 'Add Funds to this Message'}
                  </ActionButton>
                )}

                {txError && <ErrorText>{txError}</ErrorText>}
              </TabContent>
            )}

            {/* Footer */}
            <ModalFooter>
              You&apos;ll receive MARKEE tokens with your purchase and co-own the{' '}
              <ExternalLink
                href="https://gardens.1hive.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Markee Network
              </ExternalLink>
              .
            </ModalFooter>
          </>
        )}
      </DialogBox>
    </Backdrop>
  )
}
