import { InjectedConnector } from '@web3-react/injected-connector'
import { AuthereumConnector } from '@web3-react/authereum-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { CustomNetworkConnector } from './CustomNetworkConnector'
import { ChainId } from 'dxswap-sdk'

export const INFURA_PROJECT_ID = '0ebf4dd05d6740f482938b8a80860d13'
export const MATIC_PROJECT_ID = '917500540ed6561baeb650de48df44949ed21baf'

export const network = new CustomNetworkConnector({
  urls: {
    [ChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    [ChainId.XDAI]: 'https://rpc.xdaichain.com/',
    // [ChainId.MATIC]: `https://rpc-mainnet.maticvigil.com/v1/${MATIC_PROJECT_ID}`
    [ChainId.MATIC]: 'https://rpc-mainnet.matic.quiknode.pro/'
  },
  defaultChainId: ChainId.XDAI
})

export const injected = new InjectedConnector({
  supportedChainIds: [ChainId.RINKEBY, ChainId.SOKOL, ChainId.XDAI, ChainId.MATIC]
})

// xdai only
export const walletConnectXDAI = new WalletConnectConnector({
  rpc: {
    100: 'https://rpc.xdaichain.com/'
  },
  bridge: 'https://bridge.walletconnect.org',
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
