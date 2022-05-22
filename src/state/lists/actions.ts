import { createAction } from '@reduxjs/toolkit'
import { TokenList } from 'bxswap-sdk'

export const setTokenList = createAction<TokenList>('setTokenList')
