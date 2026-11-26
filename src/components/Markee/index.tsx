import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { ChainId } from 'dxswap-sdk'
import React, { useContext, useEffect, useMemo, useRef } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { pendingActivation } from '../../connectors/activation'
import { NETWORK_DETAIL } from '../../constants'
import { ApplicationModal } from '../../state/application/actions'
import { useCloseModals, useModalOpen, useOpenModal } from '../../state/application/hooks'
import { useIsDarkMode } from '../../state/user/hooks'
import { BoardPlacement, EIP1193Provider, loadMarkeeSdk, Markee as MarkeeModal, MarkeeSign, WalletAdapter } from './sdk'
import { markeeTheme } from './theme'

// "Honeyswap" leaderboard on Base. Markee's API decides For Sale vs For Rent.
const PLACEMENT: BoardPlacement = {
  kind: 'board',
  chainId: 8453,
  address: '0xb1acf622e8ac66b62255f52aaf206a00ecdc3669'
}

// Standard preset: scams & phishing plus profanity. A policy saved for this board on Markee takes precedence.
const MODERATION = { version: 1, rules: { profanity: true, links: false, addresses: false, ens: false } }

// Public page registered for site verification. public/index.html carries the matching marker.
const SITE_URL = 'https://app.honeyswap.org'

const SignContainer = styled.div`
  width: 100%;
  max-width: 420px;
`

interface WalletState {
  connector: unknown
  account: string | null | undefined
  error: Error | undefined
}

interface PendingConnect {
  resolve: (provider: EIP1193Provider) => void
  reject: (error: Error) => void
  /** Wallet state when connect() was called; only a change from it counts as a selection. */
  before: WalletState
  sawWalletModal: boolean
  awaitingActivation: boolean
}

async function chainIdOf(provider: EIP1193Provider): Promise<number | null> {
  const id = await provider.request({ method: 'eth_chainId' }).catch(() => null)
  return typeof id === 'string' || typeof id === 'number' ? Number(id) : null
}

/** Puts the wallet back on a Honeyswap network after Markee moved it to Base. */
async function switchBack(provider: EIP1193Provider, chainId: number) {
  const hexId = `0x${chainId.toString(16)}`
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexId }] })
  } catch (e) {
    const details = NETWORK_DETAIL[chainId]
    if ((e as { code?: number })?.code !== 4902 || !details) return
    await provider
      .request({ method: 'wallet_addEthereumChain', params: [{ ...details, metamaskAddable: undefined }] })
      .catch(() => undefined)
  }
}

/**
 * The Markee sign, opening the SDK payment modal. Wallet actions reuse the wallet selected in
 * Honeyswap's own wallet modal (web3-react); no second wallet context is created.
 */
