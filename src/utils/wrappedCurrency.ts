import { ChainId, Currency, CurrencyAmount, Token, TokenAmount } from 'dxswap-sdk'

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  if (!chainId || !currency || !Currency.isNative(currency)) return currency instanceof Token ? currency : undefined
  return Token.getNativeWrapper(chainId)
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}

export function unwrappedToken(token?: Token): Currency | undefined {
  if (!token) return undefined
  if (Currency.isNative(token)) return Token.getNativeWrapper(token.chainId)
  return token
}
