import { Link } from 'react-router-dom'
import { Button } from '../UI/Button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 text-6xl">✈️</div>
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Nenhuma viagem ainda</h2>
      <p className="mb-6 text-gray-500">Planeje sua primeira aventura com IA!</p>
      <Link to="/plan"><Button>Criar roteiro</Button></Link>
    </div>
  )
}
