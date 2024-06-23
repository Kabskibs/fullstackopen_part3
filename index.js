require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const Phonebook = require('./models/mongo_phonebook')
const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('req-body', request => {
  return JSON.stringify(request.body)
})

app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :req-body'
))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', async (request, response) => {
  const totalCount = await Phonebook.countDocuments({})
  const currentDate = new Date()
  response.send(
    `<p>Phonebook has info for ${totalCount} people</p>
        <p>${currentDate}</p>`
  )
})

app.get('/api/persons', (request, response) => {
  Phonebook.find({})
    .then(result => {
      if (result) {
        response.json(result)
      } else {
        response.status(404).end()
      }
    })
})


app.get('/api/persons/:id', (request, response, next) => {
  Phonebook.findById(request.params.id)
    .then(result => {
      if (result) {
        response.json(result)
      } else {
        response.status(404).json({ error: 'id not found' }).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (body.name === undefined) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  /* if (persons.some(p => p.name === body.name)) {
        return response.status(409).json({
            error: 'name must be unique'
        })
    } */
  const person = new Phonebook({
    name: body.name,
    number: body.number,
  })
  person.save()
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Phonebook.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(result => {
      if (result) {
        response.status(200).json(result)
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Phonebook.findByIdAndDelete(request.params.id)
    .then(result => {
      if (result) {
        response.status(200).json(result)
      } else {
        response.status(204).end()
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})