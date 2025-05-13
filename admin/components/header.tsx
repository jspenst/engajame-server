import AuthButton from './auth-button'
import NavBar from './navbar'

export interface HeaderProps {
  logoUrl: string
  homeUrl: string
}

export default function Header({ logoUrl, homeUrl }: HeaderProps) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-[60px]">
      <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
        <NavBar logoUrl={logoUrl} homeUrl={homeUrl} />
        <AuthButton />
      </div>
    </nav>
  )
}
