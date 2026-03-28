import { GoogleGenerativeAI } from '@google/generative-ai'
import { ItineraryContent } from '../types'

interface GenerateInput {
  destination: string
  start_date: string
  end_date: string
  budget: 'economico' | 'moderado' | 'luxo'
  interests: string[]
  transport?: string | string[]
  accommodation?: string
  people_count?: number
  checkin_time?: string
  checkout_time?: string
  origin?: string
  notes?: string
}

const BUDGET_DESCRIPTIONS: Record<string, string> = {
  economico: 'econômico = hostels e transporte público',
  moderado: 'moderado = hotéis 3★ e táxi',
  luxo: 'luxo = hotéis 5★ e transfer',
}

export async function generateItinerary(input: GenerateInput): Promise<ItineraryContent> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

  const extras = [
    input.transport     ? `- Transporte: ${Array.isArray(input.transport) ? input.transport.join(', ') : input.transport}` : null,
    input.accommodation ? `- Hospedagem: ${input.accommodation}` : null,
    input.people_count  ? `- Número de pessoas: ${input.people_count}` : null,
    input.checkin_time  ? `- Horário de check-in: ${input.checkin_time}` : null,
    input.checkout_time ? `- Horário de check-out: ${input.checkout_time}` : null,
    input.origin        ? `- Cidade de origem: ${input.origin}` : null,
    input.notes         ? `- Observações do viajante: ${input.notes}` : null,
  ].filter(Boolean).join('\n')

  const prompt = `Você é um especialista em planejamento de viagens. Gere um roteiro detalhado em JSON válido para a seguinte viagem:

- Destino: ${input.destination}
- Data de início: ${input.start_date}
- Data de fim: ${input.end_date}
- Orçamento: ${BUDGET_DESCRIPTIONS[input.budget]}
- Interesses: ${input.interests.join(', ')}
${extras ? extras + '\n' : ''}
Leve em conta o meio de transporte, tipo de hospedagem e número de pessoas ao sugerir atividades, horários e logística.

Responda APENAS com um JSON válido no seguinte formato, sem markdown, sem explicações:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "HH:MM",
          "title": "Nome da atividade",
          "description": "Descrição detalhada em 2-3 frases",
          "location": {
            "name": "Nome do local",
            "address": "Endereço completo",
            "mapsUrl": "https://maps.google.com/?q=Nome+do+local"
          }
        }
      ]
    }
  ]
}

Inclua de 3 a 5 atividades por dia. Respeite o orçamento e os interesses informados.`

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini timeout after 25 seconds')), 25000)
  )

  const result = await Promise.race([
    model.generateContent(prompt),
    timeoutPromise,
  ])
  let text = result.response.text().trim()

  // Strip markdown code fences if present (e.g. ```json ... ```)
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    return JSON.parse(text) as ItineraryContent
  } catch {
    console.error('Gemini raw response:', text.slice(0, 500))
    throw new Error('Invalid JSON from Gemini')
  }
}
