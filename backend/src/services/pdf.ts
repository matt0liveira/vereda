import PDFDocument from 'pdfkit'
import { Itinerary } from '../types'

const BRAND   = '#EA580C'
const DARK    = '#1C1917'
const MUTED   = '#78716C'
const SUBTLE  = '#A8A29E'
const LIGHT   = '#F5F5F4'
const DIVIDER = '#E7E5E4'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const BUDGET_LABELS: Record<string, string> = {
  economico: 'Econômico',
  moderado:  'Moderado',
  luxo:      'Luxo',
}

export async function generatePdf(itinerary: Itinerary): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: 'A4', info: { Title: itinerary.title } })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = doc.page.width - 96 // usable width

    // ── Header bar ──────────────────────────────────────────
    doc.rect(48, 48, W, 56).fill(BRAND)

    doc.fillColor('#FFFFFF')
       .fontSize(20).font('Helvetica-Bold')
       .text(itinerary.title, 64, 58, { width: W - 32, lineBreak: false })

    const meta = [
      itinerary.destination,
      `${formatDate(itinerary.start_date)} — ${formatDate(itinerary.end_date)}`,
      BUDGET_LABELS[itinerary.budget] ?? itinerary.budget,
    ].join('   |   ')

    doc.fontSize(8).font('Helvetica')
       .text(meta, 64, 80, { width: W - 32, lineBreak: false })

    doc.moveDown(3.5)

    // ── Days ────────────────────────────────────────────────
    for (const day of itinerary.content.days) {
      if (doc.y > doc.page.height - 120) doc.addPage()

      const dayY = doc.y

      // Day heading accent bar
      doc.rect(48, dayY, 4, 22).fill(BRAND)

      doc.fillColor(DARK).fontSize(13).font('Helvetica-Bold')
         .text(`Dia ${day.day}  —  ${formatDate(day.date)}`, 60, dayY + 3, { width: W - 12 })

      doc.moveDown(0.6)

      for (const act of day.activities) {
        if (doc.y > doc.page.height - 100) doc.addPage()

        const actY = doc.y

        // Activity card background
        doc.rect(48, actY, W, 1).fill(DIVIDER)
        doc.moveDown(0.15)

        const rowY = doc.y

        // Time pill
        doc.roundedRect(48, rowY, 44, 16, 4).fill(LIGHT)
        doc.fillColor(BRAND).fontSize(8).font('Helvetica-Bold')
           .text(act.time, 48, rowY + 4, { width: 44, align: 'center' })

        // Title
        doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold')
           .text(act.title, 100, rowY, { width: W - 52 })

        doc.moveDown(0.25)

        // Description
        doc.fillColor(MUTED).fontSize(9).font('Helvetica')
           .text(act.description, 100, doc.y, { width: W - 52 })

        doc.moveDown(0.2)

        // Location
        doc.fillColor(SUBTLE).fontSize(8)
           .text(`${act.location.name}  ·  ${act.location.address}`, 100, doc.y, { width: W - 52 })

        doc.moveDown(0.6)
      }

      doc.moveDown(0.8)
    }

    // ── Footer ──────────────────────────────────────────────
    const footerY = doc.page.height - 36
    doc.rect(48, footerY - 8, W, 0.5).fill(DIVIDER)
    doc.fillColor(SUBTLE).fontSize(8).font('Helvetica')
       .text('Gerado pela Vereda', 48, footerY, { width: W, align: 'center' })

    doc.end()
  })
}
