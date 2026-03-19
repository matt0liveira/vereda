import { Link } from 'react-router-dom'

function MapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )
}

export function Landing() {
  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Hero */}
      <div className="bg-gradient-to-b from-surface-bg to-[#FFF1E4] px-4 pb-16 pt-20 text-center">
        {/* Badge */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#F9C49A] bg-brand-muted px-4 py-1.5 text-xs font-semibold tracking-[0.3px] text-brand-muted-text">
          <MapIcon />
          Planejamento inteligente de viagens
        </div>

        <h1 className="mb-4 text-[50px] font-extrabold leading-[1.12] tracking-[-2px] text-content">
          Seu próximo roteiro,<br />
          <span className="text-brand">criado em segundos</span>
        </h1>

        <p className="mx-auto mb-10 max-w-[460px] text-[17px] leading-[1.65] text-content-muted">
          Diga seu destino, estilo e duração. A Vereda monta um roteiro dia a dia personalizado, editável e exportável em PDF.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/auth"
            className="rounded-[10px] bg-brand px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-dark"
          >
            Planejar agora
          </Link>
          <Link
            to="/auth"
            className="rounded-[10px] border-[1.5px] border-surface-border bg-surface px-7 py-3.5 text-[15px] font-bold text-content transition-colors hover:border-surface-border-filled"
          >
            Criar conta
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-[14px] border-[1.5px] border-surface-border bg-surface p-6">
            <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                stroke="#C2410C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-sm font-bold text-content">Roteiros personalizados</h3>
            <p className="text-[13px] leading-[1.55] text-content-muted">
              Roteiros gerados automaticamente, adaptados ao seu estilo, ritmo e preferências de viagem.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-[14px] border-[1.5px] border-surface-border bg-surface p-6">
            <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                stroke="#C2410C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-sm font-bold text-content">100% Editável</h3>
            <p className="text-[13px] leading-[1.55] text-content-muted">
              Ajuste atividades, horários e descrições antes de exportar. O roteiro é seu.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-[14px] border-[1.5px] border-surface-border bg-surface p-6">
            <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                stroke="#C2410C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3 className="mb-1.5 text-sm font-bold text-content">Exporta em PDF</h3>
            <p className="text-[13px] leading-[1.55] text-content-muted">
              Leve seu roteiro offline com endereços e mapas inclusos, pronto para a viagem.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
