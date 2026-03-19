import { useState } from 'react'
import { Activity } from '../../types'
import { Button } from '../UI/Button'

interface ActivityCardProps {
  activity: Activity
  onUpdate: (id: string, changes: Partial<{ title: string; description: string }>) => void
  onDelete: (id: string) => void
}

export function ActivityCard({ activity, onUpdate, onDelete }: ActivityCardProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [title, setTitle] = useState(activity.title)
  const [description, setDescription] = useState(activity.description)

  function commitTitle() {
    setEditingTitle(false)
    if (title !== activity.title) onUpdate(activity.id, { title })
  }

  function commitDesc() {
    setEditingDesc(false)
    if (description !== activity.description) onUpdate(activity.id, { description })
  }

  return (
    <div className="flex gap-4 rounded-xl border border-surface-border bg-white p-4 shadow-sm">
      <div className="min-w-[52px] text-sm font-bold text-brand">{activity.time}</div>
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            className="mb-1 w-full rounded border border-brand px-2 py-1 text-base font-semibold outline-none focus:border-brand"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={commitTitle}
            autoFocus
          />
        ) : (
          <h3
            className="mb-1 cursor-pointer rounded text-base font-semibold text-content hover:bg-brand-muted px-1 -ml-1"
            onClick={() => setEditingTitle(true)}
            title="Clique para editar"
          >{title}</h3>
        )}

        {editingDesc ? (
          <textarea
            className="mb-2 w-full rounded border border-brand px-2 py-1 text-sm text-content-muted outline-none focus:border-brand"
            value={description}
            rows={3}
            onChange={e => setDescription(e.target.value)}
            onBlur={commitDesc}
            autoFocus
          />
        ) : (
          <p
            className="mb-2 cursor-pointer rounded text-sm text-content-muted hover:bg-brand-muted px-1 -ml-1"
            onClick={() => setEditingDesc(true)}
            title="Clique para editar"
          >{description}</p>
        )}

        <div className="text-xs text-content-subtle flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{activity.location.name} — {activity.location.address}</span>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Button variant="danger" onClick={() => onDelete(activity.id)} className="text-xs px-2 py-1" aria-label="Excluir">
          ×
        </Button>
      </div>
    </div>
  )
}
