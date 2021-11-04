import { InjectedConnector } from '@web3-react/injected-connector'
import { AuthereumConnector } from '@web3-react/authereum-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { CustomNetworkConnector } from './CustomNetworkConnector'
import { ChainId } from 'dxswap-sdk'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

export const INFURA_PROJECT_ID = '0ebf4dd05d6740f482938b8a80860d13'

export const network = new CustomNetworkConnector({
  urls: {
    [ChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    [ChainId.XDAI]: 'https://poa-xdai.gateway.pokt.network/v1/lb/61140fc659501900341babff',
    [ChainId.MATIC]: 'https://poly-mainnet.gateway.pokt.network/v1/lb/61141e8259501900341bb3e2'
  },
  defaultChainId: ChainId.XDAI
})

export const injected = new InjectedConnector({
  supportedChainIds: [ChainId.RINKEBY, ChainId.SOKOL, ChainId.XDAI, ChainId.MATIC]
})

export const walletlink = new WalletLinkConnector({
  supportedChainIds: [ChainId.MAINNET, ChainId.RINKEBY, ChainId.XDAI, ChainId.MATIC],
  url: 'https://poa-xdai.gateway.pokt.network/v1/lb/61140fc659501900341babff',
  appName: 'Honeyswap'
})

// xdai only
export const walletConnectXDAI = new WalletConnectConnector({
  rpc: {
    100: 'https://poa-xdai.gateway.pokt.network/v1/lb/61140fc659501900341babff'
  },
  bridge: 'https://walletconnect-relay.minerva.digital',
  qrcode: true,
  pollingInterval: 15000
})

// polygon only
export const walletConnectMATIC = new WalletConnectConnector({
  rpc: {
    137: 'https://rpc-mainnet.matic.quiknode.pro'
  },
  bridge: 'https://polygon.bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000
})

// mainnet only
export const authereum = new AuthereumConnector({ chainId: 1 })
