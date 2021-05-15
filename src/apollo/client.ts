import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { ChainId } from 'dxswap-sdk'

export const defaultSubgraphClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/luzzif/swapr-mainnet-alpha',
  cache: new InMemoryCache()
})

export const subgraphClients: { [chainId in ChainId]?: ApolloClient<NormalizedCacheObject> | undefined } = {
  [ChainId.MAINNET]: defaultSubgraphClient,
  [ChainId.MATIC]: new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/1hive/honeyswap-polygon',
    cache: new InMemoryCache()
  }),
  [ChainId.XDAI]: new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/1hive/honeyswap-xdai',
    cache: new InMemoryCache()
  })
}
