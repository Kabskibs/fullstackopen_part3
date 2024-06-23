const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('enter a password')
  process.exit(1)
}

const password = process.argv[2]
const dbName = 'phonebook'

const url = `mongodb+srv://kabsdev:${password}@fullstackopen-part3-db.bwxwuyw.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=fullstackopen-part3-db`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// Get all persons from db
if (process.argv.length === 3) {
  Person.find({}).then(result => {
    result.forEach(p => {
      console.log(p.name, p.number)
    })
    mongoose.connection.close()
  })
}

// Add person to db
if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]
  const person = new Person({
    name: name,
    number: number,
  })
  person.save().then(() => {
    console.log(`Added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}
/* const person = new Person({
    name: "Arto Hellas",
    number: 040-123456,
})

person.save().then(result => {
    console.log('person saved!')
    mongoose.connection.close()
})
 */
