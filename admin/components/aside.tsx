'use client'

import { useSite } from '@/context/site-context'
import { useState } from 'react'

export interface SubMenuItem {
  label: string
  href: string
  icon?: React.ReactNode
}

export interface MenuItem {
  label: string
  href: string
  icon?: React.ReactNode
  submenus?: SubMenuItem[]
}

export interface AsideProps {
  menuItems: MenuItem[]
}

export default function Aside() {
  const menuItems = [
    { label: 'Visão Geral', href: '/dashboard/' },
    {
      label: 'Meu Site',
      href: '/dashboard/mysite',
      submenus: [
        { label: 'Seção Principal', href: '/dashboard/mysite/hero' },
        { label: 'Serviços', href: '/dashboard/mysite/services' },
      ],
    },
    { label: 'Financeiro', href: '/dashboard/financial' },
  ]
  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const toggleSubmenu = () => setSubMenuOpen((prev) => !prev)

  return (
    <nav className="absolute top-[60px] left-0 h-[calc(100vh-100px)] w-[250px] border-r border-r-foreground/10 flex flex-col p-2">
      {menuItems.map((item) => (
        <li key={item.href} className="rounded-lg">
          {item.submenus ? (
            <button
              onClick={toggleSubmenu}
              className={`flex flex-col gap-2 items-start px-4 py-2 rounded-lg ${subMenuOpen && 'bg-gray-200'}`}
            >
              {item.label}
              {subMenuOpen && (
                <div className="flex flex-col gap-2 items-start p-2 rounded-lg">
                  {item.submenus.map((item) => (
                    <a href={item.href} className="" key={item.label}>
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </button>
          ) : (
            <a href={item.href} className="px-4 py-2">
              {item.label}
            </a>
          )}
        </li>
      ))}
    </nav>
  )
}
