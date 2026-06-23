import { Router } from 'express'
import { Formation } from '../models/Formation.js'
import { DocumentModel } from '../models/Document.js'
import { upload } from '../middleware/upload.js'
import { requireAuth } from '../middleware/auth.js'

// mergeParams so :id (formation id) from the parent mount is visible here
export const documentsRouter = Router({ mergeParams: true })
documentsRouter.use(requireAuth)

async function ownedFormation(userId: string | undefined, id: string) {
  return Formation.findOne({ _id: id, userId })
}

documentsRouter.post('/', upload.single('file'), async (req, res) => {
  const { id } = req.params as { id: string }
  const formation = await ownedFormation(req.userId, id)
  if (!formation) return res.status(404).json({ error: 'Formation not found' })
  if (!req.file) return res.status(400).json({ error: 'file required (jpg/png/webp/pdf, <=10MB)' })
  const type = ['passport', 'address_proof', 'photo', 'other'].includes(req.body?.type)
    ? req.body.type
    : 'other'

  const doc = await DocumentModel.create({
    formationId: formation._id,
    userId: req.userId,
    type,
    fileName: req.file.originalname,
    storagePath: req.file.path,
  })
  res.status(201).json(doc)
})

documentsRouter.get('/', async (req, res) => {
  const { id } = req.params as { id: string }
  const formation = await ownedFormation(req.userId, id)
  if (!formation) return res.status(404).json({ error: 'Formation not found' })
  const docs = await DocumentModel.find({ formationId: formation._id }).sort({ uploadedAt: 1 })
  res.json(docs)
})
