require('dotenv').config({ override: true })
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const Note = require('./models/note')


mongoose
  .connect(process.env.TEST_MONGODB_URI, { family: 4 })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
]

initialNotes.forEach(note => {
  new Note(note).save()
})
