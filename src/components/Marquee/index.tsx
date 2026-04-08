import React, { useState, ChangeEvent, useEffect } from 'react'
import { BigNumber, ethers } from 'ethers'
import { useActiveWeb3React } from '../../hooks'
import { ButtonPrimary } from '../Button'

import _marqueeAbi from '../../contracts/out/Marquee.sol/Marquee.json'

import addresses from '../../contracts/addresses.json'

const GNOSIS_CHAINID = 100

export const MARQUEE_CONTRACT_ADDRESS = addresses[GNOSIS_CHAINID]['MarqueeProxy']

const MSG_CONNECT_GNOSIS = 'Connect your wallet to Gnosis Chain'

const GNOSIS_PROVIDER = new ethers.providers.StaticJsonRpcProvider('https://rpc.gnosischain.com/')

const marqueeAbi = [..._marqueeAbi.abi] as const

export { marqueeAbi }

const Marquee: React.FC = () => {
  const { library, account, chainId } = useActiveWeb3React()
  const [newMarquee, setNewMarquee] = useState('')
  const [price, setPrice] = useState<BigNumber>(BigNumber.from(0))
  const [showNewMarquee, setShowNewMarquee] = useState(false)
  const [transactionProcessing, setTransactionProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const [currentMarquee, setCurrentMarquee] = useState('')
  const [maxMarqueeLength, setMaxMarqueeLength] = useState(200)

  useEffect(() => {
    const run = async () => {
      const contract = new ethers.Contract(MARQUEE_CONTRACT_ADDRESS, marqueeAbi, GNOSIS_PROVIDER)

      try {
        const marquee = await contract.getMarquee()
        setCurrentMarquee(marquee)
      } catch (error) {
        console.error('Error retrieving marquee:', error)
        setCurrentMarquee('')
      }

      try {
        setMaxMarqueeLength(await contract.maxLenMarquee())
      } catch (error) {
        console.error('Error retrieving max Len Marquee:', error)
      }

      if (library) {
        const currentNetwork = await library.getNetwork()
        if (currentNetwork.chainId !== GNOSIS_CHAINID) {
          console.error(MSG_CONNECT_GNOSIS)
          return
        }
        const contract = new ethers.Contract(MARQUEE_CONTRACT_ADDRESS, marqueeAbi, library)
        const currentPrice = await contract.getPrice()
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
      // contract
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
        setCurrentMarquee('')
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
                  placeholder={`Type new message here... (${maxMarqueeLength} characters max)`}
                  maxLength={maxMarqueeLength}
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
                    disabled={transactionProcessing || chainId !== GNOSIS_CHAINID || !account || price.isZero()}
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
