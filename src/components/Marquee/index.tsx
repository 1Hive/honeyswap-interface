import React, { useState, useEffect, ChangeEvent } from 'react'
import { utils, ethers } from 'ethers'
import { useActiveWeb3React } from '../../hooks'
import { ButtonPrimary } from '../Button'
import marqueeAbi from '../../constants/abis/marquee.json'
export const MARQUEE_CONTRACT_ADDRESS = '0x3Ce93B6a6cee2F5c6e1b8A72FE6f3a41Bee9b351'

export { marqueeAbi }

interface MarqueeProps {
  marquee: string
  onUpdate: (newMarquee: string) => void
}

const Marquee: React.FC<MarqueeProps> = ({ marquee, onUpdate }) => {
  const { library, account, chainId } = useActiveWeb3React()
  const [newMarquee, setNewMarquee] = useState('')
  const [showNewMarquee, setShowNewMarquee] = useState(false)
  const [transactionProcessing, setTransactionProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const handleButtonClick = () => {
    setShowNewMarquee(true)
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMarquee(e.target.value)
  }

  const [initialMarquee, setInitialMarquee] = useState('');

    const handleChangeMarquee = async () => {
      if (library && account) {
        const currentNetwork = await library.getNetwork()
        if (currentNetwork.chainId !== 100) {
          console.error('Connect your wallet to Gnosis Chain')
          return
        }

        const contract = new ethers.Contract(MARQUEE_CONTRACT_ADDRESS, marqueeAbi, library.getSigner(account))

        try {
          setTransactionProcessing(true)
          const txResponse = await contract.setMarquee(newMarquee, {
            value: utils.parseEther('.001')
          })
          await txResponse.wait()
          setTransactionHash(txResponse.hash)
          onUpdate(newMarquee)
        } catch (error) {
          console.error(error)
        } finally {
          setTransactionProcessing(false)
        }
      } else {
        console.error('Ethereum provider not available')
      }
    }


  useEffect(() => {
    const fetchMarquee = async () => {
      if (library) {
        const contract = new ethers.Contract(MARQUEE_CONTRACT_ADDRESS, marqueeAbi, library)
        const currentMarquee = await contract.marquee()
        setInitialMarquee(currentMarquee)
      }
    }
    fetchMarquee()
  }, [library])

  return (
    <div>
      <div style={{ border: '1px solid #cccccc', padding: 16, width: 400, margin: 'auto' }}>
        <h4 style={{ fontFamily: 'courier', fontSize: '16px', textAlign: 'center' }}>{marquee}</h4>
      </div>
      <div style={{ margin: '8px 0' }}>
        {!showNewMarquee ? (
          <ButtonPrimary onClick={handleButtonClick}>Change this message</ButtonPrimary>
        ) : (
          <>
            {transactionHash ? (
              <div style={{ marginBottom: 8, textAlign: 'center' }}>
                <a
                  href={`https://gnosisscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'white', textDecoration: 'underline' }}
                >
                  View your transaction on gnosisscan
                </a>
              </div>
            ) : (
              <>
                <textarea
                  value={newMarquee}
                  onChange={handleInputChange}
                  placeholder="Type new message here... (200 characters max)"
                  maxLength={200}
                  rows={3}
                  style={{
                    color: 'white',
                    width: '100%',
                    padding: '8px',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    backgroundColor: 'transparent',
                    resize: 'none'
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <ButtonPrimary onClick={handleChangeMarquee} disabled={transactionProcessing || chainId !== 100 || !account}>
                    {transactionProcessing
                      ? 'Complete transaction in your wallet...'
                      : chainId !== 100 || !account
                      ? 'Connect your wallet to Gnosis Chain'
                      : 'Publish to the world for 10 xDAI'}
                  </ButtonPrimary>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Marquee
