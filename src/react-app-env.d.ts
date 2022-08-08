/// <reference types="react-scripts" />

declare module 'jazzicon' {
  export default function(diameter: number, seed: number): HTMLElement
}

declare module 'fortmatic'

interface EthereumProviderRequestArguments {
  method: string
  params?: unknown[] | object
}

interface Window {
  ethereum?: {
    isMetaMask?: true
    isBraveWallet?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
    request?: (args: EthereumProviderRequestArguments) => Promise<unknown>
  }
  web3?: {}
}

declare module 'content-hash' {
  declare function decode(x: string): string
  declare function getCodec(x: string): string
}

declare module 'multihashes' {
  declare function decode(buff: Uint8Array): { code: number; name: string; length: number; digest: Uint8Array }
  declare function toB58String(hash: Uint8Array): string
}
