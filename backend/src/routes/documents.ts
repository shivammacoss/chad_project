import { Router } from 'express'
import { createReadStream } from 'node:fs'
import { Application } from '../models/Application.js'
import { DocumentModel } from '../models/Document.js'
import { upload } from '../middleware/upload.js'
import { requireAuth } from '../middleware/auth.js'

export const documentsRouter = Router({ mergeParams: true })
documentsRouter.use(requireAuth)

function appId(req: { params: Record<string, string> }) {
  return (req.params as { id: string }).id
}

documentsRouter.post('/', upload.single('file'), async (req, res) => {
  const application = await Application.findOne({ _id: appId(req), userId: req.userId })
  if (!application) return res.status(404).json({ error: 'Application not found' })
  if (!req.file) return res.status(400).json({ error: 'file required (jpg/png/webp/pdf, <=10MB)' })
  const type = ['passport', 'address_proof', 'photo', 'other'].includes(req.body?.type) ? req.body.type : 'other'
  const doc = await DocumentModel.create({
    applicationId: application._id,
    userId: req.userId,
    ownerName: req.body?.ownerName ?? '',
    type,
    fileName: req.file.originalname,
    storagePath: req.file.path,
  })
  res.status(201).json(doc)
})

documentsRouter.get('/', async (req, res) => {
  const application = await Application.findOne({ _id: appId(req), userId: req.userId })
  if (!application) return res.status(404).json({ error: 'Application not found' })
  const docs = await DocumentModel.find({ applicationId: application._id }).sort({ uploadedAt: 1 })
  res.json(docs)
})

documentsRouter.get('/:docId/file', async (req, res) => {
  const doc = await DocumentModel.findById(req.params.docId)
  if (!doc) return res.status(404).json({ error: 'Not found' })
  const isOwner = String(doc.userId) === req.userId
  const isAdmin = req.userRole === 'admin'
  if (!isOwner && !isAdmin) return res.status(404).json({ error: 'Not found' })
  const stream = createReadStream(doc.storagePath)
  stream.pipe(res)
  stream.on('error', () => {
    if (!res.headersSent) res.status(404).json({ error: 'File missing' })
  })
})
