const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const cors = require('cors')

const app = express()
app.use(express.json())

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:3000',
      'https://movies.com',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.disable('x-powered-by')

/**
 * El CORS rompe segun el metodo
 * Tenemos metodos 'normales' -> get/head/post
 * Metodos complejos: put /patch/delete, estos usan el cors pre flight
 * que requiere una peticion especial que se llama OPTIONS que lo que hace es
 * preguntarle a la API
*/

app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(m =>
      m.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
    return res.json(filteredMovies)
  }

  res.json(movies)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(m => m.id === id)
  if (movie) return res.json(movie)

  res.status(404).send({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  if (result.error) {
    return res.status(404).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(), // crea un id v4
    ...result.data
  }

  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (result.error) {
    return res.status(404).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(m => m.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie
  return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
