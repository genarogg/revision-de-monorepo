'use client'

import Link from 'next/link'

interface MenuItem {
  href: string
  label: string
  visible?: boolean
  role?: string[]
  onClick?: () => void
}

interface NavProps {
  menuItems: MenuItem[]
  userRole?: string
  onClick?: () => void
}

export default function Nav({ menuItems, userRole, onClick }: NavProps) {
  const visibleItems = menuItems.filter(
    (item) => item.visible !== false && (!item.role || (userRole && item.role.includes(userRole))),
  )

  return (
    <nav aria-label="Navegación principal">
      <ul className="nav-list">
        {visibleItems.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link
              href={item.href}
              onClick={() => {
                item.onClick?.()
                onClick?.()
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
