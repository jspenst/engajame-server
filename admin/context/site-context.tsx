'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUser } from './user-context'

interface SiteContextProps {
  siteData: any
  loading: boolean
}

const SiteContext = createContext<SiteContextProps>({ siteData: null, loading: true })

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [siteData, setSiteData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    async function fetchSite() {
      if (!user) return
      const supabase = createClient()
      const { data, error } = await supabase
        .from('sites')
        .select(
          `* , hero_sections(*), services_sections(*, services_items(*)), faqs_sections(*), portfolio_sections(*, portfolio_items(*)), testimonials_sections(*), teams(*)`
        )
        .eq('owner', user.id)
        .single()
      if (!error) setSiteData(data)
      setLoading(false)
      console.log(data)
    }
    fetchSite()
    
  }, [user])

  return <SiteContext.Provider value={{ siteData, loading }}>{children}</SiteContext.Provider>
}

export const useSite = () => useContext(SiteContext)
