import 'dotenv/config'
import { createApp } from './app.js'
import { connectDb } from './lib/db.js'

const PORT = Number(process.env.PORT ?? 4000)

async function main() {
  await connectDb(process.env.MONGODB_URI!)
  const app = createApp()
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('Fatal startup error', err)
  process.exit(1)
})
