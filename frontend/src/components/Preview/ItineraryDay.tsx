import { Day } from '../../types'
import { ActivityCard } from './ActivityCard'

interface ItineraryDayProps {
  day: Day
  dayIndex: number
  onUpdateActivity: (activityId: string, changes: Partial<{ title: string; description: string }>) => void
  onDeleteActivity: (dayIndex: number, activityId: string) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function ItineraryDay({ day, dayIndex, onUpdateActivity, onDeleteActivity }: ItineraryDayProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-content">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm text-white">
          {day.day}
        </span>
        <span>
          <span className="text-brand">Dia {day.day}</span>
          <span className="ml-2 text-base font-normal text-content-muted">{formatDate(day.date)}</span>
        </span>
      </h2>
      <div className="flex flex-col gap-3">
        {day.activities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onUpdate={onUpdateActivity}
            onDelete={(id) => onDeleteActivity(dayIndex, id)}
          />
        ))}
      </div>
    </div>
  )
}
