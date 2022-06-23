import React from 'react'
import UAuth from '@uauth/js'
import { UserInfo } from '@uauth/js'
import { UAUTH_CONFIG } from '../connectors'

export default function useUAuthUser(walletAddress?: string) {
  const [user, setUser] = React.useState<UserInfo | undefined>(undefined)

  React.useEffect(() => {
    async function fetchUAuthUser() {
      const uauth = new UAuth(UAUTH_CONFIG)

      try {
        const uauthUser = await uauth.user()
        if (walletAddress && walletAddress.toLowerCase() === uauthUser.wallet_address?.toLowerCase()) {
          setUser(uauthUser)
        } else {
          setUser(undefined)
        }
      } catch (error) {
        setUser(undefined)
      }
    }

    if (walletAddress) {
      fetchUAuthUser()
    } else {
      setUser(undefined)
    }
  }, [setUser, walletAddress])
  return user
}
