export const CATEGORIES = [
  'CI/CD',
  'Monitoring',
  'Databases',
  'Security',
  'Messaging',
  'Storage',
  'Tracing',
  'Code Quality',
  'Registry',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface App {
  id: string
  name: string
  url: string
  description: string
  category: Category
  iconSlug: string
  customLogoUrl: string | null
  accentColor: string
  healthCheckUrl: string | null
  /** Team/group names that can see this app. Empty array means visible to everyone. */
  teams: string[]
  order: number
  createdAt: string
}

export type AppCreateInput = Omit<App, 'id' | 'order' | 'createdAt'>
export type AppUpdateInput = Partial<AppCreateInput>
