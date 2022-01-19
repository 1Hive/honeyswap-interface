import React from 'react'
import { SafeAppConnector, useSafeAppConnection } from '@gnosis.pm/safe-apps-web3-react'

const safeMultisigConnector = new SafeAppConnector()

export default function GnosisManager(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  // eslint-disable-next-line
  const triedToConnectToSafe = useSafeAppConnection(safeMultisigConnector)
  return <></>
}
