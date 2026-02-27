'use client'

import { useState } from 'react'
import type { App, AppCreateInput } from '@/types/app'
import { CATEGORIES } from '@/types/app'
import { AppCard } from '@/components/catalog/AppCard'
import { cn } from '@/lib/cn'

interface AppFormProps {
  initialData?: App
  onSave: (app: App) => void
  onCancel: () => void
}

const DEFAULT_FORM: AppCreateInput = {
  name: '',
  url: '',
  description: '',
  category: 'CI/CD',
  iconSlug: '',
  customLogoUrl: null,
  accentColor: '#00e5ff',
  healthCheckUrl: null,
  teams: [],
}

// Map common app names → Simple Icons slugs for auto-suggest
const SLUG_HINTS: Record<string, string> = {
  gitlab: 'gitlab',
  github: 'github',
  grafana: 'grafana',
  prometheus: 'prometheus',
  redis: 'redis',
  kafka: 'apachekafka',
  vault: 'vault',
  argocd: 'argo',
  'argo cd': 'argo',
  kibana: 'kibana',
  jaeger: 'jaeger',
  minio: 'minio',
  sonarqube: 'sonarqube',
  harbor: 'harbor',
  jenkins: 'jenkins',
  jira: 'jira',
  confluence: 'confluence',
  docker: 'docker',
  kubernetes: 'kubernetes',
  terraform: 'terraform',
  ansible: 'ansible',
  airflow: 'apacheairflow',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  mysql: 'mysql',
  mongodb: 'mongodb',
  elasticsearch: 'elasticsearch',
  nexus: 'sonatype',
  rancher: 'rancher',
  portainer: 'portainer',
}

function suggestSlug(name: string): string {
  const lower = name.toLowerCase().trim()
  for (const [key, slug] of Object.entries(SLUG_HINTS)) {
    if (lower.includes(key)) return slug
  }
  return lower.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
}

export function AppForm({ initialData, onSave, onCancel }: AppFormProps) {
  const [form, setForm] = useState<AppCreateInput>(
    initialData
      ? {
          name: initialData.name,
          url: initialData.url,
          description: initialData.description,
          category: initialData.category,
          iconSlug: initialData.iconSlug,
          customLogoUrl: initialData.customLogoUrl,
          accentColor: initialData.accentColor,
          healthCheckUrl: initialData.healthCheckUrl,
          teams: initialData.teams ?? [],
        }
      : DEFAULT_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (field: keyof AppCreateInput, value: string | string[] | null) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleNameChange = (name: string) => {
    update('name', name)
    // Auto-suggest icon slug if user hasn't manually changed it
    if (!form.iconSlug || form.iconSlug === suggestSlug(form.name)) {
      update('iconSlug', suggestSlug(name))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.url.trim()) { setError('URL is required'); return }

    try { new URL(form.url) } catch {
      setError('URL must be a valid URL (include https://)'); return
    }

    setSaving(true)
    try {
      const url = initialData ? `/api/apps/${initialData.id}` : '/api/apps'
      const method = initialData ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Save failed')
      } else {
        onSave(data.data)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Build a preview App object from form state
  const previewApp: App = {
    id: initialData?.id ?? 'preview',
    name: form.name || 'App Name',
    url: (() => { try { new URL(form.url); return form.url } catch { return 'https://example.com' } })(),
    description: form.description || 'App description goes here',
    category: form.category,
    iconSlug: form.iconSlug || '',
    customLogoUrl: form.customLogoUrl,
    accentColor: form.accentColor,
    healthCheckUrl: form.healthCheckUrl,
    teams: form.teams ?? [],
    order: 0,
    createdAt: new Date().toISOString(),
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
      {/* Form fields */}
      <div className="flex-1 space-y-4 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-white/50 mb-1.5">
              Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="input-base w-full"
              placeholder="GitLab"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-white/50 mb-1.5">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="input-base w-full"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-white/50 mb-1.5">
            URL *
          </label>
          <input
            value={form.url}
            onChange={(e) => update('url', e.target.value)}
            required
            type="url"
            className="input-base w-full"
            placeholder="https://service.internal.company.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-white/50 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={2}
            className="input-base w-full resize-none"
            placeholder="Short description of what this service does..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-white/50 mb-1.5">
              Icon Slug{' '}
              <a
                href="https://simpleicons.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent/60 hover:text-accent"
              >
                (simpleicons.org)
              </a>
            </label>
            <input
              value={form.iconSlug ?? ''}
              onChange={(e) => update('iconSlug', e.target.value)}
              className="input-base w-full"
              placeholder="gitlab"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-white/50 mb-1.5">
              Accent Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                className="h-9 w-10 rounded border border-border bg-transparent cursor-pointer"
              />
              <input
                value={form.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                className="input-base flex-1 font-mono"
                placeholder="#00e5ff"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-white/50 mb-1.5">
            Custom Logo URL <span className="text-white/25">(overrides icon slug)</span>
          </label>
          <input
            value={form.customLogoUrl ?? ''}
            onChange={(e) => update('customLogoUrl', e.target.value || null)}
            className="input-base w-full"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-white/50 mb-1.5">
            Health Check URL <span className="text-white/25">(optional, defaults to main URL)</span>
          </label>
          <input
            value={form.healthCheckUrl ?? ''}
            onChange={(e) => update('healthCheckUrl', e.target.value || null)}
            className="input-base w-full"
            placeholder="https://service.internal.company.com/health"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-white/50 mb-1.5">
            Team Visibility <span className="text-white/25">(comma-separated; leave empty for everyone)</span>
          </label>
          <input
            value={(form.teams ?? []).join(', ')}
            onChange={(e) =>
              update(
                'teams',
                e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
              )
            }
            className="input-base w-full"
            placeholder="platform-team, backend-team"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs font-mono bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30
              text-accent font-mono text-sm hover:bg-accent/20 hover:border-accent/50
              transition-all duration-150 disabled:opacity-50"
          >
            {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create App'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg glass-card border border-border
              text-white/50 font-mono text-sm hover:text-white/80 hover:border-border-hover
              transition-all duration-150"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="lg:w-64 flex-shrink-0">
        <p className="text-[11px] font-mono text-white/30 uppercase tracking-wider mb-3">
          Live Preview
        </p>
        <div className="pointer-events-none">
          <AppCard app={previewApp} index={0} />
        </div>
      </div>
    </form>
  )
}
