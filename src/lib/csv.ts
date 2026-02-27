import Papa from 'papaparse'
import type { App } from '@/types/app'
import { CATEGORIES, DEFAULT_ACCENT_COLOR } from '@/types/app'

type AppImportRow = Omit<App, 'id' | 'order' | 'createdAt'>

const REQUIRED_CSV_HEADERS = ['name', 'url']

function normalizeCategoryName(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '')
}

export function parseCSVToApps(csvText: string): AppImportRow[] {
  const result = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, ''),
  })

  if (result.errors.length > 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`)
  }

  const fields = result.meta.fields ?? []
  const missing = REQUIRED_CSV_HEADERS.filter((h) => !fields.includes(h))
  if (missing.length > 0) {
    throw new Error(`Missing required CSV columns: ${missing.join(', ')}`)
  }

  return result.data.map((row) => ({
    name: row.name?.trim() ?? '',
    url: row.url?.trim() ?? '',
    description: row.description?.trim() ?? '',
    category:
      CATEGORIES.find(
        (c) => normalizeCategoryName(c) === normalizeCategoryName(row.category ?? '')
      ) ?? 'CI/CD',
    iconSlug: row.iconslug?.trim() ?? '',
    customLogoUrl: row.customlogourl?.trim() || null,
    accentColor: row.accentcolor?.trim() || DEFAULT_ACCENT_COLOR,
    healthCheckUrl: row.healthcheckurl?.trim() || null,
    teams: row.teams
      ? row.teams.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [],
  }))
}

export function parseJSONToApps(jsonText: string): AppImportRow[] {
  const parsed = JSON.parse(jsonText)
  const arr = Array.isArray(parsed) ? parsed : [parsed]

  return arr.map((item: Record<string, unknown>) => ({
    name: String(item.name ?? '').trim(),
    url: String(item.url ?? '').trim(),
    description: String(item.description ?? '').trim(),
    category:
      CATEGORIES.find((c) => c === item.category) ?? 'CI/CD',
    iconSlug: String(item.iconSlug ?? item.iconslug ?? '').trim(),
    customLogoUrl: item.customLogoUrl ? String(item.customLogoUrl) : null,
    accentColor: String(item.accentColor ?? item.accentcolor ?? DEFAULT_ACCENT_COLOR).trim(),
    healthCheckUrl: item.healthCheckUrl ? String(item.healthCheckUrl) : null,
    teams: Array.isArray(item.teams)
      ? (item.teams as unknown[]).map(String).filter(Boolean)
      : [],
  }))
}
