'use client'

import { useState } from 'react'
import type { App } from '@/types/app'
import { AppForm } from './AppForm'
import { AdminAppList } from './AdminAppList'
import { BulkImport } from './BulkImport'
import { ExportButton } from './ExportButton'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/providers/ToastProvider'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'

interface AdminDashboardProps {
  initialApps: App[]
}

type Tab = 'apps' | 'import'

export function AdminDashboard({ initialApps }: AdminDashboardProps) {
  const [apps, setApps] = useState<App[]>(initialApps)
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('apps')
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  const handleAppSaved = (app: App) => {
    setApps((prev) => {
      const idx = prev.findIndex((a) => a.id === app.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = app
        return updated
      }
      return [...prev, app]
    })
    setEditingApp(null)
    setShowAddForm(false)
    toast(`${app.name} saved`, 'success')
  }

  const handleDelete = async (id: string) => {
    const app = apps.find((a) => a.id === id)
    if (!confirm(`Delete "${app?.name}"? This cannot be undone.`)) return

    const res = await fetch(`/api/apps/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setApps((prev) => prev.filter((a) => a.id !== id))
      toast('App deleted', 'success')
    } else {
      toast('Failed to delete app', 'error')
    }
  }

  const handleReorder = async (reorderedApps: App[]) => {
    setApps(reorderedApps)
    const res = await fetch('/api/apps/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reorderedApps.map((a) => a.id) }),
    })
    if (!res.ok) {
      toast('Failed to save order', 'error')
    }
  }

  const handleImportDone = (newApps: App[]) => {
    setApps((prev) => [...prev, ...newApps])
    setActiveTab('apps')
    toast(`Imported ${newApps.length} apps`, 'success')
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-mono text-2xl font-bold text-white/90">
            App Catalog <span className="text-accent">//</span> Admin
          </h1>
          <p className="text-white/35 text-sm font-sans mt-1">
            {apps.length} registered services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton apps={apps} />
          <button
            onClick={() => {
              setEditingApp(null)
              setShowAddForm(true)
            }}
            className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30
              text-accent font-mono text-sm hover:bg-accent/20 hover:border-accent/50
              transition-all duration-150 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add App
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg glass-card text-white/40
              hover:text-white/70 font-mono text-xs transition-all border border-transparent
              hover:border-border"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(['apps', 'import'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 font-mono text-sm border-b-2 -mb-px transition-all',
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-white/40 hover:text-white/70'
            )}
          >
            {tab === 'apps' ? `Apps (${apps.length})` : 'Bulk Import'}
          </button>
        ))}
      </div>

      {activeTab === 'apps' && (
        <AdminAppList
          apps={apps}
          onEdit={(app) => {
            setEditingApp(app)
            setShowAddForm(false)
          }}
          onDelete={handleDelete}
          onReorder={handleReorder}
        />
      )}

      {activeTab === 'import' && (
        <BulkImport onImportDone={handleImportDone} />
      )}

      {/* Add / Edit modal */}
      <Modal
        open={showAddForm || editingApp !== null}
        onClose={() => {
          setShowAddForm(false)
          setEditingApp(null)
        }}
        title={editingApp ? `Edit: ${editingApp.name}` : 'Add New App'}
        size="xl"
      >
        <AppForm
          initialData={editingApp ?? undefined}
          onSave={handleAppSaved}
          onCancel={() => {
            setShowAddForm(false)
            setEditingApp(null)
          }}
        />
      </Modal>
    </div>
  )
}
