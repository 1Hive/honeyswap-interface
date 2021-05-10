import { ChainId } from 'dxswap-sdk'
import { useActiveWeb3React } from '.'

export function useLiquidityMiningFeatureFlag(): boolean {
  const { chainId } = useActiveWeb3React()
  return chainId === ChainId.RINKEBY || chainId === ChainId.XDAI
}
