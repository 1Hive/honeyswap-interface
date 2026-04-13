import React, { useCallback, useEffect, useState } from 'react'
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SignData {
  topMarkeeAddress: string | null
  message: string
  name: string
  totalFundsAdded: BigNumber
}

const DEFAULT_DATA: SignData = {
  topMarkeeAddress: null,
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

const OwnerText = styled.p`
  margin: 0;
  font-size: 11px;
  color: ${({ theme }) => theme.text4};
  transition: color 0.2s;

  ${Card}:hover & {
    color: ${({ theme }) => theme.text3};
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

const LoadingText = styled.span`
  color: ${({ theme }) => theme.text4};
`

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MarkeeSign() {
  const [data, setData] = useState<SignData>(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [minimumPrice, setMinimumPrice] = useState<BigNumber>(BigNumber.from('3000000000000000'))
  const [maxMessageLength, setMaxMessageLength] = useState(223)

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
          message: lb.topMessage,
          name: lb.topMessageOwner ?? '',
          totalFundsAdded: BigNumber.from(lb.topFundsAddedRaw ?? '0'),
        })
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
                <MessageText>
                  {loading ? (
                    <LoadingText>loading...</LoadingText>
                  ) : (
                    data.message
                  )}
                </MessageText>
                {data.name && !loading && (
                  <OwnerText>{formatOwner(data.name)}</OwnerText>
                )}
              </MessageButton>
            </MessageRow>
          </CardInner>
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
