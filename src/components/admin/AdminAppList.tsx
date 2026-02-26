'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import type { App } from '@/types/app'
import { AdminAppRow } from './AdminAppRow'

interface AdminAppListProps {
  apps: App[]
  onEdit: (app: App) => void
  onDelete: (id: string) => void
  onReorder: (apps: App[]) => void
}

export function AdminAppList({ apps, onEdit, onDelete, onReorder }: AdminAppListProps) {
  const [items, setItems] = useState<App[]>(apps)

  // Sync when parent apps change (after add, delete, or import)
  useEffect(() => {
    setItems(apps)
  }, [apps])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = items.findIndex((a) => a.id === active.id)
    const newIdx = items.findIndex((a) => a.id === over.id)
    const reordered = arrayMove(items, oldIdx, newIdx).map((a, i) => ({
      ...a,
      order: i,
    }))

    setItems(reordered)
    onReorder(reordered)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-white/30 font-mono text-sm">
        No apps yet. Add one to get started.
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((app) => (
            <AdminAppRow
              key={app.id}
              app={app}
              onEdit={() => onEdit(app)}
              onDelete={() => onDelete(app.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
