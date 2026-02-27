'use client'

import { useState } from 'react'
import type { Group } from '@/types/user'
import { cn } from '@/lib/cn'
import { useToast } from '@/components/providers/ToastProvider'
import { Modal } from '@/components/ui/Modal'

interface SafeUser {
  id: string
  email: string
  groups: string[]
  createdAt: string
}

interface UsersGroupsPanelProps {
  initialUsers: SafeUser[]
  initialGroups: Group[]
  oidcEnabled: boolean
  oidcAdminGroup: string | null
}

type Section = 'users' | 'groups'

// ── User Form ────────────────────────────────────────────────────────────────

function UserForm({
  user,
  groups,
  onSave,
  onCancel,
}: {
  user?: SafeUser
  groups: Group[]
  onSave: (u: SafeUser) => void
  onCancel: () => void
}) {
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>(user?.groups ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleGroup = (name: string) =>
    setSelectedGroups((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Email is required'); return }
    if (!user && password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      const body: Record<string, unknown> = { email, groups: selectedGroups }
      if (password) body.password = password

      const res = await fetch(user ? `/api/users/${user.id}` : '/api/users', {
        method: user ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-mono text-white/50 mb-1.5">Email *</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="input-base w-full"
          placeholder="user@example.com"
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-white/50 mb-1.5">
          Password{user ? ' (leave blank to keep current)' : ' *'}
        </label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required={!user}
          minLength={8}
          className="input-base w-full"
          placeholder={user ? '••••••••' : 'Min 8 characters'}
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-white/50 mb-1.5">Groups</label>
        {groups.length === 0 ? (
          <p className="text-white/30 text-xs font-mono">No groups defined yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGroup(g.name)}
                className={cn(
                  'px-3 py-1 rounded-full font-mono text-xs border transition-all',
                  selectedGroups.includes(g.name)
                    ? 'bg-accent/20 border-accent/50 text-accent'
                    : 'bg-transparent border-border text-white/40 hover:text-white/70'
                )}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
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
          {saving ? 'Saving…' : user ? 'Save Changes' : 'Create User'}
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
    </form>
  )
}

// ── Group Form ───────────────────────────────────────────────────────────────

function GroupForm({
  group,
  onSave,
  onCancel,
}: {
  group?: Group
  onSave: (g: Group) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(group?.name ?? '')
  const [description, setDescription] = useState(group?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Group name is required'); return }
    setSaving(true)
    try {
      const res = await fetch(group ? `/api/groups/${group.id}` : '/api/groups', {
        method: group ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-mono text-white/50 mb-1.5">Group Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input-base w-full"
          placeholder="platform-team"
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-white/50 mb-1.5">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-base w-full"
          placeholder="Short description of this group"
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
          {saving ? 'Saving…' : group ? 'Save Changes' : 'Create Group'}
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
    </form>
  )
}

// ── Main Panel ───────────────────────────────────────────────────────────────

export function UsersGroupsPanel({
  initialUsers,
  initialGroups,
  oidcEnabled,
  oidcAdminGroup,
}: UsersGroupsPanelProps) {
  const [users, setUsers] = useState<SafeUser[]>(initialUsers)
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [section, setSection] = useState<Section>('users')
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const { toast } = useToast()

  const handleUserSaved = (u: SafeUser) => {
    setUsers((prev) => {
      const idx = prev.findIndex((x) => x.id === u.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = u
        return next
      }
      return [...prev, u]
    })
    setEditingUser(null)
    setShowAddUser(false)
    toast(`User ${u.email} saved`, 'success')
  }

  const handleDeleteUser = async (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!confirm(`Delete user "${u?.email}"? This cannot be undone.`)) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers((prev) => prev.filter((x) => x.id !== id))
      toast('User deleted', 'success')
    } else {
      toast('Failed to delete user', 'error')
    }
  }

  const handleGroupSaved = (g: Group) => {
    setGroups((prev) => {
      const idx = prev.findIndex((x) => x.id === g.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = g
        return next
      }
      return [...prev, g]
    })
    setEditingGroup(null)
    setShowAddGroup(false)
    toast(`Group "${g.name}" saved`, 'success')
  }

  const handleDeleteGroup = async (id: string) => {
    const g = groups.find((x) => x.id === id)
    if (!confirm(`Delete group "${g?.name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setGroups((prev) => prev.filter((x) => x.id !== id))
      // Remove deleted group from local user state too
      setUsers((prev) =>
        prev.map((u) => ({ ...u, groups: u.groups.filter((grp) => grp !== g?.name) }))
      )
      toast(`Group "${g?.name}" deleted`, 'success')
    } else {
      toast('Failed to delete group', 'error')
    }
  }

  return (
    <div>
      {/* OIDC info banner */}
      {oidcEnabled && (
        <div className="mb-6 px-4 py-3 rounded-lg border border-accent/20 bg-accent/5 font-mono text-xs text-white/60 flex items-start gap-3">
          <svg className="mt-0.5 flex-shrink-0 text-accent" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <span>
            SSO / OIDC is <span className="text-accent">enabled</span>.
            {oidcAdminGroup
              ? <> Admin access is granted to the <span className="text-white/80">{oidcAdminGroup}</span> group from the identity provider.</>
              : <> Any authenticated OIDC user is granted admin access (no <code>OIDC_ADMIN_GROUP</code> set).</>}
            {' '}OIDC users&apos; group memberships are managed in your identity provider.
          </span>
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(['users', 'groups'] as Section[]).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={cn(
              'px-4 py-2 font-mono text-sm border-b-2 -mb-px transition-all capitalize',
              section === s
                ? 'border-accent text-accent'
                : 'border-transparent text-white/40 hover:text-white/70'
            )}
          >
            {s === 'users' ? `Local Users (${users.length})` : `Groups (${groups.length})`}
          </button>
        ))}
      </div>

      {/* ── Users section ── */}
      {section === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/35 text-sm font-sans">
              Local (non-OIDC) admin users authenticated via email and password.
            </p>
            <button
              onClick={() => { setEditingUser(null); setShowAddUser(true) }}
              className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30
                text-accent font-mono text-sm hover:bg-accent/20 hover:border-accent/50
                transition-all duration-150 flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add User
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-16 text-white/30 font-mono text-sm">
              No local users yet. The env-var admin account always works.
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg glass-card border border-border"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-white/90 truncate">{u.email}</p>
                    <p className="font-mono text-xs text-white/35 mt-0.5">
                      {u.groups.length > 0
                        ? u.groups.join(', ')
                        : 'No groups'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => { setEditingUser(u); setShowAddUser(false) }}
                      className="px-3 py-1.5 rounded font-mono text-xs border border-border
                        text-white/50 hover:text-white/80 hover:border-border-hover transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="px-3 py-1.5 rounded font-mono text-xs border border-red-500/20
                        text-red-400/70 hover:text-red-400 hover:border-red-500/40 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Groups section ── */}
      {section === 'groups' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/35 text-sm font-sans">
              Groups used for app team visibility. Assign these to apps and to local users.
              {oidcEnabled && ' OIDC group names from your provider can also be used directly in app team fields.'}
            </p>
            <button
              onClick={() => { setEditingGroup(null); setShowAddGroup(true) }}
              className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30
                text-accent font-mono text-sm hover:bg-accent/20 hover:border-accent/50
                transition-all duration-150 flex items-center gap-2 flex-shrink-0 ml-4"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-16 text-white/30 font-mono text-sm">
              No groups defined yet. Add a group to control app visibility by team.
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg glass-card border border-border"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-white/90">{g.name}</p>
                    {g.description && (
                      <p className="font-mono text-xs text-white/35 mt-0.5 truncate">{g.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => { setEditingGroup(g); setShowAddGroup(false) }}
                      className="px-3 py-1.5 rounded font-mono text-xs border border-border
                        text-white/50 hover:text-white/80 hover:border-border-hover transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(g.id)}
                      className="px-3 py-1.5 rounded font-mono text-xs border border-red-500/20
                        text-red-400/70 hover:text-red-400 hover:border-red-500/40 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit User Modal */}
      <Modal
        open={showAddUser || editingUser !== null}
        onClose={() => { setShowAddUser(false); setEditingUser(null) }}
        title={editingUser ? `Edit User: ${editingUser.email}` : 'Add New User'}
      >
        <UserForm
          user={editingUser ?? undefined}
          groups={groups}
          onSave={handleUserSaved}
          onCancel={() => { setShowAddUser(false); setEditingUser(null) }}
        />
      </Modal>

      {/* Add / Edit Group Modal */}
      <Modal
        open={showAddGroup || editingGroup !== null}
        onClose={() => { setShowAddGroup(false); setEditingGroup(null) }}
        title={editingGroup ? `Edit Group: ${editingGroup.name}` : 'Add New Group'}
      >
        <GroupForm
          group={editingGroup ?? undefined}
          onSave={handleGroupSaved}
          onCancel={() => { setShowAddGroup(false); setEditingGroup(null) }}
        />
      </Modal>
    </div>
  )
}
