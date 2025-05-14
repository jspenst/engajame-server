'use client'

import { useSite } from '@/context/site-context'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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
  const { siteData } = useSite()
  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([{ label: "Visão Geral", href: "/dashboard/" }])
  const toggleSubmenu = () => setSubMenuOpen((prev) => !prev)
  
  useEffect(() => {
  if (siteData) {
    const submenus: SubMenuItem[] = []

    if (siteData.hero_sections) {
      submenus.push({
        label: "Sessão Inicial",
        href: "/dashboard/mysite/hero",
      })
    }

    if (siteData.services_sections) {
      submenus.push({
        label: "Sessão Serviços",
        href: "/dashboard/mysite/services",
      })
    }

    if (siteData.portfolio_sections) {
      submenus.push({
        label: "Sessão Portfólio",
        href: "/dashboard/mysite/portfolio",
      })
    }

    if (siteData.teams) {
      submenus.push({
        label: "Sessão Equipe",
        href: "/dashboard/mysite/team",
      })
    }

    if (siteData.testimonials_sections) {
      submenus.push({
        label: "Sessão Depoimentos",
        href: "/dashboard/mysite/testimonials",
      })
    }

     if (siteData.testimonials_sections) {
      submenus.push({
        label: "Sessão FAQs",
        href: "/dashboard/mysite/faqs",
      })
    }

    setMenuItems([...menuItems,
      {
        label: "Meu Site",
        href: "/dashboard/mysite",
        ...(submenus.length > 0 && { submenus })
      }
    ])
  }
}, [siteData])

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
                    <Link href={item.href} className="" key={item.label}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </button>
          ) : (
            <Link href={item.href} className="px-4 py-2">
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </nav>
  )
}
