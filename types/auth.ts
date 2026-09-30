import React from 'react'

export type UserRole = 'Admin' | 'Personel'

export interface UserSession {
  id: string
  email: string
  role: UserRole
  fullName?: string
  phone?: string
  storeBranch?: string
}

export interface NavItemConfig {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeVariant?: 'default' | 'outline' | 'secondary'
  adminOnly?: boolean
  allowedRoles?: UserRole[]
}