export default function Markee() {
  const containerRef = useRef<HTMLDivElement>(null)
  const darkMode = useIsDarkMode()
  const appTheme = useContext(ThemeContext)
  const theme = useMemo(() => markeeTheme(appTheme, darkMode), [appTheme, darkMode])

  // The default web3-react context holds the user-selected wallet. Its connector stays set
  // (with an UnsupportedChainIdError) while the wallet is on Base, which Honeyswap doesn't support.
  const { connector, account, error } = useWeb3React()
  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const openWalletModal = useOpenModal(ApplicationModal.WALLET)
  const closeModals = useCloseModals()

  const latest = useRef({ connector, account, error, theme, openWalletModal })
  latest.current = { connector, account, error, theme, openWalletModal }
  const pendingConnect = useRef<PendingConnect | null>(null)
  const instances = useRef<{ sign: MarkeeSign; modal: MarkeeModal } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let unmounted = false

    const wallet: WalletAdapter = {
      async getProvider() {
        const current = latest.current.connector
        return current ? ((await current.getProvider()) as EIP1193Provider | null) ?? null : null
      },
      // Opens Honeyswap's wallet picker; settles once a wallet is selected or the picker is dismissed.
      connect() {
        return new Promise<EIP1193Provider>((resolve, reject) => {
          pendingConnect.current?.reject(new Error('Wallet connection was superseded.'))
          const { connector, account, error } = latest.current
          pendingConnect.current = {
            resolve,
            reject,
            before: { connector, account, error },
            sawWalletModal: false,
            awaitingActivation: false
          }
          latest.current.openWalletModal()
        })
      }
    }

    loadMarkeeSdk()
      .then(({ createMarkee, createMarkeeSign }) => {
        if (unmounted) return
        const modal = createMarkee({
          wallet,
          moderation: MODERATION,
          siteUrl: SITE_URL,
          theme: latest.current.theme,
          onSiteVerification: result => {
            if (!result.verified) console.warn('[Markee] site verification:', result.message ?? result.url)
          },
          onEvent: event => {
            // Refresh the sign only after Markee has verified the transaction on-chain.
            if (event.type === 'confirmed') void instances.current?.sign.refresh()
          }
        })
        const sign = createMarkeeSign(container, {
          placement: PLACEMENT,
          moderation: MODERATION,
          theme: latest.current.theme,
          onOpen: () => {
            // Markee switches the wallet to Base to pay. Remember the network it started on (Gnosis if
            // no wallet was connected yet) and switch back when the modal closes, so Honeyswap doesn't
            // stay on "Wrong Network".
            const startChain: Promise<number | null> = wallet
              .getProvider()
              .then(provider => (provider ? chainIdOf(provider) : null))
              .catch(() => null)
            modal.open({
              placement: PLACEMENT,
              onClose: async () => {
                const provider = await wallet.getProvider().catch(() => null)
                if (!provider) return
                const [from, now] = await Promise.all([startChain, chainIdOf(provider)])
                if (now === PLACEMENT.chainId && from !== PLACEMENT.chainId) {
                  await switchBack(provider, from ?? ChainId.XDAI)
                }
              }
            })
          }
        })
        instances.current = { sign, modal }
      })
      .catch(e => console.error('[Markee] failed to load the SDK', e))

    return () => {
      unmounted = true
      pendingConnect.current?.reject(new Error('Markee was closed.'))
      pendingConnect.current = null
      instances.current?.sign.destroy()
      instances.current?.modal.close()
      instances.current = null
    }
  }, [])

  useEffect(() => {
    instances.current?.sign.setTheme(theme)
    instances.current?.modal.setTheme(theme)
  }, [theme])

  // Settle a pending SDK connect request from Honeyswap's wallet modal state.
  useEffect(() => {
    const pending = pendingConnect.current
    if (!pending) return
    if (walletModalOpen) pending.sawWalletModal = true

    const { before } = pending
    const changed = connector !== before.connector || account !== before.account || error !== before.error
    if (connector && changed && (account || error instanceof UnsupportedChainIdError)) {
      pendingConnect.current = null
      connector
        .getProvider()
        .then((provider: EIP1193Provider | null) => {
          if (!provider) throw new Error('The selected wallet has no provider.')
          closeModals()
          pending.resolve(provider)
        })
        .catch((e: Error) => pending.reject(e))
    } else if (pending.sawWalletModal && !walletModalOpen && !pending.awaitingActivation) {
      const cancel = () => {
        if (pendingConnect.current !== pending) return
        pendingConnect.current = null
        pending.reject(new Error('Wallet connection was cancelled.'))
      }
      // Unstoppable Domains closes the wallet modal before its login finishes; wait for it. A
      // successful login settles above when web3-react's state changes.
      const activation = pendingActivation()
      if (activation) {
        pending.awaitingActivation = true
        activation.then(
          () => setTimeout(cancel, 0),
          () => setTimeout(cancel, 0)
        )
      } else {
        cancel()
      }
    }
  }, [connector, account, error, walletModalOpen, closeModals])

  return <SignContainer ref={containerRef} />
}
