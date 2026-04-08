/// <reference types="react-scripts" />

declare module 'jazzicon' {
  export default function(diameter: number, seed: number): HTMLElement
}

declare module 'fortmatic'

interface EthereumProviderRequestArguments {
  method: string
  params?: unknown[] | object
}

interface Ethereum {
  send: unknown
  enable: () => Promise<string[]>
  on?: (method: string, listener: (...args: any[]) => void) => void
  removeListener?: (method: string, listener: (...args: any[]) => void) => void
}
interface BitKeep {
  ethereum?: Ethereum
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
  bitkeep?: BitKeep
}

declare module 'content-hash' {
  declare function decode(x: string): string
  declare function getCodec(x: string): string
}

declare module 'multihashes' {
  declare function decode(buff: Uint8Array): { code: number; name: string; length: number; digest: Uint8Array }
  declare function toB58String(hash: Uint8Array): string
}
