import React, { useCallback, useEffect, useState } from 'react'
import { Eye, Flag } from 'react-feather'
import { BigNumber, ethers } from 'ethers'
import styled from 'styled-components'
import MarkeeModal from './MarkeeModal'
import {
  API_URL,
  BASE_PROVIDER,
  formatOwner,
  LEADERBOARD_ABI,
  LEADERBOARD_ADDRESS,
  LEADERBOARD_ADDRESS_LOWER,
  MIN_INCREMENT,
} from './constants'

const VIEWS_URL = 'https://www.markee.xyz/api/views'
const MODERATION_API = '/api/moderation'
const MODERATION_CHAIN_ID = 8453
const MODERATION_ADMINS = [
  '0x809c9f8dd8ca93a41c3adca4972fa234c28f7714',
  '0x07ad02e0c1fa0b09fc945ff197e18e9c256838c6',
  '0x2f9e113434aebdd70bb99cb6505e1f726c578d6d',
  '0xa25211b64d041f690c0c818183e32f28ba9647dd',
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SignData {
  topMarkeeAddress: string | null
  topMarkeeOwner: string | null
  message: string
  name: string
  totalFundsAdded: BigNumber
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const DEFAULT_DATA: SignData = {
  topMarkeeAddress: null,
  topMarkeeOwner: null,
  message: 'this is a sign.',
  name: '',
  totalFundsAdded: BigNumber.from(0),
}

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const Wrapper = styled.div`
  position: relative;
  width: 400px;
  max-width: 100%;
`

const Card = styled.div`
  position: relative;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 12px;
  background: ${({ theme }) => theme.bg1};
  transition: border-color 0.2s;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.primary2};
  }
`

const CardInner = styled.div`
  padding: 12px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MessageRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const MessageButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  flex: 1;
  min-width: 0;
`

const MessageText = styled.p`
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  word-break: break-word;
  line-height: 1.4;
  transition: color 0.2s;

  ${Card}:hover & {
    color: ${({ theme }) => theme.text1};
  }
`


const PriceBadge = styled.span`
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  color: ${({ theme }) => theme.text4};
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s, border-color 0.2s, color 0.2s;

  ${Wrapper}:hover & {
    opacity: 1;
    border-color: ${({ theme }) => theme.primary2};
    color: ${({ theme }) => theme.primary2};
  }
`

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px 10px;
  border-top: 1px solid ${({ theme }) => theme.bg3};
`

const FooterText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text4};
`

const LoadingText = styled.span`
  color: ${({ theme }) => theme.text4};
`

const FlagIconButton = styled.button<{ flagged: boolean }>`
  background: none;
  border: 1px solid ${({ theme, flagged }) => flagged ? '#e03131' : theme.bg3};
  border-radius: 4px;
  padding: 2px 5px;
  cursor: pointer;
  color: ${({ flagged }) => flagged ? '#e03131' : '#888'};
  display: flex;
  align-items: center;
  transition: all 0.15s;
  margin-left: 6px;

  &:hover {
    border-color: #e03131;
    color: #e03131;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MarkeeSign() {
  const [data, setData] = useState<SignData>(DEFAULT_DATA)
  const [viewCount, setViewCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [minimumPrice, setMinimumPrice] = useState<BigNumber>(BigNumber.from('3000000000000000'))
  const [maxMessageLength, setMaxMessageLength] = useState(223)
  const [flaggedSet, setFlaggedSet] = useState<Set<string>>(new Set())
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null)
  const [flagging, setFlagging] = useState(false)

  // Read minimumPrice and maxMessageLength from contract once on mount
  useEffect(() => {
    const contract = new ethers.Contract(LEADERBOARD_ADDRESS, LEADERBOARD_ABI, BASE_PROVIDER)
    Promise.all([contract.minimumPrice(), contract.maxMessageLength()])
      .then(([price, maxLen]: [BigNumber, BigNumber]) => {
        setMinimumPrice(price)
        setMaxMessageLength(Number(maxLen))
      })
      .catch(() => {})
  }, [])

  const fetchData = useCallback(async () => {
    try {
      // NOTE: This fetch may fail with a CORS error if markee.xyz does not set
      // Access-Control-Allow-Origin headers on this route. The component falls
      // back to DEFAULT_DATA in that case -- the modal still works from on-chain
      // data alone.
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(`${res.status}`)
      const json = await res.json()
      const lb = (json.leaderboards ?? []).find(
        (l: { address: string }) => l.address.toLowerCase() === LEADERBOARD_ADDRESS_LOWER
      )
      if (!lb || !lb.topMessage || BigNumber.from(lb.topFundsAddedRaw ?? '0').isZero()) {
        setData(DEFAULT_DATA)
      } else {
        setData({
          topMarkeeAddress: lb.topMarkeeAddress ?? null,
          topMarkeeOwner: lb.topMarkeeOwner ?? null,
          message: lb.topMessage,
          name: lb.topMessageOwner ?? '',
          totalFundsAdded: BigNumber.from(lb.topFundsAddedRaw ?? '0'),
        })
        // Track a view and get the current count
        if (lb.topMarkeeAddress) {
          fetch(VIEWS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: lb.topMarkeeAddress.toLowerCase(), message: lb.topMessage }),
          })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d?.totalViews != null) setViewCount(d.totalViews) })
            .catch(() => {})
        }
      }
    } catch {
      // Leave DEFAULT_DATA; modal still works via contract reads
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fetch flagged markee list on mount
  useEffect(() => {
    fetch(MODERATION_API)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.flagged) setFlaggedSet(new Set(d.flagged)) })
      .catch(() => {})
  }, [])

  // Track connected wallet for admin check
  useEffect(() => {
    const eth = (window as any).ethereum
    if (!eth) return
    eth.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => setConnectedAccount(accounts[0]?.toLowerCase() ?? null))
      .catch(() => {})
    const onAccountsChanged = (accounts: string[]) =>
      setConnectedAccount(accounts[0]?.toLowerCase() ?? null)
    eth.on('accountsChanged', onAccountsChanged)
    return () => eth.removeListener('accountsChanged', onAccountsChanged)
  }, [])

  const topMarkeeKey = data.topMarkeeAddress?.toLowerCase() ?? null
  const isFlagged = !!topMarkeeKey && flaggedSet.has(topMarkeeKey)
  const isAdmin = !!connectedAccount && MODERATION_ADMINS.includes(connectedAccount)

  const handleFlag = useCallback(async () => {
    const eth = (window as any).ethereum
    if (!eth || !connectedAccount || !topMarkeeKey) return
    const action = flaggedSet.has(topMarkeeKey) ? 'unflag' : 'flag'
    setFlagging(true)
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const message = `markee-moderation:${action}:${MODERATION_CHAIN_ID}:${topMarkeeKey}:${timestamp}`
      const provider = new ethers.providers.Web3Provider(eth)
      const signature = await provider.getSigner().signMessage(message)
      const res = await fetch(MODERATION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markeeId: topMarkeeKey, action, adminAddress: connectedAccount, signature, timestamp }),
      })
      const d = await res.json()
      if (d.flagged) setFlaggedSet(new Set(d.flagged))
    } catch {
      // ignore
    } finally {
      setFlagging(false)
    }
  }, [connectedAccount, topMarkeeKey, flaggedSet])

  const takeTopSpot = data.totalFundsAdded.gt(BigNumber.from(0))
    ? data.totalFundsAdded.add(MIN_INCREMENT)
    : minimumPrice

  const priceLabel = data.totalFundsAdded.gt(BigNumber.from(0))
    ? `${parseFloat(ethers.utils.formatEther(takeTopSpot)).toFixed(3)} ETH to change`
    : 'be first!'

  return (
    <>
      {/* data-markee-address must be in rendered HTML for markee.xyz integration verification */}
      <Wrapper data-markee-address={LEADERBOARD_ADDRESS_LOWER}>
        <Card>
          <CardInner>
            <MessageRow>
              <MessageButton
                type="button"
                onClick={() => setModalOpen(true)}
                disabled={loading}
                aria-label="Click to change the Honeyswap Markee message"
              >
                <MessageText style={isFlagged ? { filter: 'blur(6px)', userSelect: 'none' } : undefined}>
                  {loading ? (
                    <LoadingText>loading...</LoadingText>
                  ) : (
                    data.message
                  )}
                </MessageText>
              </MessageButton>
            </MessageRow>
          </CardInner>
          {!loading && (
            <CardFooter>
              <FooterText>
                {data.name
                  ? formatOwner(data.name)
                  : data.topMarkeeOwner
                    ? truncateAddress(data.topMarkeeOwner)
                    : ''}
              </FooterText>
              <FooterText style={{ display: 'flex', alignItems: 'center' }}>
                {viewCount != null && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={11} />
                    {viewCount}
                  </span>
                )}
                {isAdmin && topMarkeeKey && (
                  <FlagIconButton
                    flagged={isFlagged}
                    onClick={e => { e.stopPropagation(); handleFlag() }}
                    disabled={flagging}
                    title={isFlagged ? 'Unflag this message' : 'Flag this message'}
                  >
                    <Flag size={10} />
                  </FlagIconButton>
                )}
              </FooterText>
            </CardFooter>
          )}
        </Card>

        <PriceBadge>{loading ? '...' : priceLabel}</PriceBadge>
      </Wrapper>

      {modalOpen && (
        <MarkeeModal
          minimumPrice={minimumPrice}
          maxMessageLength={maxMessageLength}
          topFundsAdded={data.totalFundsAdded}
          takeTopSpot={takeTopSpot}
          currentMessage={data.message}
          currentName={data.name}
          topMarkeeAddress={data.topMarkeeAddress}
          flaggedSet={flaggedSet}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false)
            setTimeout(fetchData, 3000)
          }}
        />
      )}
    </>
  )
}
