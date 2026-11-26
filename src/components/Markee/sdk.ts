/**
 * Runtime loader and the subset of @markee_team/sdk types this app uses.
 *
 * The SDK is ESM with modern syntax (class fields, BigInt literals) that this app's webpack 4 / Babel
 * toolchain cannot bundle, and its declarations use template-literal types that TypeScript 3.9 cannot
 * parse. scripts/copy-markee-sdk.js copies the installed, lockfile-pinned bundle to
 * public/markee-sdk.js before start/build, and the browser loads it natively with import().
 * Keep these declarations in sync with node_modules/@markee_team/sdk/dist/*.d.ts when upgrading.
 */

export interface EIP1193Provider {
  request(args: { method: string; params?: readonly unknown[] | object }): Promise<unknown>
  on?(event: string, listener: (...args: unknown[]) => void): void
  removeListener?(event: string, listener: (...args: unknown[]) => void): void
}

/** Return the app's selected wallet. Never create a second wallet session. */
export interface WalletAdapter {
  getProvider(): Promise<EIP1193Provider | null>
  connect?(): Promise<EIP1193Provider>
}

export interface BoardPlacement {
  kind: 'board'
  chainId: number
  address: string
}

export interface MarkeeThemeColors {
  background: string
  surface: string
  text: string
  muted: string
  border: string
  inputBackground: string
  inputText: string
  primary: string
  primaryText: string
  accent: string
  accentText: string
  accentSurface: string
  accentSurfaceText: string
  accentBorder: string
  selected: string
  selectedText: string
  info: string
  infoText: string
  error: string
  errorText: string
  warning?: string
  warningText?: string
  warningBorder?: string
  success: string
  successText: string
  link: string
  focusRing: string
  overlay: string
}

export interface MarkeeTheme {
  mode?: 'light' | 'dark' | 'system'
  colors?: Partial<MarkeeThemeColors>
  fontFamily?: string
  radius?: number
  cardRadius?: number
  controlRadius?: number
  sign?: { hoverBackground?: string | false; hoverLogo?: boolean }
}

export interface ModerationOptions {
  version?: number
  severity?: 'relaxed' | 'standard' | 'strict'
  rules?: { profanity?: boolean; links?: boolean; addresses?: boolean; ens?: boolean }
}

export interface SiteVerification {
  verified: boolean
  url: string
  verifiedUrls?: string[]
  message?: string
}

export interface SDKOptions {
  moderation?: ModerationOptions
  wallet?: WalletAdapter
  siteUrl?: string
  onSiteVerification?: (result: SiteVerification) => void
  theme?: MarkeeTheme
  onEvent?: (event: { type: 'submitted' | 'confirmed' | 'error'; hash?: string; message?: string }) => void
}

export interface MarkeeSign {
  refresh(): Promise<void>
  setTheme(theme?: MarkeeTheme): void
  destroy(): void
}

export interface Markee {
  open(options: { placement: BoardPlacement; onClose?: () => void; theme?: MarkeeTheme }): unknown
  setTheme(theme?: MarkeeTheme): void
  close(): void
}

export interface MarkeeSdk {
  SDK_VERSION: string
  createMarkee(options?: SDKOptions): Markee
  createMarkeeSign(
    container: HTMLElement,
    options: SDKOptions & { placement: BoardPlacement; showAction?: boolean; onOpen?: () => void }
  ): MarkeeSign
}

let sdk: Promise<MarkeeSdk> | undefined

export function loadMarkeeSdk(): Promise<MarkeeSdk> {
  if (!sdk) {
    const url = new URL(`${process.env.PUBLIC_URL}/markee-sdk.js`, window.location.href).href
    sdk = import(/* webpackIgnore: true */ url) as Promise<MarkeeSdk>
    sdk.catch(() => (sdk = undefined))
  }
  return sdk
}
