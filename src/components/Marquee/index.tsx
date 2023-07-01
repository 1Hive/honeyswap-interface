import React, { useState, ChangeEvent, useEffect } from 'react'
import { ethers } from 'ethers'
import { useActiveWeb3React } from '../../hooks'
import { ButtonPrimary } from '../Button'
import marqueeAbi from '../../constants/abis/marquee.json'

export const MARQUEE_CONTRACT_ADDRESS = '0x3Ce93B6a6cee2F5c6e1b8A72FE6f3a41Bee9b351'
const MSG_CONNECT_GNOSIS = 'Connect your wallet to Gnosis Chain'
const GNOSIS_CHAINID = 100

const GNOSIS_PROVIDER = new ethers.providers.StaticJsonRpcProvider('https://rpc.gnosischain.com/')

export { marqueeAbi }

const Marquee: React.FC = () => {
  const { library, account, chainId } = useActiveWeb3React()
  const [newMarquee, setNewMarquee] = useState('')
  const [price, setPrice] = useState(0)
  const [showNewMarquee, setShowNewMarquee] = useState(false)
  const [transactionProcessing, setTransactionProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const [currentMarquee, setCurrentMarquee] = useState('')

  useEffect(() => {
    const run = async () => {
      const contract = new ethers.Contract(MARQUEE_CONTRACT_ADDRESS, marqueeAbi, GNOSIS_PROVIDER)

      try {
        const marquee = await contract.marquee()
        setCurrentMarquee(marquee)
      } catch (error) {
        console.error('Error retrieving marquee:', error)
      }

      if (library) {
        const currentNetwork = await library.getNetwork()
        if (currentNetwork.chainId !== GNOSIS_CHAINID) {
          console.error(MSG_CONNECT_GNOSIS)
          return
        }
        const contract = new ethers.Contract(MARQUEE_CONTRACT_ADDRESS, marqueeAbi, library)
        const currentPrice = await contract.priceToChange()
        setPrice(currentPrice)
      }
    }
    run()
  }, [library])

  const handleButtonClick = () => {
    setShowNewMarquee(true)
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewMarquee(e.target.value)
  }

  const handleChangeMarquee = async () => {
    if (library && account) {
      const currentNetwork = await library.getNetwork()
      if (currentNetwork.chainId !== GNOSIS_CHAINID) {
        console.error(MSG_CONNECT_GNOSIS)
        return
      }

      const contract = new ethers.Contract(MARQUEE_CONTRACT_ADDRESS, marqueeAbi, library.getSigner(account))

      try {
        setTransactionProcessing(true)
        const txResponse = await contract.setMarquee(newMarquee, {
          value: price
        })
        await txResponse.wait()
        setTransactionHash(txResponse.hash)
        setCurrentMarquee(newMarquee)
      } catch (error) {
        console.error(error)
      } finally {
        setTransactionProcessing(false)
      }
    } else {
      console.error('Ethereum provider not available')
    }
  }

  return (
    <div>
      <div style={{ border: '1px solid #cccccc', padding: 16, width: 400, margin: 'auto' }}>
        <h4 style={{ fontFamily: 'courier', fontSize: '16px', textAlign: 'center' }}>{currentMarquee}</h4>
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
                  <ButtonPrimary
                    onClick={handleChangeMarquee}
                    disabled={transactionProcessing || chainId !== GNOSIS_CHAINID || !account}
                  >
                    {transactionProcessing
                      ? 'Complete transaction in your wallet...'
                      : chainId !== GNOSIS_CHAINID || !account
                      ? MSG_CONNECT_GNOSIS
                      : `Publish to the world for ${ethers.utils.formatEther(price)} xDAI`}
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
