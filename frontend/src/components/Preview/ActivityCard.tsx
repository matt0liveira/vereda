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
    <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="min-w-[52px] text-sm font-bold text-orange-500">{activity.time}</div>
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            className="mb-1 w-full rounded border border-blue-300 px-2 py-1 text-base font-semibold outline-none focus:border-blue-500"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={commitTitle}
            autoFocus
          />
        ) : (
          <h3
            className="mb-1 cursor-pointer rounded text-base font-semibold text-gray-900 hover:bg-blue-50 px-1 -ml-1"
            onClick={() => setEditingTitle(true)}
            title="Clique para editar"
          >{title}</h3>
        )}

        {editingDesc ? (
          <textarea
            className="mb-2 w-full rounded border border-blue-300 px-2 py-1 text-sm text-gray-600 outline-none focus:border-blue-500"
            value={description}
            rows={3}
            onChange={e => setDescription(e.target.value)}
            onBlur={commitDesc}
            autoFocus
          />
        ) : (
          <p
            className="mb-2 cursor-pointer rounded text-sm text-gray-600 hover:bg-blue-50 px-1 -ml-1"
            onClick={() => setEditingDesc(true)}
            title="Clique para editar"
          >{description}</p>
        )}

        <div className="text-xs text-gray-400">
          <span>📍 {activity.location.name} — {activity.location.address}</span>
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
