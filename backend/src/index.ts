import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { itinerariesRouter } from './routes/itineraries'
import { pdfRouter } from './routes/pdf'
import { imagesRouter } from './routes/images'

export const app = express()

app.set('trust proxy', 1)
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }))

app.use('/api/itineraries', itinerariesRouter)
app.use('/api/itineraries', pdfRouter)

app.use('/api/images', imagesRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
}
