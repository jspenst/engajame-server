import Link from 'next/link'
import { HeaderProps } from './header'

export default function NavBar({ logoUrl, homeUrl }: HeaderProps) {
  return (
    <Link href={homeUrl} className="flex w-full h-full">
      <img src={logoUrl}></img>
    </Link>
  )
}
