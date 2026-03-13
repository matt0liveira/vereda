import puppeteer from 'puppeteer-core'
import { Itinerary } from '../types'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function buildHtml(itinerary: Itinerary): string {
  const { title, destination, start_date, end_date, budget, content } = itinerary

  const budgetLabels: Record<string, string> = {
    economico: 'Econômico',
    moderado: 'Moderado',
    luxo: 'Luxo',
  }

  const daysHtml = content.days.map(day => {
    const activitiesHtml = day.activities.map(act => `
      <div class="activity">
        <div class="activity-time">${act.time}</div>
        <div class="activity-details">
          <h3>${act.title}</h3>
          <p>${act.description}</p>
          <div class="location">
            <strong>📍 ${act.location.name}</strong><br/>
            ${act.location.address}<br/>
            <span class="maps-url">${act.location.mapsUrl}</span>
          </div>
        </div>
      </div>
    `).join('')

    return `
      <div class="day">
        <h2>Dia ${day.day} — ${formatDate(day.date)}</h2>
        ${activitiesHtml}
      </div>
    `
  }).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #1e293b; }
    .header { border-bottom: 3px solid #2563EB; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { color: #2563EB; margin: 0 0 8px; font-size: 28px; }
    .header .meta { color: #64748b; font-size: 14px; }
    .day { margin-bottom: 32px; }
    .day h2 { color: #1D4ED8; border-left: 4px solid #F97316; padding-left: 12px; font-size: 18px; }
    .activity { display: flex; gap: 16px; margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; }
    .activity-time { font-weight: bold; color: #F97316; min-width: 50px; font-size: 14px; }
    .activity-details h3 { margin: 0 0 4px; font-size: 16px; }
    .activity-details p { margin: 0 0 8px; color: #475569; font-size: 14px; }
    .location { font-size: 12px; color: #64748b; }
    .maps-url { color: #2563EB; word-break: break-all; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; color: #94a3b8; font-size: 12px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">
      📍 ${destination} &nbsp;|&nbsp;
      📅 ${formatDate(start_date)} até ${formatDate(end_date)} &nbsp;|&nbsp;
      💰 ${budgetLabels[budget]}
    </div>
  </div>
  ${daysHtml}
  <div class="footer">Gerado pelo Travel AI</div>
</body>
</html>`
}

export async function generatePdf(itinerary: Itinerary): Promise<Buffer> {
  const isVercel = process.env.VERCEL === '1'

  let executablePath: string | undefined
  let args: string[] = []

  if (isVercel) {
    const chromium = await import('@sparticuz/chromium')
    executablePath = await chromium.default.executablePath()
    args = chromium.default.args
  }

  const browser = await puppeteer.launch({
    executablePath: executablePath || undefined,
    args: isVercel ? args : ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  })

  try {
    const page = await browser.newPage()
    await page.setContent(buildHtml(itinerary), { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
