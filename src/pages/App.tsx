import React, { Suspense, useState, useEffect } from 'react'
import { Route, Switch, HashRouter } from 'react-router-dom'
import styled from 'styled-components'
import Header from '../components/Header'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import AddLiquidity from './AddLiquidity'
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from './AddLiquidity/redirects'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import { useActiveWeb3React } from '../hooks'
import { ethers } from 'ethers'
import Marquee, { MARQUEE_CONTRACT_ADDRESS, marqueeAbi } from '../components/Marquee'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  z-index: 4;
  height: 86px;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 172px);
  width: 100%;
  padding-top: 60px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    
  `};

  z-index: 1;
`

const MarqueeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 16px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const Footer = styled.div`
  font-size: 12px;
  text-align: center;
  width: 420px;
  margin: auto;
  padding-bottom: 16px
  color: #fffa;
`

export default function App() {
  const { library } = useActiveWeb3React()
  const [currentMarquee, setCurrentMarquee] = useState('')
  const handleMarqueeUpdate = (newMarquee: string) => {
    setCurrentMarquee(newMarquee)
  }

  useEffect(() => {
    if (library) {
      const contract = new ethers.Contract(MARQUEE_CONTRACT_ADDRESS, marqueeAbi, library)
      contract
        .marquee()
        .then((marquee: string) => {
          setCurrentMarquee(marquee)
        })
        .catch((error: Error) => {
          console.error('Error retrieving marquee:', error)
        })
    }
  }, [library])

  return (
    <Suspense fallback={null}>
      <HashRouter>
        <Route component={DarkModeQueryParamReader} />
        <AppWrapper>
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>
          <BodyWrapper>
            <Popups />
            <Web3ReactManager>
              <Switch>
                <Route exact strict path="/swap" component={Swap} />
                <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
                <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
                <Route exact strict path="/find" component={PoolFinder} />
                <Route exact strict path="/pool" component={Pool} />
                <Route exact strict path="/create" component={AddLiquidity} />
                <Route exact path="/add" component={AddLiquidity} />
                {/* <Route exact strict path="/governance" component={GovPages} /> */}
                {/* <Route exact strict path="/governance/:asset/pairs" component={GovPages} /> */}
                <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                <Route component={RedirectPathToSwapOnly} />
              </Switch>
            </Web3ReactManager>
            <MarqueeWrapper>
              <Marquee marquee={currentMarquee} onUpdate={handleMarqueeUpdate} />
            </MarqueeWrapper>
            <Marginer />
          </BodyWrapper>

          <Footer>
            “That which is not good for the{' '}
            <span role="img" aria-label="bee">
              🐝
            </span>
            -hive cannot be good for the{' '}
            <span role="img" aria-label="bee">
              🐝
            </span>
            .” —Marcus Aurelius
          </Footer>
        </AppWrapper>
      </HashRouter>
    </Suspense>
  )
}
