import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableExercise({ id, exercise, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <button {...attributes} {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing text-lg select-none">
        ⠿
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{exercise.exercise?.name ?? 'Exercice'}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
        <label>Séries</label>
        <input type="number" min={1} value={exercise.sets}
          onChange={e => onUpdate('sets', +e.target.value)}
          className="w-11 border rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <label>Reps</label>
        <input value={exercise.reps}
          onChange={e => onUpdate('reps', e.target.value)}
          className="w-14 border rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <label>Repos</label>
        <input type="number" min={0} step={15} value={exercise.rest_seconds}
          onChange={e => onUpdate('rest_seconds', +e.target.value)}
          className="w-14 border rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400" />
        <span>s</span>
      </div>
      <button onClick={onRemove} className="text-red-300 hover:text-red-500 text-sm ml-1">✕</button>
    </div>
  )
}
