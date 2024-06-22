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

/* let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendick",
        "number": "39-23-6423122"
    }
] */

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

app.post('/api/persons', (request, response) => {
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
})

// Doesn't work, find out why
app.put('/api/persons/:id', (request, response, next) => {
    const reqBody = request.body
    const updatedBody = {
        name: reqBody.name,
        number: reqBody.number
    }
    Phonebook.findByIdAndUpdate(request.params.id, updatedBody, { new: true })
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
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})