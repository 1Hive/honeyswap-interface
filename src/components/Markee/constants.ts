import { BigNumber, ethers } from 'ethers'

export const LEADERBOARD_ADDRESS = '0x1BD04A82814fF611acDB4AB7f94a767C976cC186'
export const LEADERBOARD_ADDRESS_LOWER = LEADERBOARD_ADDRESS.toLowerCase()

export const BASE_CHAIN_ID = 8453
export const BASE_CHAIN_HEX = '0x2105'

// 0.001 ETH -- minimum increment to take the top spot
export const MIN_INCREMENT = BigNumber.from('1000000000000000')

export const BASE_PROVIDER = new ethers.providers.StaticJsonRpcProvider('https://mainnet.base.org')

export const API_URL = 'https://markee.xyz/api/openinternet/leaderboards'
export const BUY_URL = `https://markee.xyz/ecosystem/website/${LEADERBOARD_ADDRESS}`

export const LEADERBOARD_ABI = [
  {
    inputs: [],
    name: 'minimumPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxMessageLength',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'limit', type: 'uint256' }],
    name: 'getTopMarkees',
    outputs: [
      { name: 'topAddresses', type: 'address[]' },
      { name: 'topFunds', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_message', type: 'string' },
      { name: '_name', type: 'string' },
    ],
    name: 'createMarkee',
    outputs: [{ name: 'markeeAddress', type: 'address' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'markeeAddress', type: 'address' }],
    name: 'addFunds',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]

export const MARKEE_ABI = [
  {
    inputs: [],
    name: 'message',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
]

// Cap a numeric string to at most `max` total digit characters (not counting '.')
export function capDigits(value: string, max = 8): string {
  let count = 0
  let result = ''
  for (const ch of value) {
    if (/[0-9]/.test(ch)) {
      if (count >= max) continue
      count++
    }
    result += ch
  }
  return result.endsWith('.') ? result.slice(0, -1) : result
}

export function formatEth(amount: BigNumber, decimals = 3): string {
  return parseFloat(ethers.utils.formatEther(amount)).toFixed(decimals)
}

export function formatOwner(name: string): string {
  if (!name) return ''
  if (name.startsWith('0x') && name.length === 42) {
    return `${name.slice(0, 6)}...${name.slice(-4)}`
  }
  return name
}
