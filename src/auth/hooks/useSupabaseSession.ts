import * as React from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../services/supabase.service'
import { SupabaseUsers } from '../../repositories/Users/SupabaseUsers'
import type { suabaseUserInfo } from '../../models/database/users'
import type { UserRole } from '../../models/auth/roles'
import { mapRoleIdToUserRole } from '../../models/auth/roles'

export function useSupabaseSession() {
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [currentUser, setCurrentUser] = React.useState<suabaseUserInfo | null>(null)
  const [role, setRole] = React.useState<UserRole>('authenticated')
  const usersRepository = React.useMemo(() => new SupabaseUsers(), [])

  React.useEffect(() => {
    let mounted = true

    async function syncSession(nextSession?: Session | null) {
      const sessionToUse = nextSession ?? (await supabase.auth.getSession()).data.session ?? null

      if (!mounted) {
        return
      }

      setSession(sessionToUse)

      if (!sessionToUse?.user.id) {
        setCurrentUser(null)
        setRole('authenticated')
        setLoading(false)
        return
      }

      const userResponse = await usersRepository.loadUserById(sessionToUse.user.id)

      if (!mounted) {
        return
      }

      setCurrentUser(userResponse.status ? userResponse.data : null)
      setRole(mapRoleIdToUserRole(userResponse.data?.role_id))
      setLoading(false)
    }

    async function bootstrapSession() {
      const { data } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      await syncSession(data.session ?? null)
    }

    void bootstrapSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) {
        return
      }

      void syncSession(nextSession ?? null)
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  return {
    session,
    loading,
    isAuthenticated: Boolean(session),
    currentUser,
    role,
  }
}
