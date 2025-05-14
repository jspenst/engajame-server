import Aside from '@/components/aside'
import Header from '@/components/header'
import { SiteProvider } from '@/context/site-context'
import { UserProvider } from '@/context/user-context'

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <UserProvider>
      <SiteProvider>
        <div className="flex-1 w-full flex flex-col items-center relative">
          <Header
            logoUrl="https://lufqtgrfgdkwmyjkylws.supabase.co/storage/v1/object/public/sites/admin/logo-small.png"
            homeUrl="/dashboard"
          />
          <Aside />
          <div className="absolute left-[250px] top-[60px] w-[calc(100vw-250px)] h-[calc(100vh-60px)]">
            {children}
          </div>
        </div>
      </SiteProvider>
    </UserProvider>
  )
}
