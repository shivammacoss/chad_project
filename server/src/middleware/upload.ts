import multer from 'multer'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')
mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`)
  },
})

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED.includes(file.mimetype))
  },
})
