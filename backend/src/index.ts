import express from 'express'
import cors from 'cors'
import { itinerariesRouter } from './routes/itineraries'
import { pdfRouter } from './routes/pdf'

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/itineraries', itinerariesRouter)
app.use('/api/itineraries', pdfRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
}
