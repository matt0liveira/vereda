import { Link } from 'react-router-dom'
import { Button } from '../components/UI/Button'

export default function LandingPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-7xl">✈️</div>
      <h1 className="mb-4 text-5xl font-bold text-gray-900">
        Planeje sua viagem <span className="text-blue-600">com IA</span>
      </h1>
      <p className="mb-8 max-w-xl text-lg text-gray-600">
        Preencha suas preferências e receba um roteiro personalizado dia a dia, editável e exportável como PDF.
      </p>
      <div className="flex gap-4">
        <Link to="/auth">
          <Button className="px-8 py-3 text-lg">Começar agora</Button>
        </Link>
        <Link to="/auth">
          <Button variant="secondary" className="px-8 py-3 text-lg">Entrar</Button>
        </Link>
      </div>
      <div className="mt-16 grid max-w-3xl gap-8 sm:grid-cols-3">
        {[
          { icon: '🤖', title: 'IA Generativa', desc: 'Roteiros criados pelo Gemini, adaptados ao seu estilo.' },
          { icon: '✏️', title: 'Editável', desc: 'Ajuste atividades inline antes de salvar.' },
          { icon: '📄', title: 'Exporta em PDF', desc: 'Leve seu roteiro offline com endereços e mapas.' },
        ].map(f => (
          <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">{f.icon}</div>
            <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
