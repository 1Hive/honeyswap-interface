// Tracks a wallet activation that continues after the wallet modal has closed (Unstoppable Domains
// closes the modal before its login), so callers waiting on a selection don't treat the close as a cancel.
let pending: Promise<unknown> | null = null

export function trackActivation<T>(activation: Promise<T>): Promise<T> {
  pending = activation
  const clear = () => {
    if (pending === activation) pending = null
  }
  activation.then(clear, clear)
  return activation
}

export function pendingActivation(): Promise<unknown> | null {
  return pending
}
