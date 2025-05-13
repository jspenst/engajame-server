'use client'
import { signOutAction } from '@/app/actions'
import Link from 'next/link'
import { useUser } from '@/context/user-context'

export default function AuthButton() {
  const { user } = useUser()

  return user ? (
    <div className="flex items-center gap-4 min-w-fit">
      Olá, {user.email}!
      <form action={signOutAction} className="min-w-fit">
        <button type="submit">Sair</button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <button className="min-w-fit">
        <Link href="/sign-in">Entrar</Link>
      </button>
      <button className="min-w-fit">
        <Link href="/sign-up">Cadastre-se</Link>
      </button>
    </div>
  )
}
