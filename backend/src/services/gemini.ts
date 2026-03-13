import { GoogleGenerativeAI } from '@google/generative-ai'
import { ItineraryContent } from '../types'

interface GenerateInput {
  destination: string
  start_date: string
  end_date: string
  budget: 'economico' | 'moderado' | 'luxo'
  interests: string[]
}

const BUDGET_DESCRIPTIONS: Record<string, string> = {
  economico: 'econômico = hostels e transporte público',
  moderado: 'moderado = hotéis 3★ e táxi',
  luxo: 'luxo = hotéis 5★ e transfer',
}

export async function generateItinerary(input: GenerateInput): Promise<ItineraryContent> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Você é um especialista em planejamento de viagens. Gere um roteiro detalhado em JSON válido para a seguinte viagem:

- Destino: ${input.destination}
- Data de início: ${input.start_date}
- Data de fim: ${input.end_date}
- Orçamento: ${BUDGET_DESCRIPTIONS[input.budget]}
- Interesses: ${input.interests.join(', ')}

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

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  try {
    return JSON.parse(text) as ItineraryContent
  } catch {
    throw new Error('Invalid JSON from Gemini')
  }
}
